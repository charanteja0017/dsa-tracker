import type { MetadataRoute } from "next";

// Web app manifest → makes the site installable as an app (home-screen icon,
// standalone full-screen window, splash). Served at /manifest.webmanifest.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DSA Placement Tracker",
    short_name: "DSA Tracker",
    description: "23-week DSA placement prep tracker — solve, streak, and pace.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
