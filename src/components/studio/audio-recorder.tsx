"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  Square,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { audioBufferToWav } from "@/lib/audio/wav-encoder";
import { formatDuration } from "@/lib/utils";

const MAX_DURATION_SEC = 15 * 60; // 15 minutes
const WARNING_DURATION_SEC = 14 * 60; // 14 minutes

interface AudioRecorderProps {
  onRecordingComplete: (file: File, durationSec: number) => void;
  disabled?: boolean;
}

export function AudioRecorder({
  onRecordingComplete,
  disabled = false,
}: AudioRecorderProps) {
  const [state, setState] = useState<
    "idle" | "requesting" | "recording" | "paused" | "recorded" | "denied" | "unsupported"
  >("idle");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessingWav, setIsProcessingWav] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStreams();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const cleanupStreams = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // Live waveform visualizer
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = 4;
      const gap = 2;
      const barCount = Math.floor(canvas.width / (barWidth + gap));
      const step = Math.floor(bufferLength / barCount) || 1;

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i * step] || 0;
        const percent = val / 255;
        const height = Math.max(4, percent * canvas.height * 0.85);
        const x = i * (barWidth + gap);
        const y = (canvas.height - height) / 2;

        // Gradient from terracotta to saffron
        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        gradient.addColorStop(0, "#B5472B");
        gradient.addColorStop(1, "#E3A33B");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  }, []);

  const startRecording = async () => {
    setErrorMessage(null);

    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setState("unsupported");
      return;
    }

    setState("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Audio context for live visualizer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Pick supported mime type
      let mimeType = "";
      const candidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg",
        "",
      ];

      for (const c of candidates) {
        if (!c || (window.MediaRecorder && MediaRecorder.isTypeSupported(c))) {
          mimeType = c;
          break;
        }
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        cleanupStreams();
        await processRecordedAudio();
      };

      recorder.start(250); // Slice every 250ms
      setState("recording");
      setElapsedSec(0);

      // Start elapsed timer
      timerRef.current = setInterval(() => {
        setElapsedSec((prev) => {
          const next = prev + 1;
          if (next >= MAX_DURATION_SEC) {
            stopRecording();
          }
          return next;
        });
      }, 1000);

      drawWaveform();
    } catch (err: any) {
      cleanupStreams();
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setState("denied");
      } else {
        setState("idle");
        setErrorMessage(
          err.message || "Failed to access microphone. Please check your settings."
        );
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && state === "recording") {
      mediaRecorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setState("paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && state === "paused") {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setElapsedSec((prev) => {
          const next = prev + 1;
          if (next >= MAX_DURATION_SEC) stopRecording();
          return next;
        });
      }, 1000);
      drawWaveform();
      setState("recording");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      (state === "recording" || state === "paused")
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const processRecordedAudio = async () => {
    setIsProcessingWav(true);
    try {
      const rawBlob = new Blob(chunksRef.current, {
        type: mediaRecorderRef.current?.mimeType || "audio/webm",
      });

      // Decode in browser and convert to 16kHz mono WAV
      const arrayBuffer = await rawBlob.arrayBuffer();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const tempCtx = new AudioCtx();
      const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
      await tempCtx.close();

      const wavBlob = audioBufferToWav(audioBuffer, 16000);
      const durationSec = Math.round(audioBuffer.duration * 10) / 10;

      const file = new File([wavBlob], `recording-${Date.now()}.wav`, {
        type: "audio/wav",
      });

      const url = URL.createObjectURL(wavBlob);
      setPreviewUrl(url);
      setState("recorded");

      onRecordingComplete(file, durationSec);
    } catch (err: any) {
      console.error("[WAV ENCODING ERROR]", err);
      // Fallback: use raw recorded blob
      const rawBlob = new Blob(chunksRef.current, {
        type: mediaRecorderRef.current?.mimeType || "audio/webm",
      });
      const file = new File([rawBlob], `recording-${Date.now()}.webm`, {
        type: rawBlob.type,
      });
      const url = URL.createObjectURL(rawBlob);
      setPreviewUrl(url);
      setState("recorded");
      onRecordingComplete(file, elapsedSec);
    } finally {
      setIsProcessingWav(false);
    }
  };

  const resetRecording = () => {
    cleanupStreams();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setState("idle");
    setElapsedSec(0);
    setErrorMessage(null);
  };

  return (
    <div className="rounded-2xl border border-line bg-paper-2/40 p-6 sm:p-8 space-y-6">
      {/* Header status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              state === "recording"
                ? "bg-red-500 animate-ping"
                : state === "paused"
                ? "bg-saffron"
                : state === "recorded"
                ? "bg-moss"
                : "bg-muted-foreground/40"
            }`}
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {state === "recording"
              ? "Recording in progress"
              : state === "paused"
              ? "Recording paused"
              : state === "recorded"
              ? "Audio captured successfully"
              : state === "requesting"
              ? "Accessing microphone..."
              : "Microphone ready"}
          </span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-sm font-semibold ${
              elapsedSec >= WARNING_DURATION_SEC ? "text-terracotta" : "text-ink"
            }`}
          >
            {formatDuration(elapsedSec)} / 15:00
          </span>
          {elapsedSec >= WARNING_DURATION_SEC && (
            <Badge variant="destructive" className="text-[10px]">
              Max duration near
            </Badge>
          )}
        </div>
      </div>

      {/* Waveform Canvas / Visualizer Box */}
      <div className="relative h-28 sm:h-36 rounded-xl bg-paper border border-line flex items-center justify-center overflow-hidden shadow-inner">
        {state === "recording" || state === "paused" ? (
          <canvas
            ref={canvasRef}
            width={600}
            height={140}
            className="w-full h-full"
          />
        ) : state === "recorded" && previewUrl ? (
          <div className="w-full px-6 flex flex-col items-center justify-center gap-3">
            <audio src={previewUrl} controls className="w-full max-w-md h-10" />
            <span className="text-xs text-muted-foreground">
              Preview your recording before saving
            </span>
          </div>
        ) : isProcessingWav ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-terracotta" />
            <span>Encoding audio for transcription...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs text-center px-4">
            <Mic className="w-6 h-6 text-terracotta/60" />
            <span>
              Click <strong>&ldquo;Start Recording&rdquo;</strong> to begin capturing your memory.
            </span>
          </div>
        )}
      </div>

      {/* Error Callouts */}
      {state === "denied" && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <div className="space-y-1">
            <strong className="block">Microphone Access Blocked</strong>
            <span>
              Please enable microphone permissions in your browser address bar to record audio directly.
            </span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {state === "idle" && (
          <Button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="bg-terracotta hover:bg-terracotta/90 text-white px-6 py-2.5 rounded-xl gap-2 shadow-sm"
          >
            <Mic className="w-4 h-4" />
            Start Recording
          </Button>
        )}

        {state === "recording" && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={pauseRecording}
              className="border-line text-ink gap-2"
            >
              <Pause className="w-4 h-4" />
              Pause
            </Button>
            <Button
              type="button"
              onClick={stopRecording}
              className="bg-terracotta hover:bg-terracotta/90 text-white gap-2 shadow-sm"
            >
              <Square className="w-4 h-4 fill-white" />
              Finish Recording
            </Button>
          </>
        )}

        {state === "paused" && (
          <>
            <Button
              type="button"
              variant="default"
              onClick={resumeRecording}
              className="bg-saffron text-ink hover:bg-saffron/90 gap-2"
            >
              <Play className="w-4 h-4 fill-ink" />
              Resume
            </Button>
            <Button
              type="button"
              onClick={stopRecording}
              className="bg-terracotta hover:bg-terracotta/90 text-white gap-2 shadow-sm"
            >
              <Square className="w-4 h-4 fill-white" />
              Finish Recording
            </Button>
          </>
        )}

        {state === "recorded" && (
          <Button
            type="button"
            variant="outline"
            onClick={resetRecording}
            className="border-line text-muted-foreground hover:text-ink gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Re-record Audio
          </Button>
        )}
      </div>
    </div>
  );
}
