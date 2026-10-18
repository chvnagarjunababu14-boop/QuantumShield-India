import { BookmarkSimple, CheckCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getInsForgeClient } from "../api/insforge";
import {
  addBookmark,
  fetchBookmarks,
  fetchLessonProgress,
  removeBookmark,
  saveLessonProgress,
} from "../api/learning";
import { LessonArticle } from "../components/LessonArticle";
import {
  getLesson,
  getTopic,
  lessonHeadings,
  neighboringLessons,
  readingMinutes,
} from "../content/queries";
import { useAuth } from "../context/useAuth";
import { usePageTitle } from "./usePageTitle";

export function LessonPage() {
  const { slug = "" } = useParams();
  const lesson = getLesson(slug);
  usePageTitle(lesson?.title ?? "Lesson not found");

  const { user } = useAuth();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Restore progress and bookmark state for authenticated users
  useEffect(() => {
    let isMounted = true;

    if (!user?.id || !slug) {
      Promise.resolve().then(() => {
        if (isMounted) {
          setIsCompleted(false);
          setIsBookmarked(false);
        }
      });
      return () => {
        isMounted = false;
      };
    }

    const client = getInsForgeClient();
    if (!client) return;

    Promise.resolve().then(async () => {
      try {
        const [progressList, bookmarkList] = await Promise.all([
          fetchLessonProgress(client, user.id),
          fetchBookmarks(client, user.id),
        ]);
        if (!isMounted) return;

        const currentProg = progressList.find((p) => p.lesson_slug === slug);
        setIsCompleted(currentProg?.completed ?? false);

        const currentBm = bookmarkList.find((b) => b.lesson_slug === slug);
        setIsBookmarked(Boolean(currentBm));
      } catch {
        // Quiet fallback on network or offline state
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user?.id, slug]);

  if (!lesson) {
    return (
      <main id="main" className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
        <h1 className="font-heading text-4xl font-semibold">This lesson is not in the catalogue</h1>
        <p className="mt-4 max-w-[62ch] text-lg leading-relaxed">
          The sample set has a fixed list of lessons. This address is not one of them.
        </p>
        <p className="mt-4">
          <Link className="text-link" to="/explore">
            Back to explore
          </Link>
        </p>
      </main>
    );
  }

  const topic = getTopic(lesson.topicId);
  const headings = lessonHeadings(lesson);
  const neighbors = neighboringLessons(lesson.slug);

  const handleToggleComplete = async () => {
    if (!user?.id) return;
    const client = getInsForgeClient();
    if (!client) {
      setFeedback("InsForge backend is not configured.");
      return;
    }

    setActionLoading(true);
    setFeedback(null);
    const newStatus = !isCompleted;

    try {
      await saveLessonProgress(client, {
        userId: user.id,
        lessonSlug: slug,
        completed: newStatus,
      });
      setIsCompleted(newStatus);
      setFeedback(newStatus ? "Lesson marked as complete." : "Lesson marked as in progress.");
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Failed to update completion status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!user?.id) return;
    const client = getInsForgeClient();
    if (!client) {
      setFeedback("InsForge backend is not configured.");
      return;
    }

    setActionLoading(true);
    setFeedback(null);

    try {
      if (isBookmarked) {
        await removeBookmark(client, { userId: user.id, lessonSlug: slug });
        setIsBookmarked(false);
        setFeedback("Bookmark removed.");
      } else {
        await addBookmark(client, { userId: user.id, lessonSlug: slug });
        setIsBookmarked(true);
        setFeedback("Lesson bookmarked.");
      }
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Failed to update bookmark.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <p className="text-sm font-semibold text-action">
        {topic?.title ?? "Lesson"} · {lesson.difficulty} · About {readingMinutes(lesson)} min read · Sample lesson
      </p>
      <h1 className="mt-3 max-w-[20ch] font-heading text-[2rem] leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
        {lesson.title}
      </h1>
      <p className="mt-4 max-w-[68ch] text-lg leading-relaxed">{lesson.summary}</p>
      <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-muted">
        Written as sample teaching material for this release. It is not a certified course and it does not report live news.
      </p>

      {/* Learner Interactive Bar */}
      <div className="mt-6 flex max-w-[68ch] flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-surface p-4 shadow-sm">
        {user ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleToggleComplete}
                disabled={actionLoading}
                className={`inline-flex min-h-11 items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                  isCompleted
                    ? "bg-ok/10 text-ok border border-ok/30"
                    : "button-secondary"
                }`}
              >
                <CheckCircle size={18} weight={isCompleted ? "fill" : "regular"} aria-hidden="true" />
                {isCompleted ? "Completed" : "Mark as complete"}
              </button>

              <button
                type="button"
                onClick={handleToggleBookmark}
                disabled={actionLoading}
                className={`inline-flex min-h-11 items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                  isBookmarked
                    ? "bg-action/10 text-action border border-action/30"
                    : "button-secondary"
                }`}
              >
                <BookmarkSimple size={18} weight={isBookmarked ? "fill" : "regular"} aria-hidden="true" />
                {isBookmarked ? "Bookmarked" : "Bookmark lesson"}
              </button>
            </div>
            {feedback && (
              <p role="status" className="text-xs font-semibold text-action">
                {feedback}
              </p>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between w-full text-xs text-muted">
            <span>Public sample lesson · Open without an account.</span>
            <Link to="/auth?mode=signin" className="text-link font-semibold">
              Sign in to save progress & bookmarks →
            </Link>
          </div>
        )}
      </div>

      {headings.length > 0 ? (
        <nav aria-label="On this page" className="mt-8 max-w-[68ch] border-y border-ink/10 py-4">
          <p className="text-sm font-semibold tracking-wide text-muted">On this page</p>
          <ol className="mt-2 flex flex-col gap-1">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a className="text-link" href={`#${heading.id}`}>
                  {heading.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <article className="mt-2">
        <LessonArticle blocks={lesson.blocks} />
      </article>

      <nav aria-label="Lesson sequence" className="mt-12 grid gap-4 border-t border-ink/10 pt-6 sm:grid-cols-2">
        {neighbors.previous ? (
          <Link className="text-link" to={`/lessons/${neighbors.previous.slug}`}>
            Previous: {neighbors.previous.title}
          </Link>
        ) : (
          <span />
        )}
        {neighbors.next ? (
          <Link className="text-link sm:text-right" to={`/lessons/${neighbors.next.slug}`}>
            Next: {neighbors.next.title}
          </Link>
        ) : null}
      </nav>
    </main>
  );
}
