import type { Config } from "tailwindcss";

// Design tokens from docs/brand.md + docs/build-rules.md — do not hand-edit hex values elsewhere in the app,
// change them here so every component stays in sync.
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#131110",
        inkBorder: "#000000",
        shadowInk: "#0d1f24",
        paper: "#F6EFE3",
        teal: { DEFAULT: "#0B7A75", light: "#17A099", dark: "#07514D" },
        accent: { DEFAULT: "#C8912B", light: "#E0AE52", dark: "#96690F" },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: { DEFAULT: "8px" },
      boxShadow: {
        sm: "2px 2px 0px #0d1f24",
        md: "3px 3px 0px #0d1f24",
        lg: "4px 4px 0px #0d1f24",
        xl: "6px 6px 0px #0d1f24",
        "2xl": "8px 8px 0px #0d1f24",
        "dramatic-accent": "12px 12px 0px #C8912B",
        "dramatic-teal": "12px 12px 0px #0B7A75",
      },
      transitionTimingFunction: {
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
