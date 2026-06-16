"use client";

import dynamic from "next/dynamic";

// Lazy-load the Lottie player so its runtime stays out of the initial bundle
// and never runs on the server.
const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((m) => m.DotLottieReact),
  { ssr: false }
);

// Full-screen, click-through celebration that plays a Lottie once. The page
// mounts it for a moment then unmounts it.
export function Celebration({ src }: { src: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div className="celeb-pop">
        <DotLottieReact
          src={src}
          autoplay
          loop={false}
          className="h-72 w-72 sm:h-96 sm:w-96"
        />
      </div>
    </div>
  );
}
