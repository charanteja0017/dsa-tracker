// Shapes returned by the exam API (mirror the new exam_* tables). Kept separate
// from the study-plan types so exam mode stays isolated.

export type ExamStatus = "active" | "submitted";

export type ExamItem = {
  itemId: number;
  position: number;
  solved: boolean;
  solvedAt: string | null;
  externalId: number;
  title: string;
  topic: string;
  difficulty: string;
  // Solution links are withheld (null) while the exam is active, revealed on
  // submit so you can't peek mid-exam.
  youtube: string | null;
  article: string | null;
};

export type Exam = {
  id: string;
  createdAt: string;
  size: number;
  status: ExamStatus;
  seed: string;
  items: ExamItem[];
};

export type ExamSummary = {
  id: string;
  createdAt: string;
  size: number;
  status: ExamStatus;
  solved: number;
};

export type ExamListResponse = {
  exams: ExamSummary[];
  poolTotal: number;
  poolFresh: number; // not used recently — eligible for a fresh exam
};
