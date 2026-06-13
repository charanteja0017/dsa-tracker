import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Layered near-black surfaces + a single indigo accent. Defined once,
      // reused everywhere (no scattered hex values in components).
      colors: {
        ink: "#0a0a0f", // page background
        panel: "#14141c", // card background
        panel2: "#1a1a24", // elevated / hover surface
        edge: "#1f1f2a", // borders
        accent: {
          DEFAULT: "#6366f1", // indigo-500
          fg: "#c7d2fe", // indigo-200 text on accent tints
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // 12 / 14 / 16 / 20 / 28 type scale
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "3xl": ["1.75rem", { lineHeight: "2rem" }],
      },
      borderColor: { DEFAULT: "#1f1f2a" },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.4)",
      },
    },
  },
  plugins: [],
} satisfies Config;
