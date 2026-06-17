// The 23 well-known recruiters the seed's `companies` count is drawn from
// (see the header of lib/seedData.ts), in rough prominence order. The seed only
// stores HOW MANY of these tag a problem, not which — so a problem's popover
// shows the top-N of this roster as a representative set, not LeetCode's exact
// per-company tags.
export type Recruiter = { name: string; color: string };

export const RECRUITERS: Recruiter[] = [
  { name: "Google", color: "#4285F4" },
  { name: "Amazon", color: "#FF9900" },
  { name: "Microsoft", color: "#4CC2FF" },
  { name: "Meta", color: "#0866FF" },
  { name: "Apple", color: "#E5E7EB" },
  { name: "Bloomberg", color: "#E8A33D" },
  { name: "LinkedIn", color: "#3AA0DC" },
  { name: "TikTok", color: "#25F4EE" },
  { name: "ByteDance", color: "#5FB0F2" },
  { name: "Nvidia", color: "#76B900" },
  { name: "Atlassian", color: "#2684FF" },
  { name: "Uber", color: "#C9CDD3" },
  { name: "Adobe", color: "#FF5A5A" },
  { name: "Goldman Sachs", color: "#7FA8D6" },
  { name: "Oracle", color: "#E8643F" },
  { name: "Salesforce", color: "#22A6E0" },
  { name: "Walmart", color: "#FFC220" },
  { name: "Flipkart", color: "#3B82F6" },
  { name: "PayPal", color: "#22B3E6" },
  { name: "Visa", color: "#F7B600" },
  { name: "Airbnb", color: "#FF5A5F" },
  { name: "DoorDash", color: "#FF5436" },
  { name: "Snap", color: "#FAE300" },
];

// First `count` recruiters (clamped to the roster) — a representative set for a
// problem tagged by that many of them.
export function companiesFor(count: number): Recruiter[] {
  return RECRUITERS.slice(0, Math.max(0, Math.min(count, RECRUITERS.length)));
}
