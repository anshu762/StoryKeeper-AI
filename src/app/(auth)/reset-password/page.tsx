"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/auth-client";
import { toast } from "sonner";

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetFormValues) => {
    if (!token) {
      setErrorMessage("Reset token is missing or expired. Please request a new link.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await resetPassword({
        newPassword: values.password,
        token,
      });

      if (result.error) {
        setErrorMessage(
          result.error.message || "Failed to reset password. Token may be invalid or expired."
        );
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-moss-subtle text-moss border border-moss/30 shadow-sm">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">
            Password updated
          </h1>
          <p className="text-sm text-muted max-w-sm mx-auto">
            Your password has been changed securely. Redirecting you to sign in...
          </p>
        </div>

        <div className="pt-4 border-t border-line">
          <Button asChild variant="default" className="w-full">
            <Link href="/login">
              <span>Go to sign in now</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
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
          Set new password
        </h1>
        <p className="text-sm text-muted">
          Choose a secure password of at least 8 characters.
        </p>
      </div>

      {!token && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          ⚠️ Reset token is missing from the URL. Please verify you followed the full link from your email or console.
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink font-sans">
            New password
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isLoading || !token}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-600 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink font-sans">
            Confirm new password
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isLoading || !token}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-600 font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading || !token}
          className="w-full h-11 text-base font-semibold mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Updating password...</span>
            </>
          ) : (
            <span>Update Password</span>
          )}
        </Button>
      </form>

      <div className="pt-4 border-t border-line text-center text-sm text-muted">
        <Link
          href="/login"
          className="font-medium text-terracotta hover:underline"
        >
          Cancel and return to sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-paper-2" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
