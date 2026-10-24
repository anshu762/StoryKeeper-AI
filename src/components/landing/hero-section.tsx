"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Mic, Search, Play, Pause, Volume2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 500], [0, shouldReduceMotion ? 0 : 40]);

  // Floating sample audio state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleSampleAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/samples/sample.mp3");
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const headlineWords = [
    "Every",
    "elder",
    "is",
    "a",
    "library.",
    "Let’s",
    "not",
    "lose",
    "the",
    "books.",
  ];

  return (
    <section className="relative overflow-hidden pt-12 sm:pt-20 pb-20 sm:pb-32 border-b border-line/60">
      {/* Drifting Ambient Gradient Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, 30, -20, 0],
                  y: [0, -30, 20, 0],
                  scale: [1, 1.1, 0.95, 1],
                }
          }
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-terracotta/20 blur-3xl"
        />
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, -40, 25, 0],
                  y: [0, 25, -35, 0],
                  scale: [1, 0.95, 1.1, 1],
                }
          }
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-saffron/25 blur-3xl"
        />
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [0, 25, -30, 0],
                  y: [0, 30, -20, 0],
                }
          }
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-moss/20 blur-3xl"
        />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Staggered Headline & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-paper-2 border border-line text-xs font-semibold text-terracotta shadow-xs"
            >
              <span className="flex h-2 w-2 rounded-full bg-terracotta animate-ping" />
              <span>Preserving Living Oral Histories</span>
            </motion.div>

            {/* Staggered Word Reveal Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-ink leading-[1.08] flex flex-wrap gap-x-2.5 sm:gap-x-3 gap-y-1">
              {headlineWords.map((word, index) => (
                <span key={index} className="inline-block overflow-hidden">
                  <motion.span
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.55,
                      delay: index * 0.045,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`inline-block ${
                      word.includes("library") || word.includes("books")
                        ? "text-terracotta italic font-normal"
                        : ""
                    }`}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>

            {/* Subcopy */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg sm:text-xl text-muted font-sans leading-relaxed max-w-2xl"
            >
              StoryKeeper AI is a public digital archive for oral histories, folk
              traditions, family recipes, and community memories. Recorded in real
              human voices, translated with AI, safeguarded by explicit consent.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
            >
              <Button asChild size="lg" className="rounded-2xl text-base gap-2 shadow-warm justify-center">
                <Link href="/archive">
                  <Search className="h-4 w-4" />
                  <span>Explore the Archive</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-2xl text-base gap-2 bg-white/60 hover:bg-white justify-center"
              >
                <Link href="/dashboard/stories/new">
                  <Mic className="h-4 w-4 text-terracotta" />
                  <span>Share a Story</span>
                </Link>
              </Button>
            </motion.div>

            {/* Ethics Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="pt-4 flex flex-wrap items-center gap-6 text-xs text-muted"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-moss" />
                <span>Explicit contributor consent only</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-saffron" />
                <span>AI transcribes & translates — never invents</span>
              </span>
            </motion.div>
          </div>

          {/* Right Column: Floating Parallax Story Card with Live Waveform */}
          <motion.div
            style={{ y: yParallax }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Decorative Generative SVG Waveform Background */}
            <div className="absolute -top-10 -right-6 w-full h-full pointer-events-none opacity-20">
              <svg viewBox="0 0 400 200" className="w-full h-full stroke-terracotta fill-none stroke-[1.5]">
                <path d="M 10 100 Q 60 20 110 100 T 210 100 T 310 100 T 410 100" />
                <path d="M 10 115 Q 60 40 110 115 T 210 115 T 310 115 T 410 115" opacity="0.6" />
                <path d="M 10 85 Q 60 5 110 85 T 210 85 T 310 85 T 410 85" opacity="0.4" />
              </svg>
            </div>

            {/* Floating "Now Playing" Card */}
            <div className="rounded-3xl border border-line bg-white/95 backdrop-blur-xl p-5 sm:p-7 shadow-warm-lg space-y-4 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-moss animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-moss font-sans">
                    Now Playing in Archive
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Bhojpuri • 1960s
                </Badge>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-medium text-ink leading-snug">
                  The Scent of Mahua and the Mud Chulha
                </h3>
                <p className="text-xs text-muted mt-1">
                  Recorded in Bhojpur, Bihar • Told by Sunita Devi
                </p>
              </div>

              {/* Original snippet in Devanagari script */}
              <div className="rounded-2xl bg-paper p-4 border border-line/70">
                <p className="font-devanagari-serif text-sm text-ink italic leading-relaxed">
                  &ldquo;हमरे बचपन में जब दादी चूल्हे पर रोटी सेकती थीं, तब पूरे आँगन में महुए के फूल की खुशबू फैल जाती थी...&rdquo;
                </p>
              </div>

              {/* Animated Live Waveform */}
              <div className="flex items-center justify-between gap-1.5 h-12 py-2 px-2 rounded-xl bg-paper-2/60 border border-line/40">
                {[30, 55, 85, 45, 95, 60, 40, 75, 90, 65, 35, 80, 50, 70, 40, 85, 60, 45, 75, 30, 60].map(
                  (val, i) => (
                    <motion.div
                      key={i}
                      animate={
                        isPlaying
                          ? {
                              height: [`${val * 0.3}%`, `${val}%`, `${val * 0.4}%`],
                            }
                          : { height: `${val * 0.4}%` }
                      }
                      transition={
                        isPlaying
                          ? {
                              duration: 0.6 + (i % 3) * 0.2,
                              repeat: Infinity,
                              repeatType: "reverse",
                              ease: "easeInOut",
                            }
                          : {}
                      }
                      className={`w-1 rounded-full transition-colors ${
                        isPlaying ? "bg-terracotta" : "bg-line"
                      }`}
                      style={{ height: `${val * 0.4}%` }}
                    />
                  )
                )}
              </div>

              {/* Audio Play Trigger & Duration */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <Button
                  onClick={toggleSampleAudio}
                  variant="default"
                  className="rounded-xl gap-2 font-medium"
                  aria-label={isPlaying ? "Pause sample audio" : "Listen to sample story"}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 fill-white" />
                      <span>Pause Audio</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-white ml-0.5" />
                      <span>Listen (4:05)</span>
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-1.5 text-xs text-muted font-mono">
                  <Volume2 className="h-3.5 w-3.5 text-terracotta" />
                  <span>Audio Archival Sample</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
