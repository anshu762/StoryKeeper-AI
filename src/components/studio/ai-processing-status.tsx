"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Clock,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface AiJobItem {
  id: string;
  type: "TRANSCRIPTION" | "TRANSLATION" | "SUMMARY" | "KEYWORDS" | "THEMES";
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  errorMessage?: string | null;
  retryCount: number;
}

interface AiProcessingStatusProps {
  storyId: string;
  onComplete?: () => void;
}

export function AiProcessingStatus({
  storyId,
  onComplete,
}: AiProcessingStatusProps) {
  const router = useRouter();

  const [jobs, setJobs] = useState<AiJobItem[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);

  // Poll status every 2.5 seconds
  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/stories/${storyId}/status`);
        if (!res.ok) return;

        const data = await res.json();
        if (!isMounted) return;

        setJobs(data.aiJobs || []);
        setIsCompleted(data.isCompleted);
        setHasFailed(data.hasFailed);

        const failedJob = data.aiJobs?.find(
          (j: AiJobItem) => j.status === "FAILED"
        );
        if (failedJob?.errorMessage) {
          setFailedMessage(failedJob.errorMessage);
        }

        if (data.isCompleted) {
          if (onComplete) {
            onComplete();
          } else {
            // Auto redirect to review after brief pause
            timer = setTimeout(() => {
              router.push(`/dashboard/stories/${storyId}/review`);
            }, 1200);
          }
          return;
        }

        // Schedule next poll if still processing
        if (!data.hasFailed) {
          timer = setTimeout(checkStatus, 2500);
        }
      } catch (err) {
        console.warn("[POLL STATUS ERROR]", err);
        if (isMounted) timer = setTimeout(checkStatus, 3000);
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [storyId, router, onComplete]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setHasFailed(false);
    setFailedMessage(null);

    try {
      await fetch(`/api/stories/${storyId}/process`, {
        method: "POST",
      });
      // Will be picked up by polling loop
    } catch (err) {
      console.error("[RETRY ERROR]", err);
    } finally {
      setIsRetrying(false);
    }
  };

  // Helper to determine status for checklist items
  const getStepStatus = (
    step: "transcription" | "translation" | "analysis"
  ) => {
    if (step === "transcription") {
      const job = jobs.find((j) => j.type === "TRANSCRIPTION");
      return job?.status || "PENDING";
    }
    if (step === "translation") {
      const job = jobs.find((j) => j.type === "TRANSLATION");
      return job?.status || "PENDING";
    }
    if (step === "analysis") {
      const sJob = jobs.find((j) => j.type === "SUMMARY");
      const kJob = jobs.find((j) => j.type === "KEYWORDS");
      const tJob = jobs.find((j) => j.type === "THEMES");

      if (
        sJob?.status === "FAILED" ||
        kJob?.status === "FAILED" ||
        tJob?.status === "FAILED"
      ) {
        return "FAILED";
      }
      if (
        sJob?.status === "PROCESSING" ||
        kJob?.status === "PROCESSING" ||
        tJob?.status === "PROCESSING"
      ) {
        return "PROCESSING";
      }
      if (
        sJob?.status === "COMPLETED" &&
        kJob?.status === "COMPLETED" &&
        tJob?.status === "COMPLETED"
      ) {
        return "COMPLETED";
      }
      return "PENDING";
    }
    return "PENDING";
  };

  const steps = [
    {
      key: "audio",
      title: "Secure audio recording in cloud archive",
      desc: "Raw audio stored securely in encrypted object storage.",
      status: "COMPLETED",
    },
    {
      key: "transcription",
      title: "Transcribe regional speech in native script",
      desc: "Speech-to-text preserving phonetic dialect nuances and oral cadence.",
      status: getStepStatus("transcription"),
    },
    {
      key: "translation",
      title: "Generate literary English translation",
      desc: "Translating while honoring cultural terms, familial names, and sacred words.",
      status: getStepStatus("translation"),
    },
    {
      key: "analysis",
      title: "Extract community summary, themes & keywords",
      desc: "Identifying cultural themes and cataloging search tags.",
      status: getStepStatus("analysis"),
    },
  ];

  return (
    <div className="rounded-3xl border border-line bg-paper p-6 sm:p-10 space-y-8 shadow-warm max-w-2xl mx-auto">
      {/* Top Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron/15 text-ink text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-terracotta" />
          <span>AI Preservation Pipeline</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
          {isCompleted
            ? "Transcription & Analysis Complete!"
            : hasFailed
            ? "Processing Notice"
            : "Processing Your Story..."}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          {isCompleted
            ? "Your story has been transcribed and translated. Redirecting you to review and edit..."
            : hasFailed
            ? "The automated transcription encountered a hurdle. Your original audio is completely safe."
            : "Our models are transcribing your voice in its native dialect and translating it into English."}
        </p>
      </div>

      {/* Progress Checklist */}
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div
            key={step.key}
            className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
              step.status === "COMPLETED"
                ? "bg-moss/5 border-moss/20 text-ink"
                : step.status === "PROCESSING"
                ? "bg-terracotta/5 border-terracotta/30 text-ink shadow-xs"
                : step.status === "FAILED"
                ? "bg-red-50 border-red-200 text-red-900"
                : "bg-paper-2/40 border-line/60 text-muted-foreground opacity-70"
            }`}
          >
            {/* Status Icon */}
            <div className="mt-0.5 shrink-0">
              {step.status === "COMPLETED" ? (
                <CheckCircle2 className="w-5 h-5 text-moss" />
              ) : step.status === "PROCESSING" ? (
                <Loader2 className="w-5 h-5 text-terracotta animate-spin" />
              ) : step.status === "FAILED" ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <Clock className="w-5 h-5 text-muted-foreground/60" />
              )}
            </div>

            <div className="space-y-0.5">
              <h4 className="text-sm font-medium text-ink leading-snug">
                {step.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Failed State Action Callout */}
      {hasFailed && (
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-5 space-y-3">
          <p className="text-xs text-red-800 leading-relaxed">
            {failedMessage ||
              "An error occurred while connecting to the AI provider. You can retry the step, or proceed to type or paste the transcript manually."}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="bg-terracotta hover:bg-terracotta/90 text-white text-xs gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {isRetrying ? "Retrying..." : "Retry AI Step"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/stories/${storyId}/review`)}
              className="border-line text-xs gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Continue Manually
            </Button>
          </div>
        </div>
      )}

      {/* Manual Proceed button if completed */}
      {isCompleted && (
        <div className="pt-2 text-center">
          <Button
            type="button"
            onClick={() => router.push(`/dashboard/stories/${storyId}/review`)}
            className="bg-terracotta hover:bg-terracotta/90 text-white px-8 rounded-xl gap-2 shadow-sm"
          >
            <span>Review & Edit Output</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
