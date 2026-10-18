export interface LearnerProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_slug: string;
  completed: boolean;
  last_viewed_at: string;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  lesson_slug: string;
  created_at: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_score: number;
  submitted_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName?: string | null;
}
