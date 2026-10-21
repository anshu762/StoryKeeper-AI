"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, MailCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/auth-client";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await requestPasswordReset({
        email: values.email,
        redirectTo: "/reset-password",
      });

      if (result.error) {
        setErrorMessage(result.error.message || "Failed to process request");
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
      setIsLoading(false);
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-moss-subtle text-moss border border-moss/30 shadow-sm">
          <MailCheck className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">
            Check your email
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-sm mx-auto">
            If an account exists for that email, we have sent a secure password reset link. In local development without Resend configured, check the server console.
          </p>
        </div>

        <div className="pt-4 border-t border-line">
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Back to sign in</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-ink">
          Reset password
        </h1>
        <p className="text-sm text-muted">
          Enter your email address and we will send you a link to reset your password.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink font-sans">
            Account email
          </label>
          <Input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isLoading}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-600 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 text-base font-semibold mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Sending reset link...</span>
            </>
          ) : (
            <span>Send Reset Link</span>
          )}
        </Button>
      </form>

      <div className="pt-4 border-t border-line text-center text-sm text-muted">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-medium text-terracotta hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to sign in</span>
        </Link>
      </div>
    </div>
  );
}
