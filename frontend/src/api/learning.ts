import type { InsForgeClient } from "@insforge/sdk";
import type { Bookmark, LearnerProfile, LessonProgress, QuizResult } from "../types/learning";

export class LearningDataError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "LearningDataError";
    this.cause = cause;
  }
}

/**
 * Learner Profile CRUD
 */
export async function fetchLearnerProfile(
  client: InsForgeClient,
  userId: string,
): Promise<LearnerProfile | null> {
  if (!userId) {
    throw new LearningDataError("User ID is required to fetch profile");
  }

  const { data, error } = await client.database
    .from("learner_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new LearningDataError(`Failed to fetch learner profile: ${error.message || String(error)}`, error);
  }

  return (data as LearnerProfile | null) ?? null;
}

export async function upsertLearnerProfile(
  client: InsForgeClient,
  params: {
    userId: string;
    displayName: string;
    avatarUrl?: string | null;
  },
): Promise<LearnerProfile> {
  const { userId, displayName, avatarUrl } = params;
  if (!userId) {
    throw new LearningDataError("User ID is required to update profile");
  }

  const now = new Date().toISOString();
  const payload = {
    user_id: userId,
    display_name: displayName.trim(),
    avatar_url: avatarUrl ?? null,
    updated_at: now,
  };

  const { data, error } = await client.database
    .from("learner_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();

  if (error || !data) {
    throw new LearningDataError(
      `Failed to save learner profile: ${error ? error.message : "No data returned"}`,
      error,
    );
  }

  return data as LearnerProfile;
}

/**
 * Lesson Progress
 */
export async function fetchLessonProgress(
  client: InsForgeClient,
  userId: string,
): Promise<LessonProgress[]> {
  if (!userId) {
    throw new LearningDataError("User ID is required to fetch lesson progress");
  }

  const { data, error } = await client.database
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new LearningDataError(`Failed to fetch progress: ${error.message || String(error)}`, error);
  }

  return (data as LessonProgress[]) || [];
}

export async function saveLessonProgress(
  client: InsForgeClient,
  params: {
    userId: string;
    lessonSlug: string;
    completed: boolean;
  },
): Promise<LessonProgress> {
  const { userId, lessonSlug, completed } = params;
  if (!userId) {
    throw new LearningDataError("User ID is required to save lesson progress");
  }
  if (!lessonSlug) {
    throw new LearningDataError("Lesson slug is required");
  }

  const now = new Date().toISOString();
  const payload = {
    user_id: userId,
    lesson_slug: lessonSlug,
    completed,
    last_viewed_at: now,
    updated_at: now,
  };

  const { data, error } = await client.database
    .from("lesson_progress")
    .upsert(payload, { onConflict: "user_id,lesson_slug" })
    .select()
    .single();

  if (error || !data) {
    throw new LearningDataError(
      `Failed to save lesson progress: ${error ? error.message : "No data returned"}`,
      error,
    );
  }

  return data as LessonProgress;
}

/**
 * Bookmarks
 */
export async function fetchBookmarks(
  client: InsForgeClient,
  userId: string,
): Promise<Bookmark[]> {
  if (!userId) {
    throw new LearningDataError("User ID is required to fetch bookmarks");
  }

  const { data, error } = await client.database
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new LearningDataError(`Failed to fetch bookmarks: ${error.message || String(error)}`, error);
  }

  return (data as Bookmark[]) || [];
}

export async function addBookmark(
  client: InsForgeClient,
  params: {
    userId: string;
    lessonSlug: string;
  },
): Promise<Bookmark> {
  const { userId, lessonSlug } = params;
  if (!userId) {
    throw new LearningDataError("User ID is required to add bookmark");
  }
  if (!lessonSlug) {
    throw new LearningDataError("Lesson slug is required");
  }

  const { data, error } = await client.database
    .from("bookmarks")
    .insert([{ user_id: userId, lesson_slug: lessonSlug }])
    .select()
    .single();

  if (error || !data) {
    // If bookmark already exists (unique constraint violation), fetch and return it
    if (error && (error.code === "23505" || error.message?.includes("duplicate") || error.message?.includes("unique"))) {
      const { data: existing } = await client.database
        .from("bookmarks")
        .select("*")
        .eq("user_id", userId)
        .eq("lesson_slug", lessonSlug)
        .single();
      if (existing) {
        return existing as Bookmark;
      }
    }
    throw new LearningDataError(
      `Failed to add bookmark: ${error ? error.message : "No data returned"}`,
      error,
    );
  }

  return data as Bookmark;
}

export async function removeBookmark(
  client: InsForgeClient,
  params: {
    userId: string;
    lessonSlug: string;
  },
): Promise<void> {
  const { userId, lessonSlug } = params;
  if (!userId) {
    throw new LearningDataError("User ID is required to remove bookmark");
  }
  if (!lessonSlug) {
    throw new LearningDataError("Lesson slug is required");
  }

  const { error } = await client.database
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("lesson_slug", lessonSlug);

  if (error) {
    throw new LearningDataError(`Failed to remove bookmark: ${error.message || String(error)}`, error);
  }
}

/**
 * Quiz Results
 */
export async function fetchQuizResults(
  client: InsForgeClient,
  userId: string,
): Promise<QuizResult[]> {
  if (!userId) {
    throw new LearningDataError("User ID is required to fetch quiz results");
  }

  const { data, error } = await client.database
    .from("quiz_results")
    .select("*")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });

  if (error) {
    throw new LearningDataError(`Failed to fetch quiz results: ${error.message || String(error)}`, error);
  }

  return (data as QuizResult[]) || [];
}

export async function saveQuizResult(
  client: InsForgeClient,
  params: {
    userId: string;
    quizId: string;
    score: number;
    totalScore: number;
  },
): Promise<QuizResult> {
  const { userId, quizId, score, totalScore } = params;

  if (!userId) {
    throw new LearningDataError("User ID is required to save quiz result");
  }
  if (!quizId) {
    throw new LearningDataError("Quiz identifier is required");
  }

  // Strict score validations matching database constraints
  if (score < 0) {
    throw new LearningDataError("Quiz score cannot be negative");
  }
  if (totalScore <= 0) {
    throw new LearningDataError("Total score must be greater than zero");
  }
  if (score > totalScore) {
    throw new LearningDataError("Score cannot exceed total score");
  }

  const payload = {
    user_id: userId,
    quiz_id: quizId,
    score,
    total_score: totalScore,
    submitted_at: new Date().toISOString(),
  };

  const { data, error } = await client.database
    .from("quiz_results")
    .insert([payload])
    .select()
    .single();

  if (error || !data) {
    throw new LearningDataError(
      `Failed to record quiz result: ${error ? error.message : "No data returned"}`,
      error,
    );
  }

  return data as QuizResult;
}
