import { useEffect, useRef, useState, type FormEvent } from "react";
import { getInsForgeClient } from "../api/insforge";
import { submitReport } from "../api/community";
import type { AuthUser } from "../types/learning";

interface ReportDialogProps {
  isOpen: boolean;
  targetType: "discussion" | "reply";
  targetId: string;
  targetTitle?: string;
  user: AuthUser | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const COMMON_REASONS = [
  "Spam, bot activity, or commercial promotion",
  "Malicious payload, exploit code, or illegal material",
  "Harassment, hate speech, or personal attacks",
  "Misinformation or factually misleading security claim",
  "Other violation of community guidelines",
];

export function ReportDialog({
  isOpen,
  targetType,
  targetId,
  targetTitle,
  user,
  onClose,
  onSuccess,
}: ReportDialogProps) {
  const [selectedPreset, setSelectedPreset] = useState(COMMON_REASONS[0]);
  const [customDetails, setCustomDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const firstInputRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (isOpen) {
      Promise.resolve().then(() => {
        setSelectedPreset(COMMON_REASONS[0]);
        setCustomDetails("");
        setError(null);
        setSuccess(false);
      });

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      const timer = setTimeout(() => firstInputRef.current?.focus(), 50);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        clearTimeout(timer);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("You must be signed in to submit a report.");
      return;
    }

    const client = getInsForgeClient();
    if (!client) {
      setError("Backend connection is not configured.");
      return;
    }

    const fullReason = customDetails.trim()
      ? `${selectedPreset}: ${customDetails.trim()}`
      : selectedPreset;

    if (fullReason.length > 500) {
      setError("Reason cannot exceed 500 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReport(
        client,
        {
          target_type: targetType,
          target_id: targetId,
          reason: fullReason,
        },
        user,
      );
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
        className="w-full max-w-lg rounded-lg border border-ink/10 bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150"
      >
        <h2
          id="report-dialog-title"
          className="font-heading text-xl font-semibold text-ink"
        >
          Report {targetType === "discussion" ? "Discussion" : "Reply"}
        </h2>
        {targetTitle && (
          <p className="mt-1 text-xs text-muted truncate italic">
            "{targetTitle}"
          </p>
        )}
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Help maintain an ethical, fact-based learning environment. Reports are
          audited confidentially by community moderators.
        </p>

        {success ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-6 rounded-md border border-ok/30 bg-ok/10 p-4 text-sm font-medium text-ok"
          >
            Thank you. Your report has been submitted for moderation review.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            {error && (
              <div
                role="alert"
                tabIndex={-1}
                className="rounded-md border border-danger/20 bg-danger/10 p-3 text-sm font-medium text-danger"
              >
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="report-category"
                className="font-semibold text-sm text-ink"
              >
                Category
              </label>
              <select
                ref={firstInputRef}
                id="report-category"
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
                className="min-h-11 rounded-md border border-ink/20 bg-surface px-3 py-2 text-sm text-ink focus:border-action focus:outline-none focus:ring-2 focus:ring-action"
              >
                {COMMON_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="report-details"
                className="font-semibold text-sm text-ink"
              >
                Additional context (optional)
              </label>
              <textarea
                id="report-details"
                rows={3}
                maxLength={400}
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value)}
                placeholder="Explain why this content violates community guidelines..."
                className="rounded-md border border-ink/20 bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-action focus:outline-none focus:ring-2 focus:ring-action resize-y"
              />
              <span className="text-right text-xs text-muted">
                {customDetails.length}/400 characters
              </span>
            </div>

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
                className="min-h-11 rounded-md bg-danger px-4 font-semibold text-sm text-surface hover:bg-red-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Submitting report..." : "Submit report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
