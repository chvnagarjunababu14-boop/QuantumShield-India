import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getInsForgeClient } from "../api/insforge";
import {
  createReply,
  deleteDiscussion,
  deleteReply,
  fetchDiscussionById,
  fetchReplies,
  updateDiscussion,
  updateReply,
  validateReplyInput,
} from "../api/community";
import { getTopicById } from "../content/community-topics";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { DiscussionComposer } from "../components/DiscussionComposer";
import { ReportDialog } from "../components/ReportDialog";
import { useAuth } from "../context/useAuth";
import { usePageTitle } from "./usePageTitle";
import type {
  CommunityDiscussion,
  CommunityReply,
  CreateDiscussionInput,
} from "../types/community";

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Recently";
  }
}

export function DiscussionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [discussion, setDiscussion] = useState<CommunityDiscussion | null>(null);
  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reply creation state
  const [replyContent, setReplyContent] = useState("");
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Inline reply editing state
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplyContent, setEditingReplyContent] = useState("");
  const [isSavingReply, setIsSavingReply] = useState(false);

  // Discussion editing state
  const [isEditingDiscussion, setIsEditingDiscussion] = useState(false);
  const [isSavingDiscussion, setIsSavingDiscussion] = useState(false);

  // Destructive deletion confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "discussion" | "reply";
    id: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reporting state
  const [reportTarget, setReportTarget] = useState<{
    type: "discussion" | "reply";
    id: string;
    title?: string;
  } | null>(null);

  usePageTitle(
    discussion ? `${discussion.title} — Community` : "Discussion — Community",
  );

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    const client = getInsForgeClient();
    if (!client) {
      setError("InsForge backend is not configured.");
      setIsLoading(false);
      return;
    }

    try {
      const disc = await fetchDiscussionById(client, id);
      if (!disc) {
        setError("Discussion not found or has been removed.");
        setIsLoading(false);
        return;
      }
      setDiscussion(disc);

      const repList = await fetchReplies(client, id);
      setReplies(repList);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load discussion.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) {
        loadData();
      }
    });
    return () => {
      ignore = true;
    };
  }, [loadData]);

  const handlePostReply = async (e: FormEvent) => {
    e.preventDefault();
    setReplyError(null);

    if (!user) {
      setReplyError("You must sign in to reply.");
      return;
    }
    if (!discussion) return;

    const validation = validateReplyInput(replyContent);
    if (validation) {
      setReplyError(validation);
      return;
    }

    const client = getInsForgeClient();
    if (!client) {
      setReplyError("Backend connection unavailable.");
      return;
    }

    setIsPostingReply(true);
    try {
      const newReply = await createReply(
        client,
        {
          discussion_id: discussion.id,
          content: replyContent.trim(),
        },
        user,
      );

      setReplies((prev) => [...prev, newReply]);
      setDiscussion((prev) =>
        prev ? { ...prev, reply_count: prev.reply_count + 1 } : null,
      );
      setReplyContent("");
    } catch (err) {
      setReplyError(
        err instanceof Error ? err.message : "Failed to post reply.",
      );
    } finally {
      setIsPostingReply(false);
    }
  };

  const handleSaveReplyEdit = async (replyId: string) => {
    const validation = validateReplyInput(editingReplyContent);
    if (validation) {
      setReplyError(validation);
      return;
    }

    const client = getInsForgeClient();
    if (!client) return;

    setIsSavingReply(true);
    try {
      const updated = await updateReply(client, replyId, {
        content: editingReplyContent.trim(),
      });
      setReplies((prev) =>
        prev.map((r) => (r.id === replyId ? updated : r)),
      );
      setEditingReplyId(null);
      setEditingReplyContent("");
    } catch (err) {
      setReplyError(
        err instanceof Error ? err.message : "Failed to update reply.",
      );
    } finally {
      setIsSavingReply(false);
    }
  };

  const handleUpdateDiscussionSubmit = async (
    data: CreateDiscussionInput,
  ) => {
    if (!discussion) return;
    const client = getInsForgeClient();
    if (!client) return;

    setIsSavingDiscussion(true);
    try {
      const updated = await updateDiscussion(client, discussion.id, {
        title: data.title,
        content: data.content,
      });
      setDiscussion(updated);
      setIsEditingDiscussion(false);
    } finally {
      setIsSavingDiscussion(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const client = getInsForgeClient();
    if (!client) return;

    setIsDeleting(true);
    try {
      if (deleteTarget.type === "discussion") {
        await deleteDiscussion(client, deleteTarget.id);
        navigate("/community");
      } else {
        await deleteReply(client, deleteTarget.id);
        setReplies((prev) => prev.filter((r) => r.id !== deleteTarget.id));
        setDiscussion((prev) =>
          prev ? { ...prev, reply_count: Math.max(0, prev.reply_count - 1) } : null,
        );
        setDeleteTarget(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Deletion failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <main id="main" className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-60 flex-col items-center justify-center gap-3 text-muted"
        >
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-action border-r-transparent" />
          <p className="font-semibold text-sm">Loading discussion...</p>
        </div>
      </main>
    );
  }

  if (error || !discussion) {
    return (
      <main id="main" className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
        <div
          role="alert"
          className="rounded-lg border border-danger/20 bg-surface p-8 text-center shadow-xs"
        >
          <h1 className="font-heading text-2xl font-semibold text-ink">
            Discussion Unavailable
          </h1>
          <p className="mt-2 text-sm text-muted">
            {error || "The requested discussion does not exist."}
          </p>
          <div className="mt-6">
            <Link to="/community" className="button-primary">
              ← Return to Community
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const topic = getTopicById(discussion.topic_id);
  const isDiscussionAuthor = user?.id === discussion.author_id;

  return (
    <main id="main" className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
      {/* Navigation breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          to={`/community?topic=${discussion.topic_id}`}
          className="font-medium text-action hover:underline text-sm inline-flex items-center gap-1.5"
        >
          ← Back to {topic?.name || "Community"}
        </Link>
      </nav>

      {/* Main Discussion Thread Article */}
      <article className="rounded-lg border border-ink/10 bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${
              topic?.badgeColor || "bg-canvas text-ink border-ink/20"
            }`}
          >
            {topic?.name || discussion.topic_id}
          </span>
          <time
            dateTime={discussion.created_at}
            className="text-xs text-muted"
          >
            Posted {formatDate(discussion.created_at)}
          </time>
        </div>

        <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {discussion.title}
        </h1>

        <div className="mt-2 flex items-center gap-2 text-xs text-muted border-b border-ink/10 pb-4">
          <span className="font-semibold text-ink">
            {discussion.author_name}
          </span>
          {discussion.updated_at !== discussion.created_at && (
            <span>• Edited {formatDate(discussion.updated_at)}</span>
          )}
        </div>

        {/* Content Body (Strictly rendered as safe text) */}
        <div className="mt-6 text-base leading-relaxed text-ink break-words whitespace-pre-line font-sans">
          {discussion.content}
        </div>

        {/* Author / Community Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4 text-xs">
          <div className="flex items-center gap-1 text-muted">
            <span aria-hidden="true">💬</span>{" "}
            <span className="font-semibold text-ink">
              {discussion.reply_count}
            </span>{" "}
            {discussion.reply_count === 1 ? "reply" : "replies"}
          </div>

          <div className="flex items-center gap-2">
            {isDiscussionAuthor ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditingDiscussion(true)}
                  className="font-semibold text-action hover:underline px-2 py-1 min-h-8 inline-flex items-center"
                >
                  Edit discussion
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({
                      type: "discussion",
                      id: discussion.id,
                    })
                  }
                  className="font-semibold text-danger hover:underline px-2 py-1 min-h-8 inline-flex items-center"
                >
                  Delete discussion
                </button>
              </>
            ) : (
              user && (
                <button
                  type="button"
                  onClick={() =>
                    setReportTarget({
                      type: "discussion",
                      id: discussion.id,
                      title: discussion.title,
                    })
                  }
                  className="text-muted hover:text-ink hover:underline px-2 py-1 min-h-8 inline-flex items-center"
                >
                  Report discussion
                </button>
              )
            )}
          </div>
        </div>
      </article>

      {/* Replies Section */}
      <section className="mt-10" aria-labelledby="replies-heading">
        <h2
          id="replies-heading"
          className="font-heading text-2xl font-semibold text-ink"
        >
          Replies ({replies.length})
        </h2>

        {/* Reply List */}
        <div className="mt-6 flex flex-col gap-4">
          {replies.length === 0 ? (
            <div className="rounded-lg border border-dashed border-ink/20 bg-surface/60 p-8 text-center text-muted">
              <p className="font-semibold text-ink">No replies yet</p>
              <p className="mt-1 text-sm">
                Be the first to share an answer, clarification, or reference.
              </p>
            </div>
          ) : (
            replies.map((reply) => {
              const isReplyAuthor = user?.id === reply.author_id;
              const isEditing = editingReplyId === reply.id;

              return (
                <div
                  key={reply.id}
                  className="rounded-lg border border-ink/10 bg-surface p-5 shadow-2xs transition-shadow sm:p-6"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-ink">
                      {reply.author_name}
                    </span>
                    <time
                      dateTime={reply.created_at}
                      className="text-muted"
                    >
                      {formatDate(reply.created_at)}
                    </time>
                  </div>

                  {isEditing ? (
                    <div className="mt-3 flex flex-col gap-3">
                      <textarea
                        rows={4}
                        maxLength={5000}
                        value={editingReplyContent}
                        onChange={(e) => setEditingReplyContent(e.target.value)}
                        className="rounded-md border border-ink/20 bg-surface p-3 text-sm text-ink focus:border-action focus:outline-none focus:ring-2 focus:ring-action"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={isSavingReply}
                          onClick={() => setEditingReplyId(null)}
                          className="button-secondary min-h-9 px-3 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSavingReply}
                          onClick={() => handleSaveReplyEdit(reply.id)}
                          className="button-primary min-h-9 px-3 text-xs"
                        >
                          {isSavingReply ? "Saving..." : "Save changes"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-sm leading-relaxed text-ink break-words whitespace-pre-line">
                      {reply.content}
                    </div>
                  )}

                  {!isEditing && (
                    <div className="mt-4 flex items-center justify-end gap-2 border-t border-ink/5 pt-3 text-xs">
                      {isReplyAuthor ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReplyId(reply.id);
                              setEditingReplyContent(reply.content);
                            }}
                            className="font-medium text-action hover:underline px-2 py-0.5"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                type: "reply",
                                id: reply.id,
                              })
                            }
                            className="font-medium text-danger hover:underline px-2 py-0.5"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        user && (
                          <button
                            type="button"
                            onClick={() =>
                              setReportTarget({
                                type: "reply",
                                id: reply.id,
                              })
                            }
                            className="text-muted hover:text-ink hover:underline px-2 py-0.5"
                          >
                            Report
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Post Reply Box */}
        <div className="mt-8 rounded-lg border border-ink/10 bg-surface p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold text-ink">
            Leave a reply
          </h3>

          {user ? (
            <form onSubmit={handlePostReply} className="mt-4 flex flex-col gap-3">
              {replyError && (
                <div
                  role="alert"
                  className="rounded-md border border-danger/20 bg-danger/10 p-3 text-sm font-medium text-danger"
                >
                  {replyError}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="reply-input" className="sr-only">
                  Your reply
                </label>
                <textarea
                  id="reply-input"
                  required
                  rows={4}
                  maxLength={5000}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Share a thoughtful response, research reference, or technical insight..."
                  className="rounded-md border border-ink/20 bg-surface p-3 text-sm text-ink placeholder:text-muted/60 focus:border-action focus:outline-none focus:ring-2 focus:ring-action resize-y"
                />
                <span className="text-right text-xs text-muted">
                  {replyContent.length}/5,000
                </span>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPostingReply || replyContent.trim().length === 0}
                  className="button-primary min-h-11 px-5 text-sm font-semibold disabled:opacity-50"
                >
                  {isPostingReply ? "Posting reply..." : "Post reply"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-4 rounded-md border border-ink/10 bg-canvas/40 p-4 text-center">
              <p className="text-sm text-muted">
                Visitors can read all discussions freely. Sign in to post a reply.
              </p>
              <div className="mt-3">
                <Link
                  to="/auth?mode=signin"
                  className="button-primary inline-flex min-h-10 text-xs px-4"
                >
                  Sign in to reply
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Edit Discussion Dialog */}
      {isEditingDiscussion && (
        <DiscussionComposer
          isOpen={isEditingDiscussion}
          initialData={discussion}
          isSubmitting={isSavingDiscussion}
          onClose={() => setIsEditingDiscussion(false)}
          onSubmit={handleUpdateDiscussionSubmit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteTarget !== null}
        title={
          deleteTarget?.type === "discussion"
            ? "Delete Discussion"
            : "Delete Reply"
        }
        message={
          deleteTarget?.type === "discussion"
            ? "Are you sure you want to delete this discussion and all its replies? This action cannot be undone."
            : "Are you sure you want to delete your reply? This action cannot be undone."
        }
        confirmLabel="Delete"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Content Report Dialog */}
      {reportTarget && (
        <ReportDialog
          isOpen={reportTarget !== null}
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          targetTitle={reportTarget.title}
          user={user}
          onClose={() => setReportTarget(null)}
        />
      )}
    </main>
  );
}
