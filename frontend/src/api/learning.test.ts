import type { InsForgeClient } from "@insforge/sdk";
import { describe, expect, it, vi } from "vitest";
import {
  addBookmark,
  fetchBookmarks,
  fetchLearnerProfile,
  fetchLessonProgress,
  fetchQuizResults,
  LearningDataError,
  removeBookmark,
  saveLessonProgress,
  saveQuizResult,
  upsertLearnerProfile,
} from "./learning";

function createMockClient(databaseMocks: Record<string, unknown> = {}): InsForgeClient {
  return {
    database: {
      from: vi.fn((table: string) => {
        if (databaseMocks[table]) {
          return databaseMocks[table];
        }
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          upsert: vi.fn().mockReturnThis(),
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }),
    },
  } as unknown as InsForgeClient;
}

describe("Learning API Data Access", () => {
  describe("Learner Profile", () => {
    it("fetches profile for user", async () => {
      const mockProfile = {
        id: "p-1",
        user_id: "user-123",
        display_name: "Anita Roy",
        avatar_url: null,
        created_at: "2026-10-18T00:00:00Z",
        updated_at: "2026-10-18T00:00:00Z",
      };

      const tableMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
      };

      const client = createMockClient({ learner_profiles: tableMock });
      const result = await fetchLearnerProfile(client, "user-123");

      expect(result).toEqual(mockProfile);
      expect(tableMock.eq).toHaveBeenCalledWith("user_id", "user-123");
    });

    it("throws LearningDataError when profile fetch fails", async () => {
      const tableMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: { message: "Connection lost" } }),
      };

      const client = createMockClient({ learner_profiles: tableMock });
      await expect(fetchLearnerProfile(client, "user-123")).rejects.toThrow(LearningDataError);
    });

    it("upserts profile for authenticated user", async () => {
      const updatedProfile = {
        id: "p-1",
        user_id: "user-123",
        display_name: "Anita Sharma",
        avatar_url: null,
        created_at: "2026-10-18T00:00:00Z",
        updated_at: "2026-10-18T01:00:00Z",
      };

      const tableMock = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedProfile, error: null }),
      };

      const client = createMockClient({ learner_profiles: tableMock });
      const res = await upsertLearnerProfile(client, {
        userId: "user-123",
        displayName: "Anita Sharma",
      });

      expect(res).toEqual(updatedProfile);
      expect(tableMock.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: "user-123", display_name: "Anita Sharma" }),
        { onConflict: "user_id" },
      );
    });
  });

  describe("Lesson Progress", () => {
    it("fetches progress records for user", async () => {
      const records = [
        {
          id: "prog-1",
          user_id: "user-123",
          lesson_slug: "post-quantum-cryptography",
          completed: true,
          last_viewed_at: "2026-10-18T00:00:00Z",
          created_at: "2026-10-18T00:00:00Z",
          updated_at: "2026-10-18T00:00:00Z",
        },
      ];

      const tableMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: records, error: null }),
      };

      const client = createMockClient({ lesson_progress: tableMock });
      const res = await fetchLessonProgress(client, "user-123");

      expect(res).toEqual(records);
      expect(tableMock.eq).toHaveBeenCalledWith("user_id", "user-123");
    });

    it("saves and upserts lesson progress", async () => {
      const savedRecord = {
        id: "prog-1",
        user_id: "user-123",
        lesson_slug: "zero-trust-architecture",
        completed: true,
        last_viewed_at: "2026-10-18T00:00:00Z",
        created_at: "2026-10-18T00:00:00Z",
        updated_at: "2026-10-18T00:00:00Z",
      };

      const tableMock = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: savedRecord, error: null }),
      };

      const client = createMockClient({ lesson_progress: tableMock });
      const res = await saveLessonProgress(client, {
        userId: "user-123",
        lessonSlug: "zero-trust-architecture",
        completed: true,
      });

      expect(res).toEqual(savedRecord);
    });
  });

  describe("Bookmarks", () => {
    it("fetches bookmarks for user", async () => {
      const records = [
        {
          id: "bm-1",
          user_id: "user-123",
          lesson_slug: "ai-threat-detection",
          created_at: "2026-10-18T00:00:00Z",
        },
      ];

      const tableMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: records, error: null }),
      };

      const client = createMockClient({ bookmarks: tableMock });
      const res = await fetchBookmarks(client, "user-123");

      expect(res).toEqual(records);
      expect(tableMock.eq).toHaveBeenCalledWith("user_id", "user-123");
    });

    it("adds a new bookmark", async () => {
      const bookmark = {
        id: "bm-1",
        user_id: "user-123",
        lesson_slug: "ai-threat-detection",
        created_at: "2026-10-18T00:00:00Z",
      };

      const tableMock = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: bookmark, error: null }),
      };

      const client = createMockClient({ bookmarks: tableMock });
      const res = await addBookmark(client, {
        userId: "user-123",
        lessonSlug: "ai-threat-detection",
      });

      expect(res).toEqual(bookmark);
    });

    it("handles duplicate bookmark gracefully", async () => {
      const existingBookmark = {
        id: "bm-1",
        user_id: "user-123",
        lesson_slug: "ai-threat-detection",
        created_at: "2026-10-18T00:00:00Z",
      };

      const tableMock = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValueOnce({ data: null, error: { code: "23505", message: "duplicate key value" } })
          .mockResolvedValueOnce({ data: existingBookmark, error: null }),
        eq: vi.fn().mockReturnThis(),
      };

      const client = createMockClient({ bookmarks: tableMock });
      const res = await addBookmark(client, {
        userId: "user-123",
        lessonSlug: "ai-threat-detection",
      });

      expect(res).toEqual(existingBookmark);
    });

    it("removes an existing bookmark", async () => {
      const tableMock = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      // eq is called twice (user_id and lesson_slug); second call resolves to { error: null }
      tableMock.eq.mockReturnValueOnce(tableMock).mockResolvedValueOnce({ error: null });

      const client = createMockClient({ bookmarks: tableMock });
      await expect(
        removeBookmark(client, { userId: "user-123", lessonSlug: "ai-threat-detection" }),
      ).resolves.toBeUndefined();
    });
  });

  describe("Quiz Results & Validation", () => {
    it("fetches saved quiz results for user", async () => {
      const records = [
        {
          id: "qr-1",
          user_id: "user-123",
          quiz_id: "post-quantum-cryptography",
          score: 3,
          total_score: 3,
          submitted_at: "2026-10-18T00:00:00Z",
        },
      ];

      const tableMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: records, error: null }),
      };

      const client = createMockClient({ quiz_results: tableMock });
      const res = await fetchQuizResults(client, "user-123");

      expect(res).toEqual(records);
      expect(tableMock.eq).toHaveBeenCalledWith("user_id", "user-123");
    });

    it("rejects negative scores", async () => {
      const client = createMockClient();
      await expect(
        saveQuizResult(client, {
          userId: "user-123",
          quizId: "quiz-1",
          score: -1,
          totalScore: 5,
        }),
      ).rejects.toThrow("Quiz score cannot be negative");
    });

    it("rejects total score less than or equal to 0", async () => {
      const client = createMockClient();
      await expect(
        saveQuizResult(client, {
          userId: "user-123",
          quizId: "quiz-1",
          score: 0,
          totalScore: 0,
        }),
      ).rejects.toThrow("Total score must be greater than zero");
    });

    it("rejects score greater than total score", async () => {
      const client = createMockClient();
      await expect(
        saveQuizResult(client, {
          userId: "user-123",
          quizId: "quiz-1",
          score: 6,
          totalScore: 5,
        }),
      ).rejects.toThrow("Score cannot exceed total score");
    });

    it("saves valid quiz result", async () => {
      const savedResult = {
        id: "qr-1",
        user_id: "user-123",
        quiz_id: "post-quantum-cryptography",
        score: 3,
        total_score: 3,
        submitted_at: "2026-10-18T00:00:00Z",
      };

      const tableMock = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: savedResult, error: null }),
      };

      const client = createMockClient({ quiz_results: tableMock });
      const res = await saveQuizResult(client, {
        userId: "user-123",
        quizId: "post-quantum-cryptography",
        score: 3,
        totalScore: 3,
      });

      expect(res).toEqual(savedResult);
    });

    it("does not create false success state on database error", async () => {
      const tableMock = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: "Database timeout" } }),
      };

      const client = createMockClient({ quiz_results: tableMock });
      await expect(
        saveQuizResult(client, {
          userId: "user-123",
          quizId: "quiz-1",
          score: 2,
          totalScore: 3,
        }),
      ).rejects.toThrow(LearningDataError);
    });
  });
});
