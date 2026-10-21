"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VoicesQuoteBand() {
  const quotes = [
    {
      original: "हमरे बचपन में जब दादी चूल्हे पर रोटी सेकती थीं, तब पूरे आँगन में महुए के फूल की खुशबू फैल जाती थी।",
      translation:
        "When grandmother baked flatbreads on the clay stove, the scent of mahua flowers spread across the whole courtyard.",
      speaker: "Sunita Devi",
      region: "Bhojpur, Bihar (1960s)",
      language: "Bhojpuri",
    },
    {
      original: "اس رات ستلج دا پاݨی بڑا خاموش سی... باباجی دی گٹھڑی وچ صرف پورانے پنڈ دی مٹی سی۔",
      translation:
        "That night the waters of the Sutlej were silent... inside the elder's bundle was nothing but soil from his ancestral village.",
      speaker: "Anonymous Survivor",
      region: "Amritsar, Punjab (1947)",
      language: "Punjabi",
    },
    {
      original: "আমাদের শান্তিপুরের প্রতিটা গলিতে সকাল হলেই খটখট আওয়াজ শোনা যেত। এখন সেই সুর আর শোনা যায় না।",
      translation:
        "In every lane of Shantipur, the click-clack of the handloom greeted the dawn. That music has now faded from our streets.",
      speaker: "Master Weaver's Family",
      region: "Nadia, West Bengal (1970s)",
      language: "Bengali",
    },
    {
      original: "ஆடிப் பெருக்கு நாளில் காவிரியில் புது வெள்ளம் வரும் போது வயல்களில் நாற்று நடும் பெண்கள் பாடிய நாற்றுப்பாட்டு ஊரெல்லாம் எதிரொலிக்கும்.",
      translation:
        "On Aadi Perukku, as Kaveri river swelled with fresh waters, the paddy transplantation chants of women echoed across the green terraces.",
      speaker: "Delta Singer",
      region: "Thanjavur, Tamil Nadu (1970s)",
      language: "Tamil",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  const activeQuote = quotes[currentIndex];

  return (
    <section className="py-16 sm:py-24 border-b border-line bg-gradient-to-br from-[#271E19] via-[#352520] to-[#1F1A17] text-[#FBF7F0] relative overflow-hidden">
      {/* Decorative large background quote glyph */}
      <Quote className="absolute -bottom-10 -right-6 h-64 w-64 text-white/5 pointer-events-none" />

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/15">
          <span className="text-xs font-semibold uppercase tracking-widest text-saffron">
            Voices from the Archive
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentIndex(
                  (prev) => (prev - 1 + quotes.length) % quotes.length
                )
              }
              className="h-8 w-8 rounded-lg border-white/20 text-white bg-white/10 hover:bg-white/20 hover:text-white"
              aria-label="Previous quote"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentIndex((prev) => (prev + 1) % quotes.length)
              }
              className="h-8 w-8 rounded-lg border-white/20 text-white bg-white/10 hover:bg-white/20 hover:text-white"
              aria-label="Next quote"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="min-h-[180px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal leading-relaxed text-[#FBF7F0]">
                &ldquo;{activeQuote.original}&rdquo;
              </blockquote>

              <p className="text-sm sm:text-base text-[#E4DACB]/80 font-sans italic max-w-3xl">
                &ldquo;{activeQuote.translation}&rdquo;
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-saffron font-medium">
                <span>— {activeQuote.speaker}</span>
                <span>•</span>
                <span className="text-[#E4DACB]/60">{activeQuote.region}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[11px] text-[#FBF7F0]">
                  {activeQuote.language}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex items-center gap-1.5 pt-8">
          {quotes.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex
                  ? "w-8 bg-terracotta"
                  : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to quote ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
