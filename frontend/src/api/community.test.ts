import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createDiscussion,
  createReply,
  deleteDiscussion,
  deleteReply,
  fetchDiscussionById,
  fetchDiscussions,
  fetchReplies,
  fetchUserRoles,
  submitReport,
  updateDiscussion,
  updateReply,
  validateDiscussionInput,
  validateReplyInput,
  validateReportInput,
} from "./community";
import type { AuthUser } from "../types/learning";
import type { InsForgeClient } from "@insforge/sdk";

describe("Community Input Validation", () => {
  it("validates discussion input boundaries", () => {
    expect(
      validateDiscussionInput({ topic_id: "invalid-topic", title: "Valid Title", content: "Valid Content with over 10 chars" }),
    ).toBe("Please select a valid technology topic room.");

    expect(
      validateDiscussionInput({ topic_id: "cybersecurity", title: "ab", content: "Valid Content with over 10 chars" }),
    ).toBe("Discussion title must be at least 3 characters long.");

    expect(
      validateDiscussionInput({ topic_id: "cybersecurity", title: "a".repeat(121), content: "Valid Content with over 10 chars" }),
    ).toBe("Discussion title cannot exceed 120 characters.");

    expect(
      validateDiscussionInput({ topic_id: "cybersecurity", title: "Valid Title", content: "short" }),
    ).toBe("Discussion content must be at least 10 characters long.");

    expect(
      validateDiscussionInput({ topic_id: "cybersecurity", title: "Valid Title", content: "a".repeat(5001) }),
    ).toBe("Discussion content cannot exceed 5,000 characters.");

    expect(
      validateDiscussionInput({ topic_id: "cybersecurity", title: "Valid Title", content: "Valid Content with over 10 chars" }),
    ).toBeNull();
  });

  it("validates reply input boundaries", () => {
    expect(validateReplyInput("")).toBe("Reply content cannot be empty.");
    expect(validateReplyInput("   ")).toBe("Reply content cannot be empty.");
    expect(validateReplyInput("a".repeat(5001))).toBe("Reply cannot exceed 5,000 characters.");
    expect(validateReplyInput("Valid reply text")).toBeNull();
  });

  it("validates report input boundaries", () => {
    expect(validateReportInput("ab")).toBe("Please provide a reason of at least 3 characters.");
    expect(validateReportInput("a".repeat(501))).toBe("Report reason cannot exceed 500 characters.");
    expect(validateReportInput("Spam or misleading information")).toBeNull();
  });
});

describe("Community API Operations", () => {
  const mockUser: AuthUser = {
    id: "u-author-123",
    email: "learner@example.com",
    emailVerified: true,
    displayName: "Radhika",
  };

  let mockClient: Partial<InsForgeClient>;
  let mockQuery: any;

  beforeEach(() => {
    mockQuery = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    mockClient = {
      database: {
        from: vi.fn(() => mockQuery),
      } as any,
    };
  });

  it("fetches discussions with topic and search filters", async () => {
    const mockDiscussions = [
      {
        id: "d-1",
        author_id: "u-1",
        author_name: "Aarav",
        topic_id: "cybersecurity",
        title: "Zero Trust Architecture",
        content: "Detailed post content here",
        reply_count: 2,
        is_hidden: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    mockQuery.range.mockResolvedValueOnce({
      data: mockDiscussions,
      error: null,
      count: 1,
    });

    const res = await fetchDiscussions(mockClient as InsForgeClient, {
      topicId: "cybersecurity",
      search: "Zero Trust",
      limit: 10,
      offset: 0,
    });

    expect(mockClient.database?.from).toHaveBeenCalledWith("community_discussions");
    expect(mockQuery.eq).toHaveBeenCalledWith("topic_id", "cybersecurity");
    expect(mockQuery.ilike).toHaveBeenCalledWith("title", "%Zero Trust%");
    expect(res.discussions).toHaveLength(1);
    expect(res.discussions[0].title).toBe("Zero Trust Architecture");
    expect(res.hasMore).toBe(false);
  });

  it("creates a discussion with verified author details", async () => {
    const newDiscussion = {
      id: "d-new-123",
      author_id: mockUser.id,
      author_name: "Radhika",
      topic_id: "quantum-computing",
      title: "Superposition in Quantum Circuits",
      content: "This is a detailed technical question about quantum computing.",
      reply_count: 0,
      is_hidden: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockQuery.single.mockResolvedValueOnce({
      data: newDiscussion,
      error: null,
    });

    const res = await createDiscussion(
      mockClient as InsForgeClient,
      {
        topic_id: "quantum-computing",
        title: "Superposition in Quantum Circuits",
        content: "This is a detailed technical question about quantum computing.",
      },
      mockUser,
    );

    expect(mockClient.database?.from).toHaveBeenCalledWith("community_discussions");
    expect(mockQuery.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        author_id: mockUser.id,
        author_name: "Radhika",
        topic_id: "quantum-computing",
        reply_count: 0,
        is_hidden: false,
      }),
    ]);
    expect(res.id).toBe("d-new-123");
  });

  it("fetches replies in chronological order", async () => {
    const mockReplies = [
      {
        id: "r-1",
        discussion_id: "d-1",
        author_id: "u-2",
        author_name: "Vikram",
        content: "First reply here",
        is_hidden: false,
        created_at: "2026-10-18T10:00:00Z",
        updated_at: "2026-10-18T10:00:00Z",
      },
    ];

    mockQuery.order.mockResolvedValueOnce({
      data: mockReplies,
      error: null,
    });

    const replies = await fetchReplies(mockClient as InsForgeClient, "d-1");
    expect(mockClient.database?.from).toHaveBeenCalledWith("community_replies");
    expect(mockQuery.eq).toHaveBeenCalledWith("discussion_id", "d-1");
    expect(mockQuery.order).toHaveBeenCalledWith("created_at", { ascending: true });
    expect(replies).toHaveLength(1);
  });

  it("handles duplicate report error cleanly", async () => {
    mockQuery.single.mockResolvedValueOnce({
      data: null,
      error: {
        code: "23505",
        message: "duplicate key value violates unique constraint",
      },
    });

    await expect(
      submitReport(
        mockClient as InsForgeClient,
        {
          target_type: "discussion",
          target_id: "d-1",
          reason: "Spam content",
        },
        mockUser,
      ),
    ).rejects.toThrow(/You have already reported this item/i);
  });

  it("fetches user roles for moderation checks", async () => {
    mockQuery.eq.mockResolvedValueOnce({
      data: [{ role: "moderator" }],
      error: null,
    });

    const roles = await fetchUserRoles(mockClient as InsForgeClient, mockUser.id);
    expect(roles).toEqual(["moderator"]);
  });

  it("fetches discussion by id", async () => {
    const mockDiscussion = {
      id: "d-1",
      author_id: "u-1",
      author_name: "Aarav",
      topic_id: "cybersecurity",
      title: "Zero Trust Architecture",
      content: "Exploring zero trust principles",
      reply_count: 0,
      is_hidden: false,
      created_at: "2026-10-18T10:00:00Z",
      updated_at: "2026-10-18T10:00:00Z",
    };

    mockQuery.single.mockResolvedValueOnce({
      data: mockDiscussion,
      error: null,
    });

    const disc = await fetchDiscussionById(mockClient as InsForgeClient, "d-1");
    expect(mockClient.database?.from).toHaveBeenCalledWith("community_discussions");
    expect(mockQuery.eq).toHaveBeenCalledWith("id", "d-1");
    expect(disc?.id).toBe("d-1");
  });

  it("updates and deletes discussions", async () => {
    mockQuery.single.mockResolvedValueOnce({
      data: { id: "d-1", title: "Updated Title" },
      error: null,
    });

    await updateDiscussion(
      mockClient as InsForgeClient,
      "d-1",
      { title: "Updated Title", content: "Updated content with over 10 chars" },
    );
    expect(mockQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Updated Title" }),
    );

    mockQuery.eq.mockResolvedValueOnce({ error: null });
    await deleteDiscussion(mockClient as InsForgeClient, "d-1");
    expect(mockQuery.delete).toHaveBeenCalled();
  });

  it("creates, updates, and deletes replies", async () => {
    mockQuery.single.mockResolvedValueOnce({
      data: { id: "r-new", content: "New reply" },
      error: null,
    });

    const reply = await createReply(
      mockClient as InsForgeClient,
      { discussion_id: "d-1", content: "New reply with valid content" },
      mockUser,
    );
    expect(mockQuery.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        discussion_id: "d-1",
        author_id: mockUser.id,
        content: "New reply with valid content",
      }),
    ]);
    expect(reply.id).toBe("r-new");

    mockQuery.single.mockResolvedValueOnce({
      data: { id: "r-new", content: "Edited reply" },
      error: null,
    });
    await updateReply(mockClient as InsForgeClient, "r-new", { content: "Edited reply" });
    expect(mockQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({ content: "Edited reply" }),
    );

    mockQuery.eq.mockResolvedValueOnce({ error: null });
    await deleteReply(mockClient as InsForgeClient, "r-new");
    expect(mockQuery.delete).toHaveBeenCalled();
  });
});


