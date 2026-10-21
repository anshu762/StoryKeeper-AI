import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatTimePeriod(
  label: string | null | undefined,
  start: number | null | undefined,
  end: number | null | undefined
): string {
  if (label) return label;
  if (start && end) return `${start}–${end}`;
  if (start) return `Circa ${start}`;
  return "Historical";
}
