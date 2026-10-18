import { ArrowRight, CheckCircle, Clock } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { LESSON_ILLUSTRATIONS } from "../content/lessonExtras";
import { getTopic, readingMinutes } from "../content/queries";
import type { Lesson } from "../content/types";

type LessonSummaryProps = {
  lesson: Lesson;
  headingLevel?: "h2" | "h3";
  isCompleted?: boolean;
  isInProgress?: boolean;
};

export function LessonSummary({
  lesson,
  headingLevel = "h3",
  isCompleted = false,
  isInProgress = false,
}: LessonSummaryProps) {
  const topic = getTopic(lesson.topicId);
  const Heading = headingLevel;
  const illustration = LESSON_ILLUSTRATIONS[lesson.slug];
  const minutes = readingMinutes(lesson);

  const actionText = isCompleted ? "Continue learning" : isInProgress ? "Continue learning" : "Start lesson";

  return (
    <article className="glass-panel group my-4 flex flex-col overflow-hidden rounded-2xl border border-ink/10 p-5 transition-all hover:border-action/40 hover:shadow-md sm:flex-row sm:items-center sm:gap-6 sm:p-6">
      {/* Lesson Illustration Thumbnail */}
      {illustration ? (
        <div className="relative mb-4 h-40 w-full flex-shrink-0 overflow-hidden rounded-xl border border-ink/8 bg-slate-50 sm:mb-0 sm:h-36 sm:w-48">
          <img
            src={illustration.src}
            alt={illustration.alt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <span className="absolute bottom-2 left-2 rounded-md bg-navy/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {illustration.badge}
          </span>
        </div>
      ) : null}

      {/* Lesson Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-md bg-action/10 px-2.5 py-0.5 text-action">
              {topic?.title ?? "Foundations"}
            </span>
            <span className="rounded-md bg-canvas-subtle px-2 py-0.5 text-muted border border-ink/8">
              {lesson.difficulty}
            </span>
            <span className="inline-flex items-center gap-1 text-muted">
              <Clock size={13} weight="bold" />
              About {minutes} min
            </span>

            {/* Completion Indicator */}
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-emerald-800">
                <CheckCircle size={13} weight="fill" className="text-emerald-600" />
                Completed
              </span>
            ) : isInProgress ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-amber-800">
                <Clock size={13} weight="bold" className="text-amber-600" />
                In Progress
              </span>
            ) : null}
          </div>

          {/* Heading */}
          <Heading className="mt-2.5 font-heading text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            <Link
              className="text-link transition-colors hover:text-action hover:underline"
              to={`/lessons/${lesson.slug}`}
            >
              {lesson.title}
            </Link>
          </Heading>

          {/* Summary */}
          <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-muted sm:text-base">
            {lesson.summary}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-ink/8 sm:border-0 sm:pt-0">
          <Link
            to={`/lessons/${lesson.slug}`}
            className="button-primary inline-flex min-h-9 items-center gap-1.5 px-4 text-xs font-semibold shadow-sm sm:text-sm"
          >
            {actionText}
            <ArrowRight size={14} weight="bold" />
          </Link>
          <span className="text-xs font-mono text-muted/70">
            /lessons/{lesson.slug}
          </span>
        </div>
      </div>
    </article>
  );
}
