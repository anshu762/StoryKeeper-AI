import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;

export const requestPasswordReset = (opts: {
  email: string;
  redirectTo?: string;
}) => (authClient as any).requestPasswordReset(opts);

export const resetPassword = (opts: {
  newPassword: string;
  token?: string;
}) => (authClient as any).resetPassword(opts);
