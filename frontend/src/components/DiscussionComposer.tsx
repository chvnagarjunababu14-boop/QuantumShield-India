import { useEffect, useRef, useState, type FormEvent } from "react";
import { COMMUNITY_TOPICS } from "../content/community-topics";
import { validateDiscussionInput } from "../api/community";
import type { CommunityDiscussion, CreateDiscussionInput } from "../types/community";

interface DiscussionComposerProps {
  isOpen: boolean;
  initialTopicId?: string;
  initialData?: CommunityDiscussion | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDiscussionInput) => Promise<void>;
}

export function DiscussionComposer({
  isOpen,
  initialTopicId,
  initialData,
  isSubmitting = false,
  onClose,
  onSubmit,
}: DiscussionComposerProps) {
  const [topicId, setTopicId] = useState(
    initialData?.topic_id || initialTopicId || COMMUNITY_TOPICS[0].id,
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [formError, setFormError] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      Promise.resolve().then(() => {
        setTopicId(
          initialData?.topic_id || initialTopicId || COMMUNITY_TOPICS[0].id,
        );
        setTitle(initialData?.title || "");
        setContent(initialData?.content || "");
        setFormError(null);
      });

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      const timer = setTimeout(() => titleInputRef.current?.focus(), 50);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        clearTimeout(timer);
      };
    }
  }, [isOpen, initialTopicId, initialData, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const inputData: CreateDiscussionInput = {
      topic_id: topicId,
      title: title.trim(),
      content: content.trim(),
    };

    const validationMsg = validateDiscussionInput(inputData);
    if (validationMsg) {
      setFormError(validationMsg);
      return;
    }

    try {
      await onSubmit(inputData);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to publish discussion.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs overflow-y-auto"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="composer-title"
        className="my-8 w-full max-w-2xl rounded-lg border border-ink/10 bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink/10 pb-4">
          <div>
            <h2
              id="composer-title"
              className="font-heading text-xl font-semibold text-ink sm:text-2xl"
            >
              {initialData ? "Edit discussion" : "Start a discussion"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Share your insights, ask technical questions, or discuss research.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted hover:bg-canvas hover:text-ink min-h-10 min-w-10 inline-flex items-center justify-center"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {formError && (
            <div
              role="alert"
              tabIndex={-1}
              className="rounded-md border border-danger/20 bg-danger/10 p-3 text-sm font-medium text-danger focus:outline-none focus:ring-2 focus:ring-danger"
            >
              {formError}
            </div>
          )}

          {/* Topic Room Selection */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="discussion-topic"
              className="font-semibold text-sm text-ink"
            >
              Technology Room
            </label>
            <select
              id="discussion-topic"
              value={topicId}
              disabled={Boolean(initialData)}
              onChange={(e) => setTopicId(e.target.value)}
              className="min-h-11 rounded-md border border-ink/20 bg-surface px-3 py-2 text-sm text-ink focus:border-action focus:outline-none focus:ring-2 focus:ring-action disabled:opacity-60"
            >
              {COMMUNITY_TOPICS.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name} — {topic.description}
                </option>
              ))}
            </select>
          </div>

          {/* Title input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="discussion-title"
                className="font-semibold text-sm text-ink"
              >
                Discussion title
              </label>
              <span
                className={`text-xs ${
                  title.length > 110 ? "text-danger font-semibold" : "text-muted"
                }`}
              >
                {title.length}/120
              </span>
            </div>
            <input
              ref={titleInputRef}
              id="discussion-title"
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Migrating TLS 1.3 key exchange to ML-KEM-768"
              className="min-h-11 rounded-md border border-ink/20 bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-action focus:outline-none focus:ring-2 focus:ring-action"
            />
          </div>

          {/* Content Body */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="discussion-content"
                className="font-semibold text-sm text-ink"
              >
                Content
              </label>
              <span
                className={`text-xs ${
                  content.length > 4800
                    ? "text-danger font-semibold"
                    : "text-muted"
                }`}
              >
                {content.length}/5,000
              </span>
            </div>
            <textarea
              id="discussion-content"
              required
              rows={7}
              maxLength={5000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Explain the background, reference standards (NIST, ISO, IETF), or ask a clear question..."
              className="rounded-md border border-ink/20 bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-action focus:outline-none focus:ring-2 focus:ring-action resize-y font-sans leading-relaxed"
            />
          </div>

          {/* Guidelines Callout */}
          <div className="rounded-md border border-action/20 bg-canvas/30 p-3 text-xs leading-relaxed text-muted">
            <p className="font-semibold text-action">Community Posting Guidelines</p>
            <p className="mt-0.5">
              Keep contributions constructive, academic, and respectful. Do not
              post exploit payloads, private credentials, or commercial spam.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="button-secondary min-h-11 px-4 text-sm font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="button-primary min-h-11 px-5 text-sm font-semibold disabled:opacity-60"
            >
              {isSubmitting
                ? "Publishing..."
                : initialData
                  ? "Save changes"
                  : "Post discussion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
