"use client";

import React, { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface StatsStripProps {
  storyCount?: number;
  languageCount?: number;
  regionCount?: number;
  hoursCount?: number;
}

function Counter({ end, duration = 1.8 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || end <= 0) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}</span>;
}

export function StatsStrip({
  storyCount = 14,
  languageCount = 7,
  regionCount = 12,
  hoursCount = 8,
}: StatsStripProps) {
  const stats = [
    { label: "Preserved Oral Stories", value: storyCount, suffix: "+" },
    { label: "Living Languages & Dialects", value: languageCount, suffix: "" },
    { label: "Cultural Regions Documented", value: regionCount, suffix: "" },
    { label: "Hours of Authentic Audio", value: hoursCount, suffix: " hrs" },
  ];

  return (
    <section className="py-12 sm:py-16 border-b border-line bg-paper">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((s, idx) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col items-center sm:items-start p-6 rounded-2xl border border-line/60 bg-white/70 shadow-xs"
            >
              <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight flex items-baseline text-terracotta">
                <Counter end={s.value} />
                <span>{s.suffix}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted font-sans font-medium mt-1 text-center sm:text-left">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
