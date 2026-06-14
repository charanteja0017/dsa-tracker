// Proper YouTube glyph (red rounded badge + white play triangle). lucide-react
// dropped brand icons, so we render it as an inline SVG. Badge color follows
// `currentColor` (set red via className); the triangle stays white.
export function YouTubeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.582 6.186a2.506 2.506 0 0 0-1.768-1.768C18.254 4 12 4 12 4s-6.254 0-7.814.418a2.506 2.506 0 0 0-1.768 1.768C2 7.746 2 12 2 12s0 4.254.418 5.814a2.506 2.506 0 0 0 1.768 1.768C5.746 20 12 20 12 20s6.254 0 7.814-.418a2.506 2.506 0 0 0 1.768-1.768C22 16.254 22 12 22 12s0-4.254-.418-5.814z"
      />
      <path fill="#fff" d="M10 15.5l6-3.5-6-3.5z" />
    </svg>
  );
}
