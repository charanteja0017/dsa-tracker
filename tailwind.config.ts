import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Blue-tinted near-white surfaces + McLaren orange accent. Defined once,
      // reused everywhere (no scattered hex values in components).
      colors: {
        ink: "#E8EAF0", // page background (subtle blue-white, max channel 240)
        panel: "#DCDEE8", // card background
        panel2: "#D0D3DE", // elevated / hover surface
        edge: "#BCC0CE", // borders
        accent: {
          DEFAULT: "#FF8000", // McLaren papaya orange
          fg: "#C05500", // dark orange for text on light backgrounds
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
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
