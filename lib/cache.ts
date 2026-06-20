// Cache tags for the Next.js Data Cache. Read routes wrap their queries in
// unstable_cache(tags: [...]); write routes call revalidateTag(...) so the very
// next read recomputes — the DB stays the source of truth, so progress is never
// lost, we just stop re-running the same queries on every request.
export const TAG_PROBLEMS = "problems"; // problems table → stats, analytics, list
export const TAG_RECRUITERS = "recruiters";
export const TAG_EXAM = "exam"; // exam pool + exams → list/stats

// How long a cached read may live before a background refresh, as a safety net
// on top of tag invalidation. Problem data only changes on writes (which
// invalidate immediately); the longer windows just bound any missed signal.
export const REVALIDATE_PROBLEMS = 3600; // 1h
export const REVALIDATE_RECRUITERS = 86400; // 1d (only changes on /api/init)
export const REVALIDATE_EXAM = 3600; // 1h
