"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Edit, Users, EyeOff, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";

export function EthicsPromise() {
  const pillars = [
    {
      icon: <Shield className="h-6 w-6 text-terracotta" />,
      title: "Consent First",
      description:
        "No story is ever made public without affirmative, explicit permission from the contributor. You choose whether to share publicly, keep private, or permit only academic research.",
    },
    {
      icon: <Edit className="h-6 w-6 text-saffron" />,
      title: "Right to Edit or Remove",
      description:
        "Your memories belong to you. Contributors can edit transcripts, change privacy levels, or request complete removal from the archive at any time with a single click.",
    },
    {
      icon: <Users className="h-6 w-6 text-moss" />,
      title: "AI is Reviewed by Humans",
      description:
        "AI is used strictly as a transcription and translation assistant, never to invent or hallucinate. Every line is clearly marked as editable and reviewed by human archivists.",
    },
    {
      icon: <EyeOff className="h-6 w-6 text-plum" />,
      title: "Private Details Stay Private",
      description:
        "Public pages never display emails, phone numbers, or exact addresses. Regions are coarse (district/state level) to safeguard families and community elders.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 border-b border-line bg-paper-2/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Ethical Charter"
          title="Your Story. Your Permission."
          description="We built StoryKeeper on the belief that oral histories are sacred community trusts, not training data."
          action={
            <Button asChild variant="default" className="rounded-xl gap-2">
              <Link href="/ethics">
                <span>Read Full Ethics Charter</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-3xl border border-line bg-white p-7 shadow-warm hover:shadow-warm-lg hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-paper-2 border border-line">
                  {pillar.icon}
                </div>
                <h3 className="font-serif text-xl font-medium text-ink">
                  {pillar.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed font-sans">
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
