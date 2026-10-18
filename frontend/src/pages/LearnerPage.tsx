import { BookmarkSimple, CheckCircle, Trophy, UserCheck } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getInsForgeClient } from "../api/insforge";
import {
  fetchBookmarks,
  fetchLessonProgress,
  fetchQuizResults,
  removeBookmark,
} from "../api/learning";
import { lessons } from "../content/catalog";
import { getLesson } from "../content/queries";
import { useAuth } from "../context/useAuth";
import type { Bookmark, LessonProgress, QuizResult } from "../types/learning";
import { usePageTitle } from "./usePageTitle";

export function LearnerPage() {
  usePageTitle("My Learning — QuantumShield India");

  const { user, profile, isLoading, updateDisplayName } = useAuth();
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Edit profile state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameFeedback, setNameFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const client = getInsForgeClient();
    if (!client) return;

    let ignore = false;

    Promise.resolve().then(async () => {
      if (ignore) return;
      setIsDataLoading(true);
      setDataError(null);
      try {
        const [prog, bks, qz] = await Promise.all([
          fetchLessonProgress(client, user.id),
          fetchBookmarks(client, user.id),
          fetchQuizResults(client, user.id),
        ]);
        if (ignore) return;
        setProgress(prog);
        setBookmarks(bks);
        setQuizResults(qz);
      } catch (err) {
        if (ignore) return;
        setDataError(err instanceof Error ? err.message : "Failed to load learner records");
      } finally {
        if (!ignore) {
          setIsDataLoading(false);
        }
      }
    });

    return () => {
      ignore = true;
    };
  }, [user?.id]);

  const handleStartEdit = () => {
    setNameInput(profile?.display_name || user?.displayName || "");
    setIsEditingName(true);
    setNameFeedback(null);
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setIsSavingName(true);
    setNameFeedback(null);

    const res = await updateDisplayName(nameInput.trim());
    setIsSavingName(false);

    if (res.success) {
      setIsEditingName(false);
      setNameFeedback("Profile updated successfully.");
    } else {
      setNameFeedback(res.error || "Failed to update profile.");
    }
  };

  const handleRemoveBookmark = async (lessonSlug: string) => {
    if (!user?.id) return;
    const client = getInsForgeClient();
    if (!client) return;

    try {
      await removeBookmark(client, { userId: user.id, lessonSlug });
      setBookmarks((current) => current.filter((b) => b.lesson_slug !== lessonSlug));
    } catch (err) {
      setDataError(err instanceof Error ? err.message : "Failed to remove bookmark");
    }
  };

  if (isLoading) {
    return (
      <main id="main" className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
        <p role="status" className="text-muted font-medium">
          Loading learner dashboard...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main id="main" className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8">
        <div className="rounded-lg border border-ink/10 bg-surface p-8 text-center shadow-sm">
          <UserCheck size={48} weight="regular" className="mx-auto text-action" aria-hidden="true" />
          <h1 className="mt-4 font-heading text-3xl font-semibold text-ink">
            Sign in to access your learning dashboard
          </h1>
          <p className="mx-auto mt-3 max-w-[50ch] text-muted leading-relaxed">
            Public lessons are open to everyone. To view your completed lessons, saved bookmarks,
            and quiz attempt history, please sign in or create an account.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link to="/auth?mode=signin" className="button-primary min-h-11">
              Sign In
            </Link>
            <Link to="/auth?mode=signup" className="button-secondary min-h-11">
              Create Account
            </Link>
            <Link to="/explore" className="text-link font-medium">
              Browse public catalogue
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const completedCount = progress.filter((p) => p.completed).length;
  const totalLessonsCount = lessons.length;
  const progressPercent = Math.round((completedCount / totalLessonsCount) * 100);

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      {/* Profile Header */}
      <section aria-labelledby="learner-profile-heading" className="rounded-lg border border-ink/10 bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 id="learner-profile-heading" className="font-heading text-3xl font-semibold text-ink">
              {profile?.display_name || user.displayName || "Learner"}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {user.email} · Authenticated via InsForge
            </p>
          </div>
          <div>
            {!isEditingName ? (
              <button
                type="button"
                onClick={handleStartEdit}
                className="button-secondary text-sm font-semibold min-h-11 cursor-pointer"
              >
                Edit Display Name
              </button>
            ) : null}
          </div>
        </div>

        {isEditingName && (
          <form onSubmit={handleSaveName} className="mt-4 flex flex-col gap-3 border-t border-ink/10 pt-4 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1.5 flex-1">
              <label htmlFor="edit-display-name" className="text-xs font-semibold text-ink">
                New display name
              </label>
              <input
                id="edit-display-name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="min-h-11 rounded-md border border-ink/20 bg-surface px-3 py-1.5 text-sm text-ink focus:border-action focus:outline-none focus:ring-2 focus:ring-action"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSavingName}
                className="button-primary text-sm min-h-11 px-4 cursor-pointer"
              >
                {isSavingName ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="button-secondary text-sm min-h-11 px-3 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {nameFeedback && (
          <p role="status" className="mt-2 text-xs font-medium text-ok">
            {nameFeedback}
          </p>
        )}

        {dataError && (
          <div role="alert" className="mt-4 rounded border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
            {dataError}
          </div>
        )}
      </section>

      {/* Progress & Stats Cards */}
      <section aria-labelledby="learning-overview-heading" className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-ink/10 bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3 text-action">
            <CheckCircle size={24} weight="regular" aria-hidden="true" />
            <span className="font-semibold text-sm">Lessons Completed</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-ink">
            {completedCount} <span className="text-base font-normal text-muted">/ {totalLessonsCount}</span>
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-canvas">
            <div
              className="h-full bg-action transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <div className="rounded-lg border border-ink/10 bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3 text-action">
            <BookmarkSimple size={24} weight="regular" aria-hidden="true" />
            <span className="font-semibold text-sm">Saved Bookmarks</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-ink">{bookmarks.length}</p>
          <p className="mt-1 text-xs text-muted">Lessons saved for quick reference</p>
        </div>

        <div className="rounded-lg border border-ink/10 bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3 text-action">
            <Trophy size={24} weight="regular" aria-hidden="true" />
            <span className="font-semibold text-sm">Quizzes Completed</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-ink">{quizResults.length}</p>
          <p className="mt-1 text-xs text-muted">Recorded assessment attempts</p>
        </div>
      </section>

      {/* Bookmarks Section */}
      <section aria-labelledby="bookmarks-heading" className="mt-10">
        <div className="flex items-center justify-between">
          <h2 id="bookmarks-heading" className="font-heading text-2xl font-semibold text-ink">
            Saved Bookmarks
          </h2>
          <Link to="/explore" className="text-link text-sm font-semibold">
            Explore more lessons
          </Link>
        </div>

        {isDataLoading ? (
          <p className="mt-4 text-sm text-muted">Loading bookmarks...</p>
        ) : bookmarks.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-ink/20 p-6 text-center">
            <p className="text-muted">You haven't bookmarked any lessons yet.</p>
            <p className="mt-1 text-xs text-muted">
              Click the "Bookmark lesson" button on any lesson reader page to save it here.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {bookmarks.map((bm) => {
              const lesson = getLesson(bm.lesson_slug);
              return (
                <div
                  key={bm.id}
                  className="flex flex-col justify-between rounded-lg border border-ink/10 bg-surface p-5 shadow-sm"
                >
                  <div>
                    <span className="text-xs font-semibold text-action">
                      {lesson ? lesson.difficulty : "Lesson"}
                    </span>
                    <h3 className="mt-1 font-heading text-lg font-semibold text-ink">
                      {lesson ? lesson.title : bm.lesson_slug}
                    </h3>
                    <p className="mt-2 text-sm text-muted line-clamp-2">
                      {lesson?.summary || "Saved lesson bookmark."}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3">
                    <Link
                      to={`/lessons/${bm.lesson_slug}`}
                      className="text-link text-sm font-semibold"
                    >
                      Continue reading →
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemoveBookmark(bm.lesson_slug)}
                      className="text-xs text-danger hover:underline min-h-11 px-2 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Completed Lessons Section */}
      <section aria-labelledby="progress-heading" className="mt-12">
        <h2 id="progress-heading" className="font-heading text-2xl font-semibold text-ink">
          Lesson Progress
        </h2>

        {progress.filter((p) => p.completed).length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-ink/20 p-6 text-center">
            <p className="text-muted">No lessons marked complete yet.</p>
            <p className="mt-1 text-xs text-muted">
              As you read lessons, mark them as complete to track your learning journey here.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-ink/10 bg-surface">
            <ul className="divide-y divide-ink/10">
              {progress
                .filter((p) => p.completed)
                .map((item) => {
                  const lesson = getLesson(item.lesson_slug);
                  return (
                    <li key={item.id} className="flex items-center justify-between p-4 hover:bg-canvas/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <CheckCircle size={20} weight="fill" className="text-ok" aria-hidden="true" />
                        <div>
                          <Link
                            to={`/lessons/${item.lesson_slug}`}
                            className="font-medium text-ink hover:underline"
                          >
                            {lesson ? lesson.title : item.lesson_slug}
                          </Link>
                          <p className="text-xs text-muted">
                            Completed {new Date(item.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/lessons/${item.lesson_slug}`}
                        className="text-link text-xs font-semibold"
                      >
                        Review
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        )}
      </section>

      {/* Quiz Results History */}
      <section aria-labelledby="quiz-history-heading" className="mt-12">
        <h2 id="quiz-history-heading" className="font-heading text-2xl font-semibold text-ink">
          Quiz Assessment History
        </h2>

        {quizResults.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-ink/20 p-6 text-center">
            <p className="text-muted">No saved quiz attempts yet.</p>
            <p className="mt-1 text-xs text-muted">
              Complete any sample lesson quiz and save your score to review your assessment records here.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-ink/10 bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink/10 bg-canvas/50 text-xs font-semibold text-ink">
                <tr>
                  <th scope="col" className="px-4 py-3">Quiz / Lesson</th>
                  <th scope="col" className="px-4 py-3">Score</th>
                  <th scope="col" className="px-4 py-3">Percentage</th>
                  <th scope="col" className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {quizResults.map((result) => {
                  const pct = Math.round((result.score / result.total_score) * 100);
                  const isPerfect = result.score === result.total_score;
                  return (
                    <tr key={result.id} className="hover:bg-canvas/20">
                      <td className="px-4 py-3 font-medium text-ink">
                        {result.quiz_id}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-ink">{result.score}</span> / {result.total_score}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${
                            isPerfect
                              ? "bg-ok/10 text-ok"
                              : "bg-action/10 text-action"
                          }`}
                        >
                          {pct}% {isPerfect ? "— Perfect" : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {new Date(result.submitted_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
