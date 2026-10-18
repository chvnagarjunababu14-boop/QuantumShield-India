import { Link } from "react-router-dom";
import type { Lesson } from "../content/types";
import { getTopic, readingMinutes } from "../content/queries";

type LessonSummaryProps = {
  lesson: Lesson;
  headingLevel?: "h2" | "h3";
};

export function LessonSummary({ lesson, headingLevel = "h3" }: LessonSummaryProps) {
  const topic = getTopic(lesson.topicId);
  const Heading = headingLevel;

  return (
    <article className="border-b border-ink/10 py-5 last:border-b-0">
      <p className="text-sm font-semibold text-action">
        {topic?.title ?? "Lesson"} · {lesson.difficulty} · About {readingMinutes(lesson)} min · Sample
      </p>
      <Heading className="mt-2 font-heading text-2xl font-semibold tracking-tight">
        <Link className="text-link" to={`/lessons/${lesson.slug}`}>
          {lesson.title}
        </Link>
      </Heading>
      <p className="mt-2 max-w-[68ch] leading-relaxed">{lesson.summary}</p>
    </article>
  );
}
