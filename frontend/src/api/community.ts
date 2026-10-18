import type { InsForgeClient } from "@insforge/sdk";
import type { AuthUser } from "../types/learning";
import type {
  CommunityDiscussion,
  CommunityReply,
  CommunityReport,
  CreateDiscussionInput,
  CreateReplyInput,
  CreateReportInput,
  UpdateDiscussionInput,
  UpdateReplyInput,
} from "../types/community";
import { isValidTopicId } from "../content/community-topics";

export interface FetchDiscussionsOptions {
  topicId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface FetchDiscussionsResult {
  discussions: CommunityDiscussion[];
  hasMore: boolean;
  totalCount?: number;
}

/**
 * Validates discussion input boundaries matching database constraints.
 */
export function validateDiscussionInput(input: CreateDiscussionInput): string | null {
  const trimmedTitle = input.title?.trim() || "";
  const trimmedContent = input.content?.trim() || "";

  if (!input.topic_id || !isValidTopicId(input.topic_id)) {
    return "Please select a valid technology topic room.";
  }
  if (trimmedTitle.length < 3) {
    return "Discussion title must be at least 3 characters long.";
  }
  if (trimmedTitle.length > 120) {
    return "Discussion title cannot exceed 120 characters.";
  }
  if (trimmedContent.length < 10) {
    return "Discussion content must be at least 10 characters long.";
  }
  if (trimmedContent.length > 5000) {
    return "Discussion content cannot exceed 5,000 characters.";
  }

  return null;
}

/**
 * Validates reply input boundaries matching database constraints.
 */
export function validateReplyInput(content: string): string | null {
  const trimmed = content?.trim() || "";
  if (trimmed.length < 1) {
    return "Reply content cannot be empty.";
  }
  if (trimmed.length > 5000) {
    return "Reply cannot exceed 5,000 characters.";
  }
  return null;
}

/**
 * Validates content report input.
 */
export function validateReportInput(reason: string): string | null {
  const trimmed = reason?.trim() || "";
  if (trimmed.length < 3) {
    return "Please provide a reason of at least 3 characters.";
  }
  if (trimmed.length > 500) {
    return "Report reason cannot exceed 500 characters.";
  }
  return null;
}

/**
 * Fetches newest-first discussions with optional topic filter and search keyword.
 */
export async function fetchDiscussions(
  client: InsForgeClient,
  options: FetchDiscussionsOptions = {},
): Promise<FetchDiscussionsResult> {
  const limit = options.limit ?? 10;
  const offset = options.offset ?? 0;

  let query = client.database
    .from("community_discussions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (options.topicId) {
    query = query.eq("topic_id", options.topicId);
  }

  if (options.search && options.search.trim()) {
    const cleanSearch = options.search.trim();
    query = query.ilike("title", `%${cleanSearch}%`);
  }

  const { data, error, count } = await query.range(offset, offset + limit);

  if (error) {
    throw new Error(error.message || "Failed to load discussions.");
  }

  const items = (data as CommunityDiscussion[]) || [];
  const hasMore = items.length > limit;
  const discussions = hasMore ? items.slice(0, limit) : items;

  return {
    discussions,
    hasMore,
    totalCount: count ?? undefined,
  };
}

/**
 * Fetches a single discussion by ID.
 */
export async function fetchDiscussionById(
  client: InsForgeClient,
  id: string,
): Promise<CommunityDiscussion | null> {
  const { data, error } = await client.database
    .from("community_discussions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116" || error.message?.includes("0 rows")) {
      return null;
    }
    throw new Error(error.message || "Failed to load discussion.");
  }

  return (data as CommunityDiscussion) || null;
}

/**
 * Creates a new discussion under authenticated session.
 */
export async function createDiscussion(
  client: InsForgeClient,
  input: CreateDiscussionInput,
  user: AuthUser,
): Promise<CommunityDiscussion> {
  const validationError = validateDiscussionInput(input);
  if (validationError) {
    throw new Error(validationError);
  }

  const authorName =
    user.displayName || user.email.split("@")[0] || "Learner";

  const { data, error } = await client.database
    .from("community_discussions")
    .insert([
      {
        author_id: user.id,
        author_name: authorName,
        topic_id: input.topic_id,
        title: input.title.trim(),
        content: input.content.trim(),
        reply_count: 0,
        is_hidden: false,
      },
    ])
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to post discussion.");
  }

  return data as CommunityDiscussion;
}

/**
 * Updates an author's discussion.
 */
export async function updateDiscussion(
  client: InsForgeClient,
  id: string,
  input: UpdateDiscussionInput,
): Promise<CommunityDiscussion> {
  const trimmedTitle = input.title?.trim() || "";
  const trimmedContent = input.content?.trim() || "";

  if (trimmedTitle.length < 3 || trimmedTitle.length > 120) {
    throw new Error("Title must be between 3 and 120 characters.");
  }
  if (trimmedContent.length < 10 || trimmedContent.length > 5000) {
    throw new Error("Content must be between 10 and 5,000 characters.");
  }

  const { data, error } = await client.database
    .from("community_discussions")
    .update({
      title: trimmedTitle,
      content: trimmedContent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to update discussion.");
  }

  return data as CommunityDiscussion;
}

/**
 * Deletes a discussion (author or moderator only via RLS).
 */
export async function deleteDiscussion(
  client: InsForgeClient,
  id: string,
): Promise<void> {
  const { error } = await client.database
    .from("community_discussions")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message || "Failed to delete discussion.");
  }
}

/**
 * Fetches replies for a discussion in chronological order.
 */
export async function fetchReplies(
  client: InsForgeClient,
  discussionId: string,
): Promise<CommunityReply[]> {
  const { data, error } = await client.database
    .from("community_replies")
    .select("*")
    .eq("discussion_id", discussionId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message || "Failed to load replies.");
  }

  return (data as CommunityReply[]) || [];
}

/**
 * Posts a reply to a discussion under authenticated session.
 */
export async function createReply(
  client: InsForgeClient,
  input: CreateReplyInput,
  user: AuthUser,
): Promise<CommunityReply> {
  const validationError = validateReplyInput(input.content);
  if (validationError) {
    throw new Error(validationError);
  }

  const authorName =
    user.displayName || user.email.split("@")[0] || "Learner";

  const { data, error } = await client.database
    .from("community_replies")
    .insert([
      {
        discussion_id: input.discussion_id,
        author_id: user.id,
        author_name: authorName,
        content: input.content.trim(),
        is_hidden: false,
      },
    ])
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to post reply.");
  }

  return data as CommunityReply;
}

/**
 * Updates a reply (author only via RLS).
 */
export async function updateReply(
  client: InsForgeClient,
  replyId: string,
  input: UpdateReplyInput,
): Promise<CommunityReply> {
  const validationError = validateReplyInput(input.content);
  if (validationError) {
    throw new Error(validationError);
  }

  const { data, error } = await client.database
    .from("community_replies")
    .update({
      content: input.content.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", replyId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to update reply.");
  }

  return data as CommunityReply;
}

/**
 * Deletes a reply (author or moderator only via RLS).
 */
export async function deleteReply(
  client: InsForgeClient,
  replyId: string,
): Promise<void> {
  const { error } = await client.database
    .from("community_replies")
    .delete()
    .eq("id", replyId);

  if (error) {
    throw new Error(error.message || "Failed to delete reply.");
  }
}

/**
 * Submits an item report. Duplicate reports from the same user for the same item are rejected.
 */
export async function submitReport(
  client: InsForgeClient,
  input: CreateReportInput,
  user: AuthUser,
): Promise<CommunityReport> {
  const validationError = validateReportInput(input.reason);
  if (validationError) {
    throw new Error(validationError);
  }

  const { data, error } = await client.database
    .from("community_reports")
    .insert([
      {
        reporter_id: user.id,
        target_type: input.target_type,
        target_id: input.target_id,
        reason: input.reason.trim(),
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) {
    if (
      error.code === "23505" ||
      error.message?.includes("duplicate") ||
      error.message?.includes("unique")
    ) {
      throw new Error("You have already reported this item for moderation.");
    }
    throw new Error(error.message || "Unable to submit report. Please try again.");
  }

  return data as CommunityReport;
}

/**
 * Checks whether the current user has moderator or admin roles.
 */
export async function fetchUserRoles(
  client: InsForgeClient,
  userId: string,
): Promise<string[]> {
  try {
    const { data, error } = await client.database
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error || !data) {
      return [];
    }

    return (data as Array<{ role: string }>).map((r) => r.role);
  } catch {
    return [];
  }
}
