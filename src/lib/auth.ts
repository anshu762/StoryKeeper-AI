import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

export const auth = betterAuth({
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "storykeeper-dev-secret-key-at-least-32-chars-long",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    async sendResetPassword({ user, url }) {
      if (process.env.RESEND_API_KEY) {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from:
                process.env.EMAIL_FROM ||
                "StoryKeeper Archive <archive@storykeeper.org>",
              to: user.email,
              subject: "Reset your StoryKeeper AI password",
              html: `
                <div style="font-family: serif; color: #1F1A17; max-width: 600px; margin: 0 auto; padding: 24px;">
                  <h1 style="color: #B5472B; font-size: 24px;">StoryKeeper AI</h1>
                  <p>You requested a password reset for your account.</p>
                  <p style="margin: 24px 0;">
                    <a href="${url}" style="background-color: #B5472B; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
                  </p>
                  <p style="font-size: 13px; color: #6B625A;">If you did not request this, you can safely ignore this email.</p>
                </div>
              `,
            }),
          });
          if (!res.ok) {
            console.error(
              "[RESEND ERROR] Failed to send password reset email:",
              await res.text()
            );
          }
        } catch (err) {
          console.error("[RESEND EXCEPTION] Error sending email:", err);
        }
      } else {
        console.log(
          `\n=========================================\n[DEV AUTH] Password reset link for ${user.email}:\n${url}\n=========================================\n`
        );
      }
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "CONTRIBUTOR",
      },
      preferredLanguage: {
        type: "string",
        required: false,
        defaultValue: "en",
      },
      defaultPermission: {
        type: "string",
        required: false,
        defaultValue: "PUBLIC",
      },
      defaultDisplay: {
        type: "string",
        required: false,
        defaultValue: "NAMED",
      },
      allowPublicEmail: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});
