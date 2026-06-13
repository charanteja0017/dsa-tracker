// Top-60 highest-frequency interview problems across 12 target companies
// (Google, Amazon, Microsoft, Meta, Apple, Uber, Adobe, Flipkart, Goldman
//  Sachs, Oracle, Salesforce, Walmart). `week` aligns to the 23-week roadmap
// so the UI can group week -> pattern -> problem in study order.

export type SeedProblem = {
  title: string;
  companies: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  pattern: string;
  week: number;
  link: string;
};

export const SEED_PROBLEMS: SeedProblem[] = [
  // —— Week 1 ——
  { title: "First Missing Positive", companies: 11, difficulty: "HARD", pattern: "Hash Table", week: 1, link: "https://leetcode.com/problems/first-missing-positive" },
  { title: "Group Anagrams", companies: 10, difficulty: "MEDIUM", pattern: "Hash Table", week: 1, link: "https://leetcode.com/problems/group-anagrams" },
  { title: "Integer to Roman", companies: 10, difficulty: "MEDIUM", pattern: "Hash Table", week: 1, link: "https://leetcode.com/problems/integer-to-roman" },
  { title: "Two Sum", companies: 10, difficulty: "EASY", pattern: "Hash Table", week: 1, link: "https://leetcode.com/problems/two-sum" },
  { title: "Roman to Integer", companies: 9, difficulty: "EASY", pattern: "Hash Table", week: 1, link: "https://leetcode.com/problems/roman-to-integer" },
  { title: "Insert Interval", companies: 8, difficulty: "MEDIUM", pattern: "Array", week: 1, link: "https://leetcode.com/problems/insert-interval" },
  { title: "Longest Common Prefix", companies: 8, difficulty: "EASY", pattern: "String", week: 1, link: "https://leetcode.com/problems/longest-common-prefix" },
  { title: "String to Integer (atoi)", companies: 8, difficulty: "MEDIUM", pattern: "String", week: 1, link: "https://leetcode.com/problems/string-to-integer-atoi" },
  { title: "Text Justification", companies: 8, difficulty: "HARD", pattern: "Array", week: 1, link: "https://leetcode.com/problems/text-justification" },
  { title: "Zigzag Conversion", companies: 8, difficulty: "MEDIUM", pattern: "String", week: 1, link: "https://leetcode.com/problems/zigzag-conversion" },
  { title: "Add Binary", companies: 7, difficulty: "EASY", pattern: "String", week: 1, link: "https://leetcode.com/problems/add-binary" },
  // —— Week 2 ——
  { title: "Trapping Rain Water", companies: 11, difficulty: "HARD", pattern: "Two Pointers", week: 2, link: "https://leetcode.com/problems/trapping-rain-water" },
  { title: "3Sum", companies: 10, difficulty: "MEDIUM", pattern: "Two Pointers", week: 2, link: "https://leetcode.com/problems/3sum" },
  { title: "Container With Most Water", companies: 10, difficulty: "MEDIUM", pattern: "Two Pointers", week: 2, link: "https://leetcode.com/problems/container-with-most-water" },
  { title: "Longest Palindromic Substring", companies: 9, difficulty: "MEDIUM", pattern: "Two Pointers", week: 2, link: "https://leetcode.com/problems/longest-palindromic-substring" },
  { title: "Sort Colors", companies: 9, difficulty: "MEDIUM", pattern: "Two Pointers", week: 2, link: "https://leetcode.com/problems/sort-colors" },
  { title: "Merge Sorted Array", companies: 8, difficulty: "EASY", pattern: "Two Pointers", week: 2, link: "https://leetcode.com/problems/merge-sorted-array" },
  { title: "Remove Duplicates from Sorted Array", companies: 8, difficulty: "EASY", pattern: "Two Pointers", week: 2, link: "https://leetcode.com/problems/remove-duplicates-from-sorted-array" },
  { title: "3Sum Closest", companies: 7, difficulty: "MEDIUM", pattern: "Two Pointers", week: 2, link: "https://leetcode.com/problems/3sum-closest" },
  { title: "4Sum", companies: 7, difficulty: "MEDIUM", pattern: "Two Pointers", week: 2, link: "https://leetcode.com/problems/4sum" },
  { title: "Find the Index of the First Occurrence in a String", companies: 7, difficulty: "EASY", pattern: "Two Pointers", week: 2, link: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string" },
  { title: "Next Permutation", companies: 7, difficulty: "MEDIUM", pattern: "Two Pointers", week: 2, link: "https://leetcode.com/problems/next-permutation" },
  // —— Week 3 ——
  { title: "Longest Substring Without Repeating Characters", companies: 11, difficulty: "MEDIUM", pattern: "Sliding Window", week: 3, link: "https://leetcode.com/problems/longest-substring-without-repeating-characters" },
  { title: "Minimum Window Substring", companies: 8, difficulty: "HARD", pattern: "Sliding Window", week: 3, link: "https://leetcode.com/problems/minimum-window-substring" },
  // —— Week 4 ——
  { title: "Valid Parentheses", companies: 9, difficulty: "EASY", pattern: "Stack", week: 4, link: "https://leetcode.com/problems/valid-parentheses" },
  { title: "Largest Rectangle in Histogram", companies: 7, difficulty: "HARD", pattern: "Stack", week: 4, link: "https://leetcode.com/problems/largest-rectangle-in-histogram" },
  // —— Week 5 ——
  { title: "Search in Rotated Sorted Array", companies: 11, difficulty: "MEDIUM", pattern: "Binary Search", week: 5, link: "https://leetcode.com/problems/search-in-rotated-sorted-array" },
  { title: "Median of Two Sorted Arrays", companies: 10, difficulty: "HARD", pattern: "Binary Search", week: 5, link: "https://leetcode.com/problems/median-of-two-sorted-arrays" },
  { title: "Merge Intervals", companies: 10, difficulty: "MEDIUM", pattern: "Sorting", week: 5, link: "https://leetcode.com/problems/merge-intervals" },
  { title: "Validate Binary Search Tree", companies: 8, difficulty: "MEDIUM", pattern: "Binary Search", week: 5, link: "https://leetcode.com/problems/validate-binary-search-tree" },
  { title: "Find First and Last Position of Element in Sorted Array", companies: 7, difficulty: "MEDIUM", pattern: "Binary Search", week: 5, link: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array" },
  { title: "Search a 2D Matrix", companies: 7, difficulty: "MEDIUM", pattern: "Binary Search", week: 5, link: "https://leetcode.com/problems/search-a-2d-matrix" },
  { title: "Sqrt(x)", companies: 7, difficulty: "EASY", pattern: "Binary Search", week: 5, link: "https://leetcode.com/problems/sqrtx" },
  // —— Week 6 ——
  { title: "Add Two Numbers", companies: 9, difficulty: "MEDIUM", pattern: "Linked List", week: 6, link: "https://leetcode.com/problems/add-two-numbers" },
  { title: "Merge Two Sorted Lists", companies: 9, difficulty: "EASY", pattern: "Linked List", week: 6, link: "https://leetcode.com/problems/merge-two-sorted-lists" },
  // —— Week 8 ——
  { title: "Same Tree", companies: 7, difficulty: "EASY", pattern: "Tree", week: 8, link: "https://leetcode.com/problems/same-tree" },
  // —— Week 10 ——
  { title: "Merge k Sorted Lists", companies: 8, difficulty: "HARD", pattern: "Heap (Priority Queue)", week: 10, link: "https://leetcode.com/problems/merge-k-sorted-lists" },
  // —— Week 11 ——
  { title: "Combination Sum", companies: 8, difficulty: "MEDIUM", pattern: "Backtracking", week: 11, link: "https://leetcode.com/problems/combination-sum" },
  { title: "Letter Combinations of a Phone Number", companies: 8, difficulty: "MEDIUM", pattern: "Backtracking", week: 11, link: "https://leetcode.com/problems/letter-combinations-of-a-phone-number" },
  { title: "N-Queens", companies: 8, difficulty: "HARD", pattern: "Backtracking", week: 11, link: "https://leetcode.com/problems/n-queens" },
  { title: "Permutations", companies: 8, difficulty: "MEDIUM", pattern: "Backtracking", week: 11, link: "https://leetcode.com/problems/permutations" },
  { title: "Word Search", companies: 8, difficulty: "MEDIUM", pattern: "Backtracking", week: 11, link: "https://leetcode.com/problems/word-search" },
  { title: "Generate Parentheses", companies: 7, difficulty: "MEDIUM", pattern: "Backtracking", week: 11, link: "https://leetcode.com/problems/generate-parentheses" },
  { title: "Subsets", companies: 7, difficulty: "MEDIUM", pattern: "Backtracking", week: 11, link: "https://leetcode.com/problems/subsets" },
  // —— Week 14 ——
  { title: "Jump Game", companies: 11, difficulty: "MEDIUM", pattern: "Dynamic Programming", week: 14, link: "https://leetcode.com/problems/jump-game" },
  { title: "Decode Ways", companies: 10, difficulty: "MEDIUM", pattern: "Dynamic Programming", week: 14, link: "https://leetcode.com/problems/decode-ways" },
  { title: "Jump Game II", companies: 10, difficulty: "MEDIUM", pattern: "Dynamic Programming", week: 14, link: "https://leetcode.com/problems/jump-game-ii" },
  { title: "Maximal Rectangle", companies: 9, difficulty: "HARD", pattern: "Dynamic Programming", week: 14, link: "https://leetcode.com/problems/maximal-rectangle" },
  { title: "Maximum Subarray", companies: 9, difficulty: "MEDIUM", pattern: "Dynamic Programming", week: 14, link: "https://leetcode.com/problems/maximum-subarray" },
  { title: "Climbing Stairs", companies: 8, difficulty: "EASY", pattern: "Dynamic Programming", week: 14, link: "https://leetcode.com/problems/climbing-stairs" },
  { title: "Minimum Path Sum", companies: 8, difficulty: "MEDIUM", pattern: "Dynamic Programming", week: 14, link: "https://leetcode.com/problems/minimum-path-sum" },
  { title: "Unique Paths", companies: 8, difficulty: "MEDIUM", pattern: "Dynamic Programming", week: 14, link: "https://leetcode.com/problems/unique-paths" },
  { title: "Wildcard Matching", companies: 8, difficulty: "HARD", pattern: "Dynamic Programming", week: 14, link: "https://leetcode.com/problems/wildcard-matching" },
  { title: "Longest Valid Parentheses", companies: 7, difficulty: "HARD", pattern: "Dynamic Programming", week: 14, link: "https://leetcode.com/problems/longest-valid-parentheses" },
  // —— Week 18 ——
  { title: "Pow(x, n)", companies: 9, difficulty: "MEDIUM", pattern: "Math", week: 18, link: "https://leetcode.com/problems/powx-n" },
  { title: "Rotate Image", companies: 9, difficulty: "MEDIUM", pattern: "Matrix", week: 18, link: "https://leetcode.com/problems/rotate-image" },
  { title: "Set Matrix Zeroes", companies: 8, difficulty: "MEDIUM", pattern: "Matrix", week: 18, link: "https://leetcode.com/problems/set-matrix-zeroes" },
  { title: "Spiral Matrix", companies: 8, difficulty: "MEDIUM", pattern: "Matrix", week: 18, link: "https://leetcode.com/problems/spiral-matrix" },
  { title: "Valid Sudoku", companies: 8, difficulty: "MEDIUM", pattern: "Matrix", week: 18, link: "https://leetcode.com/problems/valid-sudoku" },
  { title: "Palindrome Number", companies: 7, difficulty: "EASY", pattern: "Math", week: 18, link: "https://leetcode.com/problems/palindrome-number" },
];

// Week topic labels — mirror the 23-week roadmap. Used for week headers.
export const WEEK_TOPICS: Record<number, string> = {
  1: "Python DS rebuild + Arrays & Hashing",
  2: "Two Pointers + intro Sliding Window",
  3: "Sliding Window (full)",
  4: "Stack",
  5: "Binary Search",
  6: "Linked List (part 1) + revision",
  7: "Linked List (part 2)",
  8: "Trees (part 1) — traversal & basics",
  9: "Trees (part 2) — BST & harder",
  10: "Tries + Heaps / Priority Queue",
  11: "Backtracking",
  12: "Graphs (part 1) — DFS/BFS",
  13: "Graphs (part 2) — Union Find / advanced",
  14: "1-D Dynamic Programming",
  15: "2-D Dynamic Programming (part 1)",
  16: "2-D Dynamic Programming (part 2)",
  17: "Greedy + Intervals",
  18: "Math & Geometry + Bit Manipulation",
  19: "Buffer + Phase A–C revision",
  20: "Timed OA simulation — mixed",
  21: "Company sets — Amazon/Microsoft/Google",
  22: "Company sets — bio-AI & general ML",
  23: "Final polish — weak spots, speed",
};