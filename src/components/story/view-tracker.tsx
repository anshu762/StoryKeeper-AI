"use client";

import { useEffect } from "react";

export function StoryViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    // Only track if not a bot / preview
    try {
      fetch(`/api/stories/${slug}/view`, {
        method: "POST",
      }).catch((err) => {
        // silently ignore tracking failures
      });
    } catch {
      // ignore
    }
  }, [slug]);

  return null;
}
