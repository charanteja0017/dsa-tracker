// Pure, deterministic exam-generation primitives. No DB, no Date.now() inside —
// callers pass `nowMs` so the functions are fully testable and reproducible:
// same (pool, size, seed, nowMs, topicOrder) → same ordered selection.

// ── Seeded PRNG ────────────────────────────────────────────────────────────
// xfnv1a string hash → 32-bit seed, then mulberry32 for the stream.
export function hashSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngFromSeed(seed: string): () => number {
  return mulberry32(hashSeed(seed));
}

// ── Cooldown-modulated effective weight ────────────────────────────────────
export type PoolItem = {
  externalId: number;
  title: string;
  topic: string;
  weight: number; // base: 3 most-asked, 1 standard
  timesUsed: number;
  lastUsedMs: number | null;
};

export type CooldownOpts = {
  // Days after which a used problem returns to full weight.
  recoveryDays?: number;
  // Smallest fraction of base weight a fully-suppressed item keeps, so the pool
  // can never be drawn dry (borrowing still works when everything is on cooldown).
  floorFraction?: number;
};

// base × frequency-penalty × recency. A just-used / often-used problem is
// sharply suppressed; one untouched for `recoveryDays` is back to full weight.
export function effectiveWeight(
  item: PoolItem,
  nowMs: number,
  opts: CooldownOpts = {}
): number {
  const recoveryDays = opts.recoveryDays ?? 30;
  const floorFraction = opts.floorFraction ?? 0.0015;

  const freqPenalty = 1 / (1 + Math.max(0, item.timesUsed));

  let recency = 1;
  if (item.lastUsedMs !== null) {
    const days = Math.max(0, (nowMs - item.lastUsedMs) / 86_400_000);
    const r = Math.min(1, days / recoveryDays);
    recency = r * r; // sharp: recent use ≈ 0, eases back to 1
  }

  const base = item.weight;
  return Math.max(base * freqPenalty * recency, base * floorFraction);
}

// ── Largest-remainder allocation ───────────────────────────────────────────
// Split `total` slots across buckets proportional to `weights`, summing exactly
// to total (or to the weight sum if smaller). Deterministic tie-break by index.
export function largestRemainderAllocate(
  weights: number[],
  total: number
): number[] {
  const n = weights.length;
  if (n === 0 || total <= 0) return new Array(n).fill(0);
  const sum = weights.reduce((a, b) => a + Math.max(0, b), 0);
  if (sum <= 0) return new Array(n).fill(0);

  const raw = weights.map((w) => (Math.max(0, w) / sum) * total);
  const alloc = raw.map(Math.floor);
  let used = alloc.reduce((a, b) => a + b, 0);

  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);

  let k = 0;
  while (used < total && k < 10_000) {
    alloc[order[k % order.length].i]++;
    used++;
    k++;
  }
  return alloc;
}

// ── Weighted sampling without replacement ──────────────────────────────────
export function weightedSampleWithoutReplacement<T>(
  items: T[],
  weightOf: (t: T) => number,
  k: number,
  rng: () => number
): T[] {
  const pool = items.slice();
  const weights = pool.map((t) => Math.max(0, weightOf(t)));
  const out: T[] = [];
  const take = Math.min(k, pool.length);

  for (let n = 0; n < take; n++) {
    let total = 0;
    for (const w of weights) total += w;

    let idx: number;
    if (total <= 0) {
      idx = Math.floor(rng() * pool.length);
    } else {
      let r = rng() * total;
      idx = 0;
      for (; idx < pool.length - 1; idx++) {
        r -= weights[idx];
        if (r <= 0) break;
      }
    }
    out.push(pool[idx]);
    pool.splice(idx, 1);
    weights.splice(idx, 1);
  }
  return out;
}

// ── The exam builder ───────────────────────────────────────────────────────
// Stratify across topics (slots ∝ topic size, largest-remainder), then weighted
// sample WITHOUT replacement inside each topic using cooldown-effective weights
// and the seeded PRNG. Shortfalls (a topic short on fresh items) are borrowed
// from the rest of the pool, still weighted + seeded. Returns ordered externalIds.
export function buildExam(
  pool: PoolItem[],
  size: number,
  seed: string,
  nowMs: number,
  topicOrder: string[],
  opts: CooldownOpts = {}
): number[] {
  const rng = rngFromSeed(seed);
  const target = Math.min(size, pool.length);
  if (target <= 0) return [];

  const weightOf = (it: PoolItem) => effectiveWeight(it, nowMs, opts);

  // Group by topic, keeping topicOrder; append any unknown topics at the end.
  const byTopic = new Map<string, PoolItem[]>();
  for (const it of pool) {
    const arr = byTopic.get(it.topic);
    if (arr) arr.push(it);
    else byTopic.set(it.topic, [it]);
  }
  const topics = [
    ...topicOrder.filter((t) => byTopic.has(t)),
    ...[...byTopic.keys()].filter((t) => !topicOrder.includes(t)),
  ];

  const sizes = topics.map((t) => byTopic.get(t)!.length);
  const alloc = largestRemainderAllocate(sizes, target);

  const chosen: PoolItem[] = [];
  const chosenIds = new Set<number>();

  topics.forEach((t, ti) => {
    const want = alloc[ti];
    if (want <= 0) return;
    const picks = weightedSampleWithoutReplacement(
      byTopic.get(t)!,
      weightOf,
      want,
      rng
    );
    for (const p of picks) {
      chosen.push(p);
      chosenIds.add(p.externalId);
    }
  });

  // Borrow to cover any shortfall (topics that couldn't fill their allocation).
  if (chosen.length < target) {
    const remaining = pool.filter((p) => !chosenIds.has(p.externalId));
    const extra = weightedSampleWithoutReplacement(
      remaining,
      weightOf,
      target - chosen.length,
      rng
    );
    for (const p of extra) {
      chosen.push(p);
      chosenIds.add(p.externalId);
    }
  }

  // Order the paper by topic (A2Z), most-asked first, then id — stable + readable.
  const topicRank = new Map(topics.map((t, i) => [t, i]));
  chosen.sort(
    (a, b) =>
      (topicRank.get(a.topic) ?? 0) - (topicRank.get(b.topic) ?? 0) ||
      b.weight - a.weight ||
      a.externalId - b.externalId
  );

  return chosen.map((p) => p.externalId);
}
