import { Link } from "react-router-dom";
import { getTopicById } from "../content/community-topics";
import type { CommunityDiscussion } from "../types/community";
import type { AuthUser } from "../types/learning";

interface DiscussionCardProps {
  discussion: CommunityDiscussion;
  currentUser: AuthUser | null;
  onEdit?: (discussion: CommunityDiscussion) => void;
  onDelete?: (discussion: CommunityDiscussion) => void;
  onReport?: (discussion: CommunityDiscussion) => void;
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

export function DiscussionCard({
  discussion,
  currentUser,
  onEdit,
  onDelete,
  onReport,
}: DiscussionCardProps) {
  const topic = getTopicById(discussion.topic_id);
  const isAuthor = currentUser?.id === discussion.author_id;

  return (
    <article className="group rounded-lg border border-ink/10 bg-surface p-5 shadow-xs transition-shadow hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Topic Badge */}
        <span
          className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${
            topic?.badgeColor || "bg-canvas text-ink border-ink/20"
          }`}
        >
          {topic?.name || discussion.topic_id}
        </span>

        {/* Timestamp */}
        <time
          dateTime={discussion.created_at}
          className="text-xs text-muted"
        >
          {formatDate(discussion.created_at)}
        </time>
      </div>

      {/* Discussion Title */}
      <h2 className="mt-3 font-heading text-xl font-semibold text-ink group-hover:text-action transition-colors">
        <Link
          to={`/community/discussions/${discussion.id}`}
          className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-action rounded"
        >
          {discussion.title}
        </Link>
      </h2>

      {/* Content Preview (Safe text) */}
      <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-3 break-words whitespace-pre-line">
        {discussion.content}
      </p>

      {/* Footer metadata & controls */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4 text-xs">
        <div className="flex items-center gap-2 text-muted">
          <span className="font-semibold text-ink">
            {discussion.author_name}
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1 font-medium text-ink">
            <span aria-hidden="true">💬</span>{" "}
            {discussion.reply_count === 1
              ? "1 reply"
              : `${discussion.reply_count} replies`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isAuthor ? (
            <>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(discussion)}
                  className="font-semibold text-action hover:underline px-2 py-1 min-h-8 inline-flex items-center"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(discussion)}
                  className="font-semibold text-danger hover:underline px-2 py-1 min-h-8 inline-flex items-center"
                >
                  Delete
                </button>
              )}
            </>
          ) : (
            onReport &&
            currentUser && (
              <button
                type="button"
                onClick={() => onReport(discussion)}
                className="text-muted hover:text-ink hover:underline px-2 py-1 min-h-8 inline-flex items-center"
              >
                Report
              </button>
            )
          )}
        </div>
      </div>
    </article>
  );
}
