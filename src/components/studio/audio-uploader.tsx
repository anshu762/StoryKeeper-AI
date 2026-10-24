"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileAudio, X, AlertCircle, CheckCircle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import { getFriendlyErrorMessage } from "@/lib/errors";

const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const MAX_DURATION_SEC = 15 * 60; // 15 min

const ACCEPTED_EXTENSIONS = [
  ".mp3",
  ".m4a",
  ".wav",
  ".ogg",
  ".webm",
  ".aac",
  ".flac",
  ".mp4",
  ".3gp",
];

interface AudioUploaderProps {
  onFileSelected: (file: File, durationSec: number) => void;
  disabled?: boolean;
}

export function AudioUploader({ onFileSelected, disabled = false }: AudioUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDurationSec, setFileDurationSec] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setErrorMessage(null);

    // 1. Validate file extension and MIME type
    const name = file.name.toLowerCase();
    const hasValidExt = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
    const isAudioMime = file.type.startsWith("audio/") || file.type === "video/mp4";
    if (!hasValidExt && !isAudioMime) {
      setErrorMessage(
        "Unsupported file type. Please upload an MP3, M4A, WAV, OGG, WebM, AAC, or FLAC audio file."
      );
      return;
    }

    // 2. Validate file size (max 25MB)
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage(
        `File is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Maximum allowed size is 25 MB.`
      );
      return;
    }

    // 3. Inspect duration via temporary audio object
    setIsValidating(true);
    const objectUrl = URL.createObjectURL(file);

    try {
      const audio = new Audio(objectUrl);
      const duration: number = await new Promise((resolve, reject) => {
        audio.onloadedmetadata = () => resolve(audio.duration);
        audio.onerror = () => reject(new Error("Unable to read audio metadata"));
        // Timeout after 5s if metadata fails
        setTimeout(() => resolve(0), 5000);
      });

      if (duration > MAX_DURATION_SEC) {
        URL.revokeObjectURL(objectUrl);
        setErrorMessage(
          `Audio duration is ${formatDuration(duration)}. Maximum allowed recording length is 15 minutes.`
        );
        return;
      }

      const roundedDuration = Math.round(duration * 10) / 10;
      setSelectedFile(file);
      setFileDurationSec(roundedDuration);
      setPreviewUrl(objectUrl);
      onFileSelected(file, roundedDuration);
    } catch {
      // If duration couldn't be probed, allow file with 0/unknown duration
      setSelectedFile(file);
      setFileDurationSec(0);
      setPreviewUrl(objectUrl);
      onFileSelected(file, 0);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setFileDurationSec(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
            dragOver
              ? "border-terracotta bg-terracotta/5 scale-[0.99]"
              : "border-line bg-paper hover:bg-paper-2/60 hover:border-terracotta/40"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/wav,audio/m4a,audio/ogg,audio/webm,audio/aac,audio/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={disabled}
          />

          <div className="w-14 h-14 rounded-2xl bg-paper-2 border border-line text-terracotta flex items-center justify-center shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="font-serif text-lg font-medium text-ink">
              Drag & drop your audio recording here
            </p>
            <p className="text-xs text-muted-foreground">
              or <span className="text-terracotta font-medium underline">browse your files</span> from your computer or phone
            </p>
          </div>

          <p className="text-[11px] text-muted-foreground pt-2">
            MP3, M4A, WAV, OGG, or WebM • Max 25 MB • Max 15 minutes
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-paper p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 truncate">
              <div className="w-10 h-10 rounded-xl bg-moss/10 text-moss flex items-center justify-center shrink-0">
                <FileAudio className="w-5 h-5" />
              </div>
              <div className="truncate space-y-0.5">
                <p className="text-sm font-semibold text-ink truncate">
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  {fileDurationSec ? (
                    <>
                      <span>•</span>
                      <span>{formatDuration(fileDurationSec)}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-muted-foreground hover:text-ink hover:bg-paper-2"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {previewUrl && (
            <div className="pt-2">
              <audio src={previewUrl} controls className="w-full h-10" />
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>
            {getFriendlyErrorMessage(
              errorMessage,
              "Could not validate audio file. Please try a standard MP3, WAV, or M4A file."
            )}
          </span>
        </div>
      )}
    </div>
  );
}
