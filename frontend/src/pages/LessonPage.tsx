import { Link, useParams } from "react-router-dom";
import { LessonArticle } from "../components/LessonArticle";
import { getLesson, getTopic, lessonHeadings, neighboringLessons, readingMinutes } from "../content/queries";
import { usePageTitle } from "./usePageTitle";

export function LessonPage() {
  const { slug = "" } = useParams();
  const lesson = getLesson(slug);
  usePageTitle(lesson?.title ?? "Lesson not found");

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
