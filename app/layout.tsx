import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Archivo } from "next/font/google";
import { PwaRegister } from "@/components/PwaRegister";

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

const vercelHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const siteUrl = vercelHost ? `https://${vercelHost}` : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "CDSA",
  description: "23-week DSA placement prep tracker",
  applicationName: "DSA Tracker",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DSA Tracker",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "CDSA — DSA Placement Tracker",
    description:
      "Live progress: problems solved, current streak, and pace to the goal.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
        <PwaRegister />
      </body>
    </html>
  );
}
