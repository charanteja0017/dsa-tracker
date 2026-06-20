// Shapes returned by the exam API (mirror the new exam_* tables). Kept separate
// from the study-plan types so exam mode stays isolated.

export type ExamStatus = "active" | "submitted";
export type ExamKind = "standard" | "weekly";

export type ExamItem = {
  itemId: number;
  position: number;
  solved: boolean;
  solvedAt: string | null;
  externalId: number;
  title: string;
  topic: string;
  difficulty: string;
  // `article` is the problem page — available during the exam so you can open
  // and solve it. `youtube` is the walkthrough video (a spoiler) — withheld
  // (null) while active, revealed on submit.
  youtube: string | null;
  article: string | null;
};

export type Exam = {
  id: string;
  createdAt: string;
  size: number;
  status: ExamStatus;
  seed: string;
  kind: ExamKind;
  topics: string[];
  score: number; // points earned (by difficulty) for solved problems
  maxScore: number; // points available across all problems
  items: ExamItem[];
};

export type ExamSummary = {
  id: string;
  createdAt: string;
  size: number;
  status: ExamStatus;
  kind: ExamKind;
  solved: number;
  score: number;
  maxScore: number;
};

export type ExamTopicStat = {
  topic: string;
  total: number; // available in the pool
  written: number; // appeared in at least one exam
  solved: number; // solved in at least one exam
};

export type ExamListResponse = {
  exams: ExamSummary[];
  poolTotal: number;
  poolFresh: number; // not used recently — eligible for a fresh exam
  writtenTotal: number;
  solvedTotal: number;
  byTopic: ExamTopicStat[];
  examsByDay: { date: string; count: number }[]; // exams created per day
};
