export type Difficulty = "Foundational" | "Intermediate";

export type DiagramId = "bit-and-qubit" | "public-key-risk" | "shared-responsibility";

export type QuizChoice = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: QuizChoice[];
  correctChoiceId: string;
  explanation: string;
};

export type LessonBlock =
  | { type: "heading"; id: string; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; title: string; text: string }
  | { type: "code"; label: string; code: string }
  | { type: "link"; href: string; label: string }
  | { type: "illustration"; diagram: DiagramId; caption: string }
  | { type: "concept"; title: string; text: string }
  | { type: "quiz"; questions: QuizQuestion[] };

export type Topic = {
  id: string;
  title: string;
  summary: string;
  description?: string;
  keyConcepts?: string[];
  illustrationSrc?: string;
  illustrationAlt?: string;
  lessonSlugs?: string[];
};

export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  topicId: string;
  difficulty: Difficulty;
  featured: boolean;
  blocks: LessonBlock[];
};

export type LearningPath = {
  id: string;
  title: string;
  summary: string;
  lessonSlugs: string[];
};
