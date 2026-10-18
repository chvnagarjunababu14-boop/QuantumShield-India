import { Link } from "react-router-dom";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { LessonSummary } from "../components/LessonSummary";
import { learningPaths, topics } from "../content/catalog";
import { featuredLessons, getLesson } from "../content/queries";
import { useHealthStatus } from "../hooks/useHealthStatus";
import { usePageTitle } from "./usePageTitle";

export function HomePage() {
  const { snapshot, retry } = useHealthStatus();
  usePageTitle("QuantumShield India");
  const featured = featuredLessons();

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <p className="text-sm font-semibold tracking-wide text-action">Public learning platform</p>
      <h1 className="mt-3 max-w-[18ch] font-heading text-[2rem] leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
        Learn cybersecurity and emerging technology together.
      </h1>
      <p className="mt-5 max-w-[62ch] text-lg leading-relaxed">
        QuantumShield India is a public place to study cybersecurity, quantum computing,
        post-quantum cryptography, and other emerging technologies.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="button-primary" to="/explore">
          Explore lessons
        </Link>
        <Link className="button-secondary" to="/community">
          Community plans
        </Link>
      </div>

      <section className="mt-14" aria-labelledby="topics-heading">
        <h2 id="topics-heading" className="font-heading text-3xl font-semibold">
          Topics
        </h2>
        <ul className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
          {topics.map((topic) => (
            <li key={topic.id} className="border-t border-ink/15 pt-4">
              <h3 className="font-heading text-xl font-semibold">
                <Link className="text-link" to={`/explore?topic=${topic.id}`}>
                  {topic.title}
                </Link>
              </h3>
              <p className="mt-2 max-w-[48ch] leading-relaxed text-muted">{topic.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14" aria-labelledby="paths-heading">
        <h2 id="paths-heading" className="font-heading text-3xl font-semibold">
          Learning paths
        </h2>
        <ol className="mt-6 flex flex-col gap-6">
          {learningPaths.map((path, index) => {
            const first = getLesson(path.lessonSlugs[0] ?? "");
            return (
              <li key={path.id} className="grid gap-3 border-t border-ink/15 pt-5 sm:grid-cols-[4rem_1fr]">
                <p className="font-heading text-2xl font-semibold text-action">{index + 1}</p>
                <div>
                  <h3 className="font-heading text-xl font-semibold">{path.title}</h3>
                  <p className="mt-2 max-w-[62ch] leading-relaxed">{path.summary}</p>
                  {first ? (
                    <p className="mt-3">
                      <Link className="text-link" to={`/lessons/${first.slug}`}>
                        Start with {first.title}
                      </Link>
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-14" aria-labelledby="featured-heading">
        <h2 id="featured-heading" className="font-heading text-3xl font-semibold">
          Featured lessons
        </h2>
        <p className="mt-2 max-w-[62ch] text-muted">
          Sample lessons written for this release. They are a reading set, not a record of current news.
        </p>
        <div className="mt-4">
          {featured.map((lesson) => (
            <LessonSummary key={lesson.slug} lesson={lesson} />
          ))}
        </div>
      </section>

      <section className="glass-panel mt-14 rounded-2xl p-5 sm:p-6" aria-labelledby="community-heading">
        <h2 id="community-heading" className="font-heading text-2xl font-semibold">
          A global community, later
        </h2>
        <p className="mt-3 max-w-[62ch] leading-relaxed">
          Discussion rooms for these topics are part of the plan. This release has the entry point and
          the lessons. It does not host conversations.
        </p>
        <p className="mt-4">
          <Link className="text-link" to="/community">
            Read the community plan
          </Link>
        </p>
      </section>

      <div className="mt-14 max-w-2xl">
        <ConnectionStatus snapshot={snapshot} onRetry={retry} />
      </div>
    </main>
  );
}
