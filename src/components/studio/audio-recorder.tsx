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
  Zap,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { audioBufferToWav } from "@/lib/audio/wav-encoder";
import { formatDuration } from "@/lib/utils";
import { getFriendlyErrorMessage } from "@/lib/errors";

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
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isVoiceDetected, setIsVoiceDetected] = useState(false);
  const [voiceDynamics, setVoiceDynamics] = useState<
    "silent" | "gentle" | "clear" | "energetic"
  >("silent");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Physics animation state for smooth music-equalizer bars
  const smoothedHeightsRef = useRef<number[]>([]);
  const peakHeightsRef = useRef<number[]>([]);

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

  // Live music-equalizer waveform visualizer with real-time speech dynamics
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const bufferLength = analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);
    let lastStateUpdateTime = 0;

    const render = () => {
      if (!analyserRef.current || !canvasRef.current) return;

      analyser.getByteFrequencyData(freqData);
      analyser.getByteTimeDomainData(timeData);

      // 1. Calculate instant RMS audio volume for dynamic voice detection
      let sumSquares = 0;
      for (let i = 0; i < bufferLength; i++) {
        const norm = (timeData[i] - 128) / 128; // -1 to +1
        sumSquares += norm * norm;
      }
      const rms = Math.sqrt(sumSquares / bufferLength);
      const instantVolume = Math.min(100, Math.round(rms * 260));

      // 2. Classify speech dynamics: "ruk" (pause/silent), "slow" (gentle), "clear", "tej" (high energy)
      let dynamics: "silent" | "gentle" | "clear" | "energetic" = "silent";
      if (instantVolume >= 52) {
        dynamics = "energetic";
      } else if (instantVolume >= 22) {
        dynamics = "clear";
      } else if (instantVolume >= 6) {
        dynamics = "gentle";
      } else {
        dynamics = "silent";
      }

      const now = performance.now();
      if (now - lastStateUpdateTime > 80) {
        lastStateUpdateTime = now;
        setVolumeLevel(instantVolume);
        setIsVoiceDetected(instantVolume >= 6);
        setVoiceDynamics(dynamics);
      }

      // 3. High-DPI Canvas scaling
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth || 600;
      const displayHeight = canvas.clientHeight || 140;

      if (
        canvas.width !== Math.round(displayWidth * dpr) ||
        canvas.height !== Math.round(displayHeight * dpr)
      ) {
        canvas.width = Math.round(displayWidth * dpr);
        canvas.height = Math.round(displayHeight * dpr);
      }

      ctx.save();
      ctx.scale(dpr, displayHeight > 0 ? dpr : 1);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // Subtle center guideline behind equalizer
      ctx.strokeStyle = "rgba(228, 218, 203, 0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(12, displayHeight / 2);
      ctx.lineTo(displayWidth - 12, displayHeight / 2);
      ctx.stroke();

      // 4. Equalizer Bar geometry (Music Studio Waveform)
      const barWidth = 4;
      const gap = 3;
      const totalSlot = barWidth + gap; // 7px per bar
      const barCount = Math.max(12, Math.floor((displayWidth - 24) / totalSlot));
      const startX = (displayWidth - (barCount * totalSlot - gap)) / 2;
      const mid = Math.floor(barCount / 2);
      const hasVoice = instantVolume >= 6;

      // Ensure smoothed array size
      if (smoothedHeightsRef.current.length !== barCount) {
        smoothedHeightsRef.current = new Array(barCount).fill(4);
        peakHeightsRef.current = new Array(barCount).fill(4);
      }
      const smoothed = smoothedHeightsRef.current;
      const peaks = peakHeightsRef.current;

      for (let i = 0; i < barCount; i++) {
        // Human vocal acoustic mapping:
        // Speech core (vowels 300Hz-2kHz) in the center, harmonics & consonants (2kHz-4kHz) tapering out
        const distFromCenter = Math.abs(i - mid) / (mid || 1);
        const mappedBin = Math.floor(2 + (1 - Math.pow(distFromCenter, 1.2)) * 14 + distFromCenter * 24);
        const binIndex = Math.min(bufferLength - 1, Math.max(1, mappedBin));

        const freqVal = freqData[binIndex] || 0;
        const timeVal = Math.abs((timeData[(i * 3) % bufferLength] || 128) - 128) / 128;

        // Combined energy: frequency loudness + time wave ripple
        const rawEnergy = (freqVal / 255) * 0.75 + (instantVolume / 100) * 0.25;

        // Baseline resting idle wave when silent/paused
        const idleWave = Math.sin(now * 0.0035 + i * 0.2) * 1.5;
        const minHeight = 4 + (hasVoice ? 0 : idleWave);

        // Height targets based on vocal loudness:
        // Soft voice = 20-35px, Normal = 40-75px, Loud/High Energy = 80-120px
        let targetHeight = minHeight;
        if (hasVoice) {
          const vocalScale = displayHeight * 0.88;
          targetHeight = Math.max(
            minHeight,
            rawEnergy * vocalScale * (1 - distFromCenter * 0.3) + timeVal * 12
          );
        }

        // Fast responsive rise, smooth organic falloff (DAW music equalizer physics)
        if (targetHeight > smoothed[i]) {
          smoothed[i] += (targetHeight - smoothed[i]) * 0.72; // instant snappy attack
        } else {
          smoothed[i] += (targetHeight - smoothed[i]) * 0.26; // graceful decay
        }

        const barHeight = Math.max(3, Math.min(displayHeight - 8, smoothed[i]));
        const x = startX + i * totalSlot;
        const y = (displayHeight - barHeight) / 2;

        // Floating peak indicator
        if (barHeight > peaks[i]) {
          peaks[i] = barHeight;
        } else {
          peaks[i] = Math.max(barHeight, peaks[i] - 1.2);
        }

        // Gradient styling matching StoryKeeper warm palette
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (hasVoice) {
          if (dynamics === "energetic") {
            // Loud / Fast speech: Vibrant Terracotta to Saffron
            gradient.addColorStop(0, "#B5472B");
            gradient.addColorStop(0.5, "#E3A33B");
            gradient.addColorStop(1, "#B5472B");
          } else if (dynamics === "clear") {
            // Clear Voice: Emerald top with Terracotta body
            gradient.addColorStop(0, "#10B981");
            gradient.addColorStop(0.5, "#E3A33B");
            gradient.addColorStop(1, "#B5472B");
          } else {
            // Soft / Slow: Warm Saffron to Terracotta
            gradient.addColorStop(0, "#E3A33B");
            gradient.addColorStop(1, "#B5472B");
          }
        } else {
          // Paused / Silent: Subtle line color
          gradient.addColorStop(0, "rgba(209, 199, 183, 0.85)");
          gradient.addColorStop(1, "rgba(228, 218, 203, 0.7)");
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();

        // Music Equalizer: tiny floating peak dot above active bars
        if (hasVoice && barHeight > 14 && peaks[i] > barHeight + 2) {
          const peakY = (displayHeight - peaks[i]) / 2;
          ctx.fillStyle = dynamics === "energetic" ? "#B5472B" : "#10B981";
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, Math.max(3, peakY), 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  }, []);

  // Synchronize visualizer loop with recording state
  useEffect(() => {
    if (state === "recording") {
      drawWaveform();
    } else if (state === "paused") {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state, drawWaveform]);

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
      analyser.smoothingTimeConstant = 0.65; // Snappy musical reaction for speech cadence & pauses
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
    setVolumeLevel(0);
    setIsVoiceDetected(false);
    setVoiceDynamics("silent");
    smoothedHeightsRef.current = [];
    peakHeightsRef.current = [];
    setErrorMessage(null);
  };

  return (
    <div className="rounded-2xl border border-line bg-paper-2/40 p-6 sm:p-8 space-y-6">
      {/* Header status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {state === "recording" ? (
            voiceDynamics === "energetic" ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs font-semibold shadow-xs">
                <Zap className="w-3.5 h-3.5 fill-terracotta animate-pulse" />
                <span>Speaking &bull; High Energy (Loud)</span>
                <div className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-3.5 bg-terracotta rounded-full animate-bounce" />
                  <span
                    className="w-1 h-5 bg-terracotta rounded-full animate-bounce"
                    style={{ animationDelay: "100ms" }}
                  />
                  <span
                    className="w-1 h-3 bg-terracotta rounded-full animate-bounce"
                    style={{ animationDelay: "200ms" }}
                  />
                </div>
              </div>
            ) : voiceDynamics === "clear" ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span>Speaking &bull; Clear Voice</span>
                <div className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-3 bg-emerald-600 rounded-full animate-pulse" />
                  <span
                    className="w-1 h-4 bg-emerald-600 rounded-full animate-pulse"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1 h-2.5 bg-emerald-600 rounded-full animate-pulse"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            ) : voiceDynamics === "gentle" ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-saffron/15 border border-saffron/40 text-ink text-xs font-medium">
                <div className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
                <span>Speaking &bull; Soft Tone</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper-2 border border-line text-muted text-xs font-medium">
                <div className="w-2 h-2 rounded-full bg-muted/60" />
                <span>Silent (Paused) &bull; Awaiting Speech</span>
              </div>
            )
          ) : (
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  state === "paused"
                    ? "bg-saffron"
                    : state === "recorded"
                    ? "bg-moss"
                    : "bg-muted-foreground/40"
                }`}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {state === "paused"
                  ? "Recording paused"
                  : state === "recorded"
                  ? "Audio captured successfully"
                  : state === "requesting"
                  ? "Accessing microphone..."
                  : "Microphone ready"}
              </span>
            </div>
          )}
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
      <div className="relative h-32 sm:h-40 rounded-xl bg-paper border border-line flex items-center justify-center overflow-hidden shadow-inner p-2">
        {/* Live Audio Visualizer Canvas: ALWAYS mounted in DOM so canvasRef is ready */}
        <canvas
          ref={canvasRef}
          className={`w-full h-full transition-opacity duration-200 ${
            state === "recording" || state === "paused"
              ? "opacity-100 block"
              : "opacity-0 hidden"
          }`}
        />

        {/* Live Audio Spectrum Equalizer Badge inside Canvas corner when recording */}
        {state === "recording" && (
          <div className="absolute top-2.5 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-paper/90 border border-line/80 text-[10px] font-mono text-muted backdrop-blur-xs pointer-events-none shadow-xs">
            <Activity className="w-3 h-3 text-terracotta animate-pulse" />
            <span>Voice Spectrum &bull; {volumeLevel}%</span>
          </div>
        )}

        {/* Overlay for Recorded state */}
        {state === "recorded" && previewUrl && (
          <div className="absolute inset-0 px-6 flex flex-col items-center justify-center gap-3 bg-paper">
            <audio src={previewUrl} controls className="w-full max-w-md h-10" />
            <span className="text-xs text-muted-foreground">
              Preview your recording before saving
            </span>
          </div>
        )}

        {/* Overlay for Audio Encoding state */}
        {isProcessingWav && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs bg-paper">
            <Loader2 className="w-5 h-5 animate-spin text-terracotta" />
            <span>Encoding audio for transcription...</span>
          </div>
        )}

        {/* Overlay for Idle / Requesting states */}
        {(state === "idle" || state === "requesting") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs text-center px-4 bg-paper">
            <Mic className="w-6 h-6 text-terracotta/60" />
            <span>
              {state === "requesting" ? (
                "Accessing microphone..."
              ) : (
                <>
                  Click <strong>&ldquo;Start Recording&rdquo;</strong> to begin capturing your memory.
                </>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Live Audio Level (VU Meter) when recording */}
      {state === "recording" && (
        <div className="rounded-xl border border-line bg-paper px-4 py-2.5 flex items-center gap-3 shadow-xs">
          <Volume2
            className={`w-4 h-4 shrink-0 transition-colors ${
              isVoiceDetected ? "text-emerald-600" : "text-muted"
            }`}
          />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-medium">
              <span
                className={
                  voiceDynamics === "energetic"
                    ? "text-terracotta font-semibold"
                    : voiceDynamics === "clear"
                    ? "text-emerald-700 font-semibold"
                    : voiceDynamics === "gentle"
                    ? "text-ink font-medium"
                    : "text-muted"
                }
              >
                {voiceDynamics === "energetic"
                  ? "Microphone Input: Speaking (High Energy / Loud)"
                  : voiceDynamics === "clear"
                  ? "Microphone Input: Active Speech Detected"
                  : voiceDynamics === "gentle"
                  ? "Microphone Input: Soft / Whispering Speech"
                  : "Microphone Input: Silent / Paused (Awaiting Speech...)"}
              </span>
              <span className="font-mono text-muted text-[10px]">
                {volumeLevel}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-paper-2 overflow-hidden border border-line/60">
              <div
                className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-emerald-500 via-saffron to-terracotta"
                style={{ width: `${Math.max(4, volumeLevel)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Silence tip if user speaks too softly */}
      {state === "recording" && elapsedSec >= 4 && !isVoiceDetected && (
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            We haven&apos;t detected your voice yet. Please speak closer to your device or check your microphone settings.
          </span>
        </div>
      )}

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
          <span>
            {getFriendlyErrorMessage(
              errorMessage,
              "A microphone issue occurred. Please check permissions and try again."
            )}
          </span>
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
