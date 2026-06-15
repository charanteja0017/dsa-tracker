import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Archivo } from "next/font/google";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Heavy display face for the oversized hero numbers.
const display = Archivo({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CDSA",
  description: "23-week DSA placement prep tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${display.variable}`}
    >
      <body className="bg-ink text-slate-200 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
