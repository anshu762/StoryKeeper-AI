"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Password Reset Functionality (Commented out / disabled per user request)
 *
 * Original implementation used Resend email delivery and Better Auth resetPassword token flow.
 */
export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-paper-2 text-muted border border-line shadow-xs">
        <ShieldAlert className="h-7 w-7 text-terracotta" />
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
          Password Reset Disabled
        </h1>
        <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
          Self-service password reset has been disabled for this archive deployment. Please contact your archive administrator directly if you need access restored.
        </p>
      </div>

      <div className="pt-4 border-t border-line">
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Return to Sign In</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
