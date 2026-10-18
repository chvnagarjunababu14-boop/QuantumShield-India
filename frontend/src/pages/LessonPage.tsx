import {
  BookmarkSimple,
  CheckCircle,
  Clock,
  Target,
} from "@phosphor-icons/react";
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
import { LessonHeroImage } from "../components/lessons/LessonHeroImage";
import { KeyTakeawaysRecap } from "../components/lessons/KeyTakeawaysRecap";
import { RealWorldScenario } from "../components/lessons/RealWorldScenario";
import { CiaTriadVisualizer } from "../components/lessons/CiaTriadVisualizer";
import { BitVsQubitVisualizer } from "../components/lessons/BitVsQubitVisualizer";
import { QuantumCryptoThreatMatrix } from "../components/lessons/QuantumCryptoThreatMatrix";
import { PqcAlgorithmExplorer } from "../components/lessons/PqcAlgorithmExplorer";
import { AiSecurityPipeline } from "../components/lessons/AiSecurityPipeline";
import { CloudIotArchitecture } from "../components/lessons/CloudIotArchitecture";
import {
  LESSON_ILLUSTRATIONS,
  LESSON_OBJECTIVES,
  LESSON_SCENARIOS,
  LESSON_TAKEAWAYS,
} from "../content/lessonExtras";
import { lessons } from "../content/catalog";
import {
  getLesson,
  getTopic,
  lessonHeadings,
  neighboringLessons,
  readingMinutes,
} from "../content/queries";
import { useAuth } from "../context/useAuth";
import { usePageTitle } from "./usePageTitle";

function renderInteractiveLab(slug: string) {
  switch (slug) {
    case "cybersecurity-fundamentals":
      return <CiaTriadVisualizer />;
    case "quantum-computing-fundamentals":
      return <BitVsQubitVisualizer />;
    case "quantum-computing-and-cryptography":
      return <QuantumCryptoThreatMatrix />;
    case "post-quantum-cryptography":
      return <PqcAlgorithmExplorer />;
    case "artificial-intelligence":
      return <AiSecurityPipeline />;
    case "cloud-and-iot-security":
      return <CloudIotArchitecture />;
    default:
      return null;
  }
}

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
      <main id="main" className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
        <h1 className="font-heading text-4xl font-semibold text-ink">This lesson is not in the catalogue</h1>
        <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-muted">
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
  const illustration = LESSON_ILLUSTRATIONS[slug];
  const objectives = LESSON_OBJECTIVES[slug];
  const scenario = LESSON_SCENARIOS[slug];
  const takeaways = LESSON_TAKEAWAYS[slug];

  const lessonIndex = lessons.findIndex((l) => l.slug === slug);
  const progressBadge = lessonIndex >= 0 ? `Lesson ${lessonIndex + 1} of ${lessons.length}` : "Lesson";

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
      {/* Lesson Meta Header */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-action">
        <span className="rounded-full bg-action/10 px-2.5 py-0.5">
          {progressBadge}
        </span>
        <span>·</span>
        <span>{topic?.title ?? "Lesson"}</span>
        <span>·</span>
        <span className="text-muted">{lesson.difficulty}</span>
        <span>·</span>
        <span className="inline-flex items-center gap-1 text-muted">
          <Clock size={14} /> About {readingMinutes(lesson)} min
        </span>
      </div>

      {/* Lesson Title */}
      <h1 className="mt-3 max-w-[22ch] font-heading text-[2.25rem] leading-tight font-semibold tracking-tight text-ink text-balance sm:text-5xl">
        {lesson.title}
      </h1>

      <p className="mt-4 max-w-[68ch] text-lg leading-relaxed text-slate-800">{lesson.summary}</p>

      {/* Hero Illustration */}
      {illustration && (
        <div className="max-w-[68ch]">
          <LessonHeroImage
            src={illustration.src}
            alt={illustration.alt}
            caption={illustration.caption}
            badge={illustration.badge}
          />
        </div>
      )}

      {/* Learning Objectives Box */}
      {objectives && objectives.length > 0 && (
        <section
          aria-labelledby="objectives-heading"
          className="my-6 max-w-[68ch] rounded-xl border border-action/20 bg-canvas-subtle p-5 shadow-xs"
        >
          <div className="flex items-center gap-2 text-action font-heading font-semibold text-sm">
            <Target size={18} weight="bold" />
            <h2 id="objectives-heading" className="text-sm font-semibold text-ink">
              What You&apos;ll Learn
            </h2>
          </div>
          <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-800">
            {objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-action shrink-0" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Learner Progress & Bookmark Action Bar */}
      <div className="mt-6 flex max-w-[68ch] flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-surface p-4 shadow-xs">
        {user ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleToggleComplete}
                disabled={actionLoading}
                className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
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
                className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
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
            <span className="font-medium">Public sample lesson · Open without an account.</span>
            <Link to="/auth?mode=signin" className="text-link font-semibold">
              Sign in to save progress & bookmarks →
            </Link>
          </div>
        )}
      </div>

      {/* On This Page TOC Navigation */}
      {headings.length > 0 ? (
        <nav aria-label="On this page" className="mt-8 max-w-[68ch] rounded-xl border border-ink/8 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">On this page</p>
          <ol className="mt-2.5 flex flex-col gap-1.5 text-sm">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a className="text-link" href={`#${heading.id}`}>
                  {heading.text}
                </a>
              </li>
            ))}
            <li>
              <a className="text-link" href="#interactive-lab">
                Interactive Concept Lab
              </a>
            </li>
            {scenario && (
              <li>
                <a className="text-link" href="#scenario">
                  Real-World Decision Scenario
                </a>
              </li>
            )}
            <li>
              <a className="text-link" href="#sample-quiz-heading">
                Knowledge Check Quiz
              </a>
            </li>
            {takeaways && (
              <li>
                <a className="text-link" href="#recap">
                  Key Takeaways Recap
                </a>
              </li>
            )}
          </ol>
        </nav>
      ) : null}

      {/* Lesson Content Body */}
      <article className="mt-4">
        <LessonArticle blocks={lesson.blocks} lessonSlug={slug} />
      </article>

      {/* Interactive Visual Activity / Lab */}
      <div className="max-w-[68ch]">
        {renderInteractiveLab(slug)}
      </div>

      {/* Real-World Applied Scenario */}
      {scenario && (
        <div className="max-w-[68ch]">
          <RealWorldScenario scenario={scenario} />
        </div>
      )}

      {/* Key Takeaways Recap */}
      {takeaways && (
        <div className="max-w-[68ch]">
          <KeyTakeawaysRecap items={takeaways} />
        </div>
      )}

      {/* Previous / Next Lesson Navigation */}
      <nav
        aria-label="Lesson sequence"
        className="mt-14 max-w-[68ch] grid gap-4 border-t border-ink/10 pt-8 sm:grid-cols-2"
      >
        {neighbors.previous ? (
          <Link
            className="card-elevated flex flex-col justify-between rounded-xl border border-ink/8 bg-white p-4.5 text-left transition-all"
            to={`/lessons/${neighbors.previous.slug}`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Previous Lesson
            </span>
            <span className="mt-1 font-heading text-sm font-semibold text-action">
              Previous: {neighbors.previous.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {neighbors.next ? (
          <Link
            className="card-elevated flex flex-col justify-between rounded-xl border border-ink/8 bg-white p-4.5 text-left sm:text-right transition-all"
            to={`/lessons/${neighbors.next.slug}`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Next Lesson
            </span>
            <span className="mt-1 font-heading text-sm font-semibold text-action">
              Next: {neighbors.next.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </main>
  );
}
