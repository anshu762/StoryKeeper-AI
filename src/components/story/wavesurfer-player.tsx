"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface WavesurferPlayerProps {
  audioUrl: string;
  title: string;
  durationSec?: number | null;
  className?: string;
  sticky?: boolean;
}

export function WavesurferPlayer({
  audioUrl,
  title,
  durationSec,
  className,
  sticky = false,
}: WavesurferPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(durationSec || 0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Initialize wavesurfer.js
  useEffect(() => {
    let ws: any = null;

    async function initWaveSurfer() {
      if (!containerRef.current) return;

      try {
        const WaveSurfer = (await import("wavesurfer.js")).default;

        ws = WaveSurfer.create({
          container: containerRef.current,
          waveColor: "#E4DACB",
          progressColor: "#B5472B",
          cursorColor: "#5A3550",
          cursorWidth: 2,
          barWidth: 3,
          barRadius: 3,
          barGap: 3,
          height: 48,
          normalize: true,
          url: audioUrl,
        });

        ws.on("ready", () => {
          setIsReady(true);
          const dur = ws.getDuration();
          if (dur > 0) setTotalDuration(dur);
        });

        ws.on("audioprocess", () => {
          setCurrentTime(ws.getCurrentTime());
        });

        ws.on("seeking", () => {
          setCurrentTime(ws.getCurrentTime());
        });

        ws.on("play", () => setIsPlaying(true));
        ws.on("pause", () => setIsPlaying(false));
        ws.on("finish", () => {
          setIsPlaying(false);
          setCurrentTime(0);
        });

        ws.on("error", (err: any) => {
          console.warn("[WAVESURFER ERROR]", err);
          setHasError(true);
        });

        waveSurferRef.current = ws;
      } catch (err) {
        console.warn("[WAVESURFER INIT FAILED]", err);
        setHasError(true);
      }
    }

    initWaveSurfer();

    return () => {
      if (ws) {
        try {
          ws.destroy();
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    if (!waveSurferRef.current) return;
    waveSurferRef.current.playPause();
  }, []);

  const skipTime = useCallback((seconds: number) => {
    if (!waveSurferRef.current) return;
    const current = waveSurferRef.current.getCurrentTime();
    const target = Math.max(0, Math.min(totalDuration, current + seconds));
    waveSurferRef.current.setTime(target);
    setCurrentTime(target);
  }, [totalDuration]);

  const cycleSpeed = useCallback(() => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (waveSurferRef.current) {
      waveSurferRef.current.setPlaybackRate(nextSpeed);
    }
  }, [playbackRate]);

  const toggleMute = useCallback(() => {
    if (!waveSurferRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    waveSurferRef.current.setMuted(nextMuted);
  }, [isMuted]);

  // Keyboard accessibility listeners
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't hijack keystrokes if typing inside inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        skipTime(-5);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        skipTime(5);
      } else if (e.shiftKey && e.code === "ArrowUp") {
        e.preventDefault();
        cycleSpeed();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, skipTime, cycleSpeed]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-paper-2/90 backdrop-blur-md p-4 sm:p-5 shadow-warm transition-all",
        sticky && "sticky bottom-4 z-40 border-terracotta/40 shadow-warm-lg",
        className
      )}
      role="region"
      aria-label={`Audio player for ${title}`}
    >
      {/* Track Label */}
      <div className="flex items-center justify-between text-xs text-muted mb-2.5">
        <div className="flex items-center gap-2 truncate pr-4">
          <span className="flex h-2 w-2 rounded-full bg-terracotta animate-pulse" />
          <span className="font-medium text-ink truncate">{title}</span>
        </div>
        <div className="font-mono text-[11px] shrink-0">
          <span className="text-ink font-semibold">
            {formatDuration(currentTime)}
          </span>
          <span className="text-muted/60"> / </span>
          <span>{formatDuration(totalDuration)}</span>
        </div>
      </div>

      {/* Waveform Canvas Container */}
      <div className="relative my-2 w-full overflow-hidden rounded-xl">
        {!isReady && !hasError && (
          <div className="h-12 w-full rounded-xl bg-paper animate-pulse flex items-center justify-center text-xs text-muted">
            Generating audio waveform...
          </div>
        )}
        <div
          ref={containerRef}
          className={cn("w-full transition-opacity duration-300 min-h-[48px]", !isReady && "opacity-0 h-0")}
        />
        {hasError && (
          <audio
            controls
            src={audioUrl}
            className="w-full mt-2 rounded-xl"
            aria-label={title}
          />
        )}
      </div>

      {/* Audio Controls Bar */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-line/60">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Skip -15s */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => skipTime(-15)}
            className="h-9 w-9 rounded-xl hover:bg-paper"
            aria-label="Skip back 15 seconds"
          >
            <RotateCcw className="h-4 w-4 text-ink" />
          </Button>

          {/* Primary Play / Pause */}
          <Button
            variant="default"
            size="icon"
            onClick={togglePlay}
            className="h-11 w-11 rounded-xl shadow-sm text-white"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-white" />
            ) : (
              <Play className="h-5 w-5 fill-white ml-0.5" />
            )}
          </Button>

          {/* Skip +15s */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => skipTime(15)}
            className="h-9 w-9 rounded-xl hover:bg-paper"
            aria-label="Skip forward 15 seconds"
          >
            <RotateCw className="h-4 w-4 text-ink" />
          </Button>
        </div>

        {/* Speed & Mute Controls */}
        <div className="flex items-center gap-2">
          {/* Playback speed cycle */}
          <Button
            variant="outline"
            size="sm"
            onClick={cycleSpeed}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1"
            aria-label={`Playback speed: ${playbackRate}x. Click to change.`}
          >
            <Gauge className="h-3 w-3 text-muted" />
            <span>{playbackRate}x</span>
          </Button>

          {/* Mute button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8 rounded-lg hover:bg-paper"
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-muted" />
            ) : (
              <Volume2 className="h-4 w-4 text-ink" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
