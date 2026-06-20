// Maps the study-plan patterns (LeetCode side) to Striver A2Z exam topics, plus
// a prerequisite graph over the 17 A2Z topics. Powers the Weekly Exam: a topic's
// problems "open" only once you've completed — in the study plan — that topic
// AND every topic it builds on. Pure + shared (client computes the unlocked/
// locked display; the server uses it to restrict the exam pool).

// Study pattern → the A2Z topic(s) it covers. Patterns not listed here
// (Revision / Timed OA / Company sets / Final polish) are "mixed" and unlock
// nothing on their own.
export const PATTERN_TO_A2Z: Record<string, string[]> = {
  // Arrays & Hashing is week 1, so it carries the A2Z foundations (Basics &
  // Maths, Sorting) — otherwise nothing could unlock until the late bit-manip
  // week, since those are prerequisites of Arrays.
  "Arrays & Hashing": ["Arrays", "Sorting", "Basics & Maths"],
  "Two Pointers": ["Sliding Window & Two Pointer", "Strings"],
  "Sliding Window": ["Sliding Window & Two Pointer"],
  Stack: ["Stacks & Queues"],
  "Binary Search": ["Binary Search"],
  "Linked List": ["Linked List"],
  Trees: ["Binary Trees", "Binary Search Trees"],
  "Tries + Heaps": ["Tries & Strings (Advanced)", "Heaps & Priority Queue"],
  Backtracking: ["Recursion & Backtracking"],
  Graphs: ["Graphs"],
  "Advanced Graphs": ["Graphs"],
  "1-D DP": ["Dynamic Programming"],
  "2-D DP": ["Dynamic Programming"],
  "Greedy + Intervals": ["Greedy"],
  "Math & Bit Manipulation": ["Bit Manipulation"],
};

// Each A2Z topic ← the topics it directly builds on. Keys are in A2Z order, so
// Object.keys() doubles as the canonical topic ordering.
export const A2Z_PREREQS: Record<string, string[]> = {
  "Basics & Maths": [],
  Sorting: ["Basics & Maths"],
  Arrays: ["Basics & Maths", "Sorting"],
  "Binary Search": ["Arrays"],
  Strings: ["Arrays"],
  "Linked List": ["Arrays"],
  "Recursion & Backtracking": ["Arrays"],
  "Bit Manipulation": ["Basics & Maths"],
  "Stacks & Queues": ["Arrays", "Linked List"],
  "Sliding Window & Two Pointer": ["Arrays"],
  "Heaps & Priority Queue": ["Arrays", "Sorting"],
  Greedy: ["Arrays", "Sorting"],
  "Binary Trees": ["Recursion & Backtracking"],
  "Binary Search Trees": ["Binary Trees", "Binary Search"],
  Graphs: ["Recursion & Backtracking", "Stacks & Queues"],
  "Dynamic Programming": ["Recursion & Backtracking"],
  "Tries & Strings (Advanced)": ["Strings"],
};

export const A2Z_TOPICS = Object.keys(A2Z_PREREQS);

// Optional per-problem extra prerequisites for genuinely cross-topic problems
// (keyed by exact exam title). Add entries here to require extra topics beyond
// the problem's own A2Z topic. Kept small + editable on purpose.
export const A2Z_OVERRIDES: Record<string, string[]> = {
  "Flatten Binary Tree to Linked List": ["Linked List"],
};

// Reverse map: A2Z topic → the study pattern(s) that feed it.
const TOPIC_TO_PATTERNS: Record<string, string[]> = (() => {
  const out: Record<string, string[]> = {};
  for (const [pattern, topics] of Object.entries(PATTERN_TO_A2Z)) {
    for (const t of topics) (out[t] ??= []).push(pattern);
  }
  return out;
})();

type DoneRow = { pattern: string; done: boolean };

// Study patterns that are 100% complete.
export function completedPatterns(rows: DoneRow[]): Set<string> {
  const total = new Map<string, number>();
  const done = new Map<string, number>();
  for (const r of rows) {
    total.set(r.pattern, (total.get(r.pattern) ?? 0) + 1);
    if (r.done) done.set(r.pattern, (done.get(r.pattern) ?? 0) + 1);
  }
  const out = new Set<string>();
  for (const [pattern, t] of total) {
    if (t > 0 && (done.get(pattern) ?? 0) === t) out.add(pattern);
  }
  return out;
}

// A topic is "covered" when every study pattern that feeds it is complete.
export function coveredTopics(completed: Set<string>): Set<string> {
  const out = new Set<string>();
  for (const topic of A2Z_TOPICS) {
    const pats = TOPIC_TO_PATTERNS[topic];
    if (pats && pats.length > 0 && pats.every((p) => completed.has(p))) {
      out.add(topic);
    }
  }
  return out;
}

function closure(topic: string, acc = new Set<string>()): Set<string> {
  if (acc.has(topic)) return acc;
  acc.add(topic);
  for (const pre of A2Z_PREREQS[topic] ?? []) closure(pre, acc);
  return acc;
}

// A topic is "open" when it AND its whole prerequisite chain are covered.
export function openTopics(completed: Set<string>): Set<string> {
  const covered = coveredTopics(completed);
  const out = new Set<string>();
  for (const topic of A2Z_TOPICS) {
    if ([...closure(topic)].every((t) => covered.has(t))) out.add(topic);
  }
  return out;
}

// Is a specific exam problem unlocked? Its topic must be open and any override
// topics covered.
export function problemUnlocked(
  title: string,
  topic: string,
  covered: Set<string>,
  open: Set<string>
): boolean {
  if (!open.has(topic)) return false;
  const extra = A2Z_OVERRIDES[title];
  return !extra || extra.every((t) => covered.has(t));
}

export type TopicStatus = {
  topic: string;
  open: boolean;
  covered: boolean;
  // study patterns you still need to finish to open this topic
  needs: string[];
};

// Per-topic status for the UI, in A2Z order.
export function topicStatuses(completed: Set<string>): TopicStatus[] {
  const covered = coveredTopics(completed);
  return A2Z_TOPICS.map((topic) => {
    const chain = [...closure(topic)];
    const open = chain.every((t) => covered.has(t));
    const needs = new Set<string>();
    for (const t of chain) {
      if (covered.has(t)) continue;
      for (const p of TOPIC_TO_PATTERNS[t] ?? []) {
        if (!completed.has(p)) needs.add(p);
      }
    }
    return { topic, open, covered: covered.has(topic), needs: [...needs] };
  });
}
