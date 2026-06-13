import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DSA Placement Tracker",
  description: "23-week placement prep tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
