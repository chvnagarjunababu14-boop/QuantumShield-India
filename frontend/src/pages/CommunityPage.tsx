import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getInsForgeClient, isInsForgeConfigured } from "../api/insforge";
import {
  createDiscussion,
  deleteDiscussion,
  fetchDiscussions,
  updateDiscussion,
} from "../api/community";
import {
  COMMUNITY_TOPICS,
  getTopicById,
} from "../content/community-topics";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { DiscussionCard } from "../components/DiscussionCard";
import { DiscussionComposer } from "../components/DiscussionComposer";
import { ReportDialog } from "../components/ReportDialog";
import { useAuth } from "../context/useAuth";
import { usePageTitle } from "./usePageTitle";
import type {
  CommunityDiscussion,
  CreateDiscussionInput,
} from "../types/community";

const PAGE_SIZE = 10;

export function CommunityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTopic = searchParams.get("topic") || "";
  const initialSearch = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [activeSearch, setActiveSearch] = useState(initialSearch);
  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  // Composer state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingDiscussion, setEditingDiscussion] =
    useState<CommunityDiscussion | null>(null);

  // Confirmation dialog state for deletion
  const [deletingDiscussion, setDeletingDiscussion] =
    useState<CommunityDiscussion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reporting dialog state
  const [reportingDiscussion, setReportingDiscussion] =
    useState<CommunityDiscussion | null>(null);

  // Guidelines toggle state
  const [showGuidelines, setShowGuidelines] = useState(false);

  const { user } = useAuth();
  const isConfigured = isInsForgeConfigured();

  const activeTopicObj = selectedTopic ? getTopicById(selectedTopic) : null;

  usePageTitle(
    activeTopicObj
      ? `${activeTopicObj.name} Community — QuantumShield India`
      : "Global Learning Community — QuantumShield India",
  );

  const loadDiscussions = useCallback(
    async (
      currentTopic: string,
      currentSearch: string,
      currentOffset: number,
      append = false,
    ) => {
      if (!isConfigured) {
        setIsLoading(false);
        return;
      }

      const client = getInsForgeClient();
      if (!client) {
        setError("InsForge backend is not configured.");
        setIsLoading(false);
        return;
      }

      if (!append) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const res = await fetchDiscussions(client, {
          topicId: currentTopic || undefined,
          search: currentSearch || undefined,
          limit: PAGE_SIZE,
          offset: currentOffset,
        });

        if (append) {
          setDiscussions((prev) => [...prev, ...res.discussions]);
        } else {
          setDiscussions(res.discussions);
        }
        setHasMore(res.hasMore);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load discussions.",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isConfigured, setError, setIsLoading, setDiscussions, setHasMore, setIsRefreshing],
  );

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(async () => {
      if (ignore) return;
      setOffset(0);
      await loadDiscussions(selectedTopic, activeSearch, 0, false);
    });
    return () => {
      ignore = true;
    };
  }, [selectedTopic, activeSearch, loadDiscussions]);

  const handleSelectTopic = (topicId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (topicId) {
      nextParams.set("topic", topicId);
    } else {
      nextParams.delete("topic");
    }
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim();
    setActiveSearch(clean);
    const nextParams = new URLSearchParams(searchParams);
    if (clean) {
      nextParams.set("search", clean);
    } else {
      nextParams.delete("search");
    }
    setSearchParams(nextParams);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearch("");
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("search");
    setSearchParams(nextParams);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setOffset(0);
    loadDiscussions(selectedTopic, activeSearch, 0, false);
  };

  const handleLoadMore = () => {
    const nextOffset = offset + PAGE_SIZE;
    setOffset(nextOffset);
    loadDiscussions(selectedTopic, activeSearch, nextOffset, true);
  };

  const handleCreateOrUpdateDiscussion = async (
    data: CreateDiscussionInput,
  ) => {
    const client = getInsForgeClient();
    if (!client || !user) return;

    setIsPublishing(true);
    try {
      if (editingDiscussion) {
        const updated = await updateDiscussion(client, editingDiscussion.id, {
          title: data.title,
          content: data.content,
        });
        setDiscussions((prev) =>
          prev.map((d) => (d.id === updated.id ? updated : d)),
        );
        setEditingDiscussion(null);
      } else {
        const created = await createDiscussion(client, data, user);
        // Prepend new discussion to feed
        setDiscussions((prev) => [created, ...prev]);
        setIsComposerOpen(false);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDiscussion) return;
    const client = getInsForgeClient();
    if (!client) return;

    setIsDeleting(true);
    try {
      await deleteDiscussion(client, deletingDiscussion.id);
      setDiscussions((prev) =>
        prev.filter((d) => d.id !== deletingDiscussion.id),
      );
      setDeletingDiscussion(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete discussion.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      {/* Community Header Banner */}
      <section className="rounded-xl border border-ink/10 bg-surface p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-action">
              Global Learning Community
            </p>
            <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Collaborative Engineering Forum
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Connect with peers, verify technical claims, discuss post-quantum
              cryptography migrations, and explore zero trust architectures.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {user ? (
              <button
                type="button"
                onClick={() => setIsComposerOpen(true)}
                className="button-primary min-h-11 px-5 text-sm font-semibold shadow-xs"
              >
                + Start Discussion
              </button>
            ) : (
              <Link
                to="/auth?mode=signin"
                className="button-primary min-h-11 px-5 text-sm font-semibold shadow-xs"
              >
                Sign in to post
              </Link>
            )}
          </div>
        </div>

        {/* Collapsible Guidelines Box */}
        <div className="mt-6 border-t border-ink/10 pt-4">
          <button
            type="button"
            onClick={() => setShowGuidelines(!showGuidelines)}
            className="flex items-center gap-2 text-xs font-semibold text-action hover:underline"
            aria-expanded={showGuidelines}
          >
            <span>{showGuidelines ? "▼" : "▶"}</span>
            <span>Community posting guidelines & ethical security standards</span>
          </button>

          {showGuidelines && (
            <div className="mt-3 rounded-md bg-canvas/40 p-4 text-xs leading-relaxed text-muted space-y-2">
              <p>
                <strong className="text-ink">1. Defensive & Academic Focus:</strong>{" "}
                Discuss cryptographic designs, vulnerability mitigations, and standards.
                Never post weaponized exploits, live malware, or attack tools.
              </p>
              <p>
                <strong className="text-ink">2. Verifiable Claims:</strong> Cite
                standards from NIST, IETF, ISO/IEC, or peer-reviewed research.
              </p>
              <p>
                <strong className="text-ink">3. Professional Integrity:</strong> No
                unsolicited advertising, spam, bot accounts, or abusive language.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Topic Rooms Filter Bar */}
      <section className="mt-8" aria-label="Topic rooms">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-muted">
            Technology Rooms
          </h2>
          {selectedTopic && (
            <button
              type="button"
              onClick={() => handleSelectTopic("")}
              className="text-xs text-action font-semibold hover:underline"
            >
              Clear filter (view all)
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSelectTopic("")}
            className={`min-h-10 rounded-md border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              !selectedTopic
                ? "border-action bg-action text-surface shadow-2xs font-bold"
                : "border-ink/15 bg-surface text-ink hover:border-action/40 hover:bg-canvas/30"
            }`}
          >
            All Topics
          </button>
          {COMMUNITY_TOPICS.map((topic) => {
            const isSelected = selectedTopic === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleSelectTopic(topic.id)}
                className={`min-h-10 rounded-md border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  isSelected
                    ? "border-action bg-action text-surface shadow-2xs font-bold"
                    : "border-ink/15 bg-surface text-ink hover:border-action/40 hover:bg-canvas/30"
                }`}
              >
                {topic.name}
              </button>
            );
          })}
        </div>

        {activeTopicObj && (
          <div className="mt-4 rounded-lg border border-action/20 bg-canvas/40 p-4 text-sm">
            <span className="font-semibold text-action">
              Room: {activeTopicObj.name}
            </span>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              {activeTopicObj.description}
            </p>
          </div>
        )}
      </section>

      {/* Search & Refresh Controls */}
      <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-1 items-center gap-2 max-w-md"
        >
          <div className="relative w-full">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search discussions by title..."
              className="min-h-11 w-full rounded-md border border-ink/20 bg-surface pl-3 pr-8 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-action focus:outline-none focus:ring-2 focus:ring-action"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            className="button-secondary min-h-11 px-4 text-xs font-semibold shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="button-secondary min-h-11 px-3.5 text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
            aria-label="Refresh feed"
          >
            <span className={isRefreshing ? "animate-spin" : ""}>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </section>

      {/* Discussion Feed */}
      <section className="mt-8" aria-label="Discussions list">
        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-lg border border-ink/10 bg-surface p-12 text-muted"
          >
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-action border-r-transparent" />
            <p className="font-semibold text-sm text-ink">
              Loading community discussions...
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-lg border border-danger/20 bg-surface p-8 text-center shadow-xs"
          >
            <h3 className="font-heading text-lg font-semibold text-ink">
              Unable to load discussions
            </h3>
            <p className="mt-2 text-sm text-muted">{error}</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="button-primary mt-4 min-h-10 text-xs px-4"
            >
              Retry loading
            </button>
          </div>
        ) : discussions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink/20 bg-surface/70 p-12 text-center">
            <span className="text-3xl" aria-hidden="true">
              💬
            </span>
            <h3 className="mt-3 font-heading text-xl font-semibold text-ink">
              {activeSearch
                ? `No discussions match "${activeSearch}"`
                : selectedTopic
                  ? `No discussions in ${activeTopicObj?.name || "this room"} yet`
                  : "No community discussions posted yet"}
            </h3>
            <p className="mt-2 text-sm text-muted max-w-md mx-auto">
              {activeSearch
                ? "Try searching for a different keyword or clear your query."
                : "Be the first learner to initiate an engineering conversation or ask a question."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {activeSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="button-secondary min-h-10 text-xs px-4"
                >
                  Clear search
                </button>
              )}
              {user ? (
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(true)}
                  className="button-primary min-h-10 text-xs px-4"
                >
                  Start a discussion
                </button>
              ) : (
                <Link
                  to="/auth?mode=signin"
                  className="button-primary min-h-10 text-xs px-4 inline-flex items-center"
                >
                  Sign in to post
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {discussions.map((disc) => (
              <DiscussionCard
                key={disc.id}
                discussion={disc}
                currentUser={user}
                onEdit={(d) => setEditingDiscussion(d)}
                onDelete={(d) => setDeletingDiscussion(d)}
                onReport={(d) => setReportingDiscussion(d)}
              />
            ))}

            {/* Pagination / Load more */}
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="button-secondary min-h-11 px-6 text-sm font-semibold"
                >
                  Load more discussions
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Discussion Composer Dialog (Create & Edit) */}
      {(isComposerOpen || editingDiscussion) && (
        <DiscussionComposer
          isOpen={isComposerOpen || Boolean(editingDiscussion)}
          initialTopicId={selectedTopic}
          initialData={editingDiscussion}
          isSubmitting={isPublishing}
          onClose={() => {
            setIsComposerOpen(false);
            setEditingDiscussion(null);
          }}
          onSubmit={handleCreateOrUpdateDiscussion}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deletingDiscussion !== null}
        title="Delete Discussion"
        message="Are you sure you want to permanently delete this discussion and all its replies? This action cannot be undone."
        confirmLabel="Delete discussion"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingDiscussion(null)}
      />

      {/* Report Dialog */}
      {reportingDiscussion && (
        <ReportDialog
          isOpen={reportingDiscussion !== null}
          targetType="discussion"
          targetId={reportingDiscussion.id}
          targetTitle={reportingDiscussion.title}
          user={user}
          onClose={() => setReportingDiscussion(null)}
        />
      )}
    </main>
  );
}
