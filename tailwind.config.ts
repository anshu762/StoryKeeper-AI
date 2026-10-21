import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        paper: "var(--paper)",
        "paper-2": "var(--paper-2)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        terracotta: {
          DEFAULT: "var(--terracotta)",
          hover: "var(--terracotta-hover)",
          subtle: "var(--terracotta-subtle)",
        },
        saffron: {
          DEFAULT: "var(--saffron)",
          hover: "var(--saffron-hover)",
          subtle: "var(--saffron-subtle)",
        },
        moss: {
          DEFAULT: "var(--moss)",
          hover: "var(--moss-hover)",
          subtle: "var(--moss-subtle)",
        },
        plum: {
          DEFAULT: "var(--plum)",
          hover: "var(--plum-hover)",
          subtle: "var(--plum-subtle)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        "devanagari-serif": ["var(--font-noto-serif-devanagari)", "serif"],
        "devanagari-sans": ["var(--font-noto-sans-devanagari)", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "20px",
        "2xl": "24px",
      },
      boxShadow: {
        warm: "0 2px 8px -2px rgba(31, 26, 23, 0.05), 0 8px 24px -4px rgba(31, 26, 23, 0.08)",
        "warm-lg": "0 8px 30px -4px rgba(31, 26, 23, 0.1), 0 20px 48px -8px rgba(31, 26, 23, 0.12)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
