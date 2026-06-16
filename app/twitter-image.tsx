// Twitter/X uses the same live progress card as Open Graph. `runtime` and
// `dynamic` must be literal exports (Next can't read them through a re-export),
// so the card stays per-request rather than frozen at build time.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export { default, alt, size, contentType } from "./opengraph-image";
