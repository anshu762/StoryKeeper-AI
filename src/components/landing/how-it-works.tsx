"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Mic, Sparkles, CheckCircle2, Archive } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const steps = [
    {
      number: "01",
      title: "Record in Your Mother Tongue",
      description:
        "Sit with family elders or record your own personal memories. Speak naturally in any regional dialect or native language without worrying about grammar or formal structure.",
      icon: <Mic className="h-6 w-6 text-terracotta" />,
      tag: "Audio First",
      svgGraphic: (
        <svg viewBox="0 0 160 100" className="w-full h-24 stroke-terracotta/70 fill-none stroke-[2]">
          <circle cx="80" cy="50" r="30" strokeDasharray="4 4" className="animate-spin-slow" />
          <path d="M 50 50 Q 80 20 110 50 T 170 50" />
          <circle cx="80" cy="50" r="10" fill="#B5472B" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "AI Transcribes & Translates",
      description:
        "Our OpenRouter AI pipeline generates an exact original-script transcript, followed by a faithful English translation, cultural themes, and keyword tags. AI never invents facts.",
      icon: <Sparkles className="h-6 w-6 text-saffron" />,
      tag: "Ethical AI",
      svgGraphic: (
        <svg viewBox="0 0 160 100" className="w-full h-24 stroke-saffron/80 fill-none stroke-[2]">
          <rect x="25" y="20" width="50" height="60" rx="8" />
          <line x1="35" y1="35" x2="65" y2="35" />
          <line x1="35" y1="50" x2="60" y2="50" />
          <path d="M 85 50 L 100 50 M 95 45 L 100 50 L 95 55" />
          <rect x="105" y="20" width="50" height="60" rx="8" stroke="#3F5B45" />
          <line x1="115" y1="35" x2="145" y2="35" stroke="#3F5B45" />
          <line x1="115" y1="50" x2="140" y2="50" stroke="#3F5B45" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Human Review & Explicit Consent",
      description:
        "You review and edit every word. You choose whether you want your name attached or stay anonymous, and whether the story is public, private, or restricted to academic researchers.",
      icon: <CheckCircle2 className="h-6 w-6 text-moss" />,
      tag: "You Hold the Keys",
      svgGraphic: (
        <svg viewBox="0 0 160 100" className="w-full h-24 stroke-moss/80 fill-none stroke-[2]">
          <circle cx="80" cy="45" r="28" />
          <path d="M 68 45 L 76 53 L 94 35" strokeWidth="3" />
          <path d="M 40 85 C 40 70 60 65 80 65 C 100 65 120 70 120 85" strokeDasharray="3 3" />
        </svg>
      ),
    },
    {
      number: "04",
      title: "Permanent Archival Preservation",
      description:
        "Once approved by community moderators, your oral history joins a permanent, searchable digital catalog. Accessible for generations to come, educators, and cultural historians.",
      icon: <Archive className="h-6 w-6 text-plum" />,
      tag: "Living Heritage",
      svgGraphic: (
        <svg viewBox="0 0 160 100" className="w-full h-24 stroke-plum/80 fill-none stroke-[2]">
          <path d="M 30 70 L 80 25 L 130 70 Z" />
          <rect x="45" y="70" width="70" height="25" />
          <line x1="60" y1="70" x2="60" y2="95" />
          <line x1="100" y1="70" x2="100" y2="95" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-20 sm:py-28 border-b border-line bg-paper-2/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The Methodology"
          title="How StoryKeeper Works"
          description="A consent-driven digital preservation workflow from living memory to permanent archival catalog."
        />

        <div ref={containerRef} className="relative mt-16 max-w-4xl mx-auto">
          {/* Scroll-Driven Connecting Progress Line */}
          <div className="absolute left-6 sm:left-1/2 top-4 bottom-4 w-1 bg-line -translate-x-1/2 hidden sm:block">
            <motion.div
              style={{ height: shouldReduceMotion ? "100%" : lineHeight }}
              className="w-full bg-terracotta origin-top"
            />
          </div>

          <div className="space-y-12 sm:space-y-20">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={step.number}
                  className="relative flex flex-col sm:flex-row items-center gap-8"
                >
                  {/* Step Card */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -24 : 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className={`w-full sm:w-1/2 ${
                      isEven ? "sm:pr-12 sm:text-right" : "sm:pl-12 sm:order-2"
                    }`}
                  >
                    <div className="rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-warm hover:shadow-warm-lg transition-all space-y-3">
                      <div
                        className={`flex items-center gap-3 ${
                          isEven ? "sm:justify-end" : "justify-start"
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-paper-2 text-muted">
                          {step.tag}
                        </span>
                        <span className="font-mono text-sm font-bold text-terracotta">
                          {step.number}
                        </span>
                      </div>

                      <h3 className="font-serif text-2xl font-medium text-ink">
                        {step.title}
                      </h3>

                      <p className="text-sm text-muted leading-relaxed font-sans">
                        {step.description}
                      </p>

                      <div className="pt-2">{step.svgGraphic}</div>
                    </div>
                  </motion.div>

                  {/* Center Node on Timeline */}
                  <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full border-2 border-line bg-white shadow-sm z-10 hidden sm:flex">
                    {step.icon}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
