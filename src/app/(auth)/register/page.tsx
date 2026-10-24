"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agreeEthics: z.literal(true, {
    errorMap: () => ({
      message: "You must agree to the Contributor Ethics & Consent Charter",
    }),
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (session?.user) {
      window.location.assign(callbackUrl);
    }
  }, [session, callbackUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (result.error) {
        setErrorMessage(
          result.error.message || "Failed to create account. Please try again."
        );
        setIsLoading(false);
        return;
      }

      setIsRedirecting(true);
      toast.success("Account created successfully! Opening your dashboard...");
      window.location.assign(callbackUrl);
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-ink">
          Join the Archive
        </h1>
        <p className="text-sm text-muted">
          Create your contributor account to record, preserve, and share authentic oral histories.
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
            Display name
          </label>
          <Input
            type="text"
            placeholder="e.g. Maya Devi or Dr. K. Rao"
            autoComplete="name"
            disabled={isLoading}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-600 font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink font-sans">
            Email address
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
          <p className="text-[11px] text-muted">
            Your email is strictly private and never displayed on public story pages.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink font-sans">
            Password (min. 8 characters)
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isLoading}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-600 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Ethics Charter Agreement */}
        <div className="rounded-xl border border-line bg-white/60 p-3.5 space-y-2">
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="agreeEthics"
              disabled={isLoading}
              className="mt-1 h-4 w-4 rounded border-line text-terracotta focus:ring-terracotta"
              {...register("agreeEthics")}
            />
            <label
              htmlFor="agreeEthics"
              className="text-xs text-ink/80 leading-relaxed cursor-pointer"
            >
              I agree to the{" "}
              <Link
                href="/ethics"
                target="_blank"
                className="font-semibold text-terracotta underline"
              >
                Contributor Ethics & Consent Charter
              </Link>
              . I will only upload authentic stories with participant consent.
            </label>
          </div>
          {errors.agreeEthics && (
            <p className="text-xs text-red-600 font-medium">
              {errors.agreeEthics.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading || isRedirecting}
          className="w-full h-11 text-base font-semibold mt-2"
        >
          {isRedirecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Opening dashboard...</span>
            </>
          ) : isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </>
          )}
        </Button>
      </form>

      <div className="pt-4 border-t border-line text-center text-sm text-muted">
        <span>Already have an account? </span>
        <Link
          href={`/login${callbackUrl !== "/dashboard" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="font-medium text-terracotta hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-paper-2" />}>
      <RegisterForm />
    </Suspense>
  );
}
