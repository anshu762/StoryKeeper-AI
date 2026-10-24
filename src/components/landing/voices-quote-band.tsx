"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VoicesQuoteBand() {
  const quotes = [
    {
      original: "बुनकर का नाम साड़ी पर नहीं होता। लेकिन किसी कोने में, किसी पत्ती या पंखुड़ी में, एक धागा बाकी धागों से थोड़ा कसकर बुना होता है। वो मैं हूँ। वो ठहराव ही सब कुछ है।",
      translation:
        "The weaver's name is not on the sari. But somewhere inside a petal, a thread goes a little tighter than the others. That is me. If a woman in some faraway city ever pauses for a moment... that is all. The pause.",
      speaker: "Kamla Devi, 82",
      region: "Varanasi, Uttar Pradesh (1950s)",
      language: "Hindi",
    },
    {
      original: "میرے شوہر کہتے تھے تم سوائے دھاگے کے کچھ نہیں چھوڑو گی۔ میں نے کہا دھاگہ ہی تو ہے جو دنیا کو جوڑے رکھتا ہے، بے وقوف۔",
      translation:
        "My husband used to say, 'Zubaida, you leave nothing but thread.' I told him thread is what holds the world together, you fool.",
      speaker: "Zubaida Begum, 74",
      region: "Lucknow, Uttar Pradesh (1960s)",
      language: "Urdu",
    },
    {
      original: "ਲੰਮੇ ਸਫ਼ਰ ਵਿੱਚ ਪੱਕਦਾ ਹੋਇਆ ਅੰਬ ਨਫ਼ਰਤ ਦੇ ਖ਼ਿਲਾਫ਼ ਇੱਕ ਨਿੱਕੀ ਜਿਹੀ ਦਲੀਲ ਹੈ। ਬੀਜ ਸੁੱਟੋ। ਸਬਰ ਰੱਖੋ। ਅੰਬ ਭੇਜਦੇ ਰਹੋ।",
      translation:
        "A mango ripening in a long journey is a small argument against hatred. Throw seeds. Be patient. Send mangoes.",
      speaker: "Gurdev Singh, 85",
      region: "near Ludhiana, Punjab (1970s)",
      language: "Punjabi",
    },
    {
      original: "அளவுகளைச் சரியாகச் சொல்லும் சமையல் குறிப்பு உங்களுக்கு எதையும் கற்பிக்காது. ஆனால் 'தேவையான அளவு' என்று சொல்லும் குறிப்புதான் சுவைக்கவும், தோற்கவும், மீண்டும் முயலவும் கற்றுக்கொடுக்கிறது.",
      translation:
        "A recipe you can follow exactly teaches you nothing. But a recipe that says 'enough' teaches you to taste, to fail, to try again.",
      speaker: "Meenakshi Ammal, 79",
      region: "Madurai, Tamil Nadu (1980s)",
      language: "Tamil",
    },
    {
      original: "किताबों में किसी ने उनका नाम नहीं लिखा। लेकिन ये दुनिया ऐसे ही आम और नेकदिल लोगों के धागों से बंधी हुई है।",
      translation:
        "Nobody wrote their names in books. But the world is held together by such people, like a cloth is held by tiny threads that never show. Be ordinary and kind. That is everything.",
      speaker: "Janaki Ammal, 96",
      region: "Thanjavur, Tamil Nadu (1950s)",
      language: "Tamil",
    },
    {
      original: "चालीस साल तक मैंने इस डिब्बे में उन परिवारों के नाम लिखे जिनकी सेवा की। हर डिब्बा किसी का विश्वास था।",
      translation:
        "For forty-four years, not one tiffin was lost. Because every box was a person's trust. A mother had packed that. A wife had woken at five.",
      speaker: "Ganpat Shinde, 80",
      region: "Mumbai, Maharashtra (1980s)",
      language: "Marathi",
    },
    {
      original: "हमरे बचपन में जब दादी चूल्हे पर रोटी सेकती थीं, तब पूरे आँगन में महुए के फूल की खुशबू फैल जाती थी।",
      translation:
        "When grandmother baked flatbreads on the clay stove, the scent of mahua flowers spread across the whole courtyard.",
      speaker: "Sunita Devi",
      region: "Bhojpur, Bihar (1960s)",
      language: "Bhojpuri",
    },
    {
      original: "আমাদের শান্তিপুরের প্রতিটা গলিতে সকাল হলেই খটখট আওয়াজ শোনা যেত। এখন সেই সুর আর শোনা যায় না।",
      translation:
        "In every lane of Shantipur, the click-clack of the handloom greeted the dawn. That music has now faded from our streets.",
      speaker: "Master Weaver's Family",
      region: "Nadia, West Bengal (1970s)",
      language: "Bengali",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 7000);
  }, [quotes.length]);

  useEffect(() => {
    if (!isPaused) {
      startTimer();
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, startTimer]);

  const selectQuote = (index: number) => {
    setCurrentIndex(index);
    if (!isPaused) startTimer();
  };

  const nextQuote = () => {
    setCurrentIndex((prev) => (prev + 1) % quotes.length);
    if (!isPaused) startTimer();
  };

  const prevQuote = () => {
    setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
    if (!isPaused) startTimer();
  };

  const activeQuote = quotes[currentIndex];

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="py-14 sm:py-24 border-b border-line bg-gradient-to-br from-[#271E19] via-[#352520] to-[#1F1A17] text-[#FBF7F0] relative overflow-hidden select-none"
    >
      {/* Decorative large background quote glyph */}
      <Quote className="absolute -bottom-10 -right-6 h-64 w-64 text-white/5 pointer-events-none" />

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-white/15">
          <span className="text-xs font-semibold uppercase tracking-widest text-saffron">
            Voices from the Archive
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevQuote}
              className="h-8 w-8 rounded-lg border-white/20 text-white bg-white/10 hover:bg-white/20 hover:text-white"
              aria-label="Previous quote"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextQuote}
              className="h-8 w-8 rounded-lg border-white/20 text-white bg-white/10 hover:bg-white/20 hover:text-white"
              aria-label="Next quote"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="min-h-[220px] sm:min-h-[190px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 sm:space-y-4"
            >
              <blockquote className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-relaxed text-[#FBF7F0]">
                &ldquo;{activeQuote.original}&rdquo;
              </blockquote>

              <p className="text-xs sm:text-sm md:text-base text-[#E4DACB]/80 font-sans italic max-w-3xl leading-relaxed">
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

        {/* Carousel Progress Dots */}
        <div className="flex items-center gap-1 sm:gap-1.5 pt-6 sm:pt-8 flex-wrap">
          {quotes.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectQuote(i)}
              className="py-2.5 px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta rounded-full"
              aria-label={`Go to quote ${i + 1} of ${quotes.length}`}
            >
              <span
                className={`block h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-7 sm:w-8 bg-terracotta shadow-xs"
                    : "w-2 sm:w-2.5 bg-white/30 hover:bg-white/60"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
