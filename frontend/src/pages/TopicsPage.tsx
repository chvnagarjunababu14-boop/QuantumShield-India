import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Compass,
  Sparkle,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { topics } from "../content/catalog";
import { getLessonsForTopic } from "../content/queries";
import { usePageTitle } from "./usePageTitle";

export function TopicsPage() {
  usePageTitle("Educational Topics — QuantumShield India");

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      {/* Page Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-action/20 bg-action/5 px-3 py-1 text-xs font-semibold text-action">
          <Compass size={14} weight="bold" />
          <span>Curriculum Domains</span>
        </div>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
          Educational Topics
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          Explore the core knowledge domains underpinning modern cybersecurity, quantum computing, and post-quantum defense. Each topic details key theoretical principles, real-world defensive requirements, and matching curriculum lessons.
        </p>
      </div>

      {/* Jump Navigation Pills */}
      <nav
        aria-label="Topics jump navigation"
        className="mt-8 flex flex-wrap gap-2 border-y border-ink/8 py-4 text-xs font-semibold text-muted"
      >
        <span className="self-center pr-2 text-ink">Jump to topic:</span>
        {topics.map((topic) => (
          <a
            key={topic.id}
            href={`#${topic.id}`}
            className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 transition-colors hover:border-action hover:text-action hover:bg-canvas-subtle"
          >
            {topic.title}
          </a>
        ))}
      </nav>

      {/* Topic Sections */}
      <div className="mt-12 space-y-16">
        {topics.map((topic, index) => {
          const matchingLessons = getLessonsForTopic(topic.id);
          const domainNumber = String(index + 1).padStart(2, "0");

          return (
            <section
              key={topic.id}
              id={topic.id}
              aria-labelledby={`heading-${topic.id}`}
              className="glass-panel scroll-mt-24 rounded-3xl border border-ink/10 p-6 sm:p-8 lg:p-10 shadow-sm"
            >
              {/* Top Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/8 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-md bg-navy px-2 py-0.5 text-xs font-mono font-bold text-white">
                    DOMAIN {domainNumber}
                  </span>
                  <span className="text-xs font-semibold text-action uppercase tracking-wider">
                    {topic.id}
                  </span>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-semibold text-emerald-800">
                  {matchingLessons.length}{" "}
                  {matchingLessons.length === 1 ? "matching lesson" : "matching lessons"}
                </span>
              </div>

              {/* Title & Overview */}
              <div className="mt-6">
                <h2
                  id={`heading-${topic.id}`}
                  className="font-heading text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
                >
                  {topic.title}
                </h2>
                <p className="mt-2 text-base font-medium text-action/90 sm:text-lg">
                  {topic.summary}
                </p>
              </div>

              {/* Content Grid: Illustration + Comprehensive Details */}
              <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-start">
                {/* Left: Illustration Card */}
                <div className="lg:col-span-5">
                  {topic.illustrationSrc ? (
                    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-slate-50 shadow-sm">
                      <img
                        src={topic.illustrationSrc}
                        alt={topic.illustrationAlt ?? topic.title}
                        className="h-56 w-full object-cover transition-transform duration-300 hover:scale-105 sm:h-64"
                        loading="lazy"
                      />
                      <div className="border-t border-ink/8 bg-white/80 p-4">
                        <p className="text-xs leading-relaxed text-muted">
                          {topic.illustrationAlt}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Matching Lessons Quick Box */}
                  <div className="mt-4 rounded-xl border border-ink/8 bg-surface p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Catalogue Lessons ({matchingLessons.length})
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs">
                      {matchingLessons.map((lesson) => (
                        <li key={lesson.slug}>
                          <Link
                            to={`/lessons/${lesson.slug}`}
                            className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-action transition-colors"
                          >
                            <BookOpen size={13} className="text-action flex-shrink-0" />
                            <span>{lesson.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Detailed Explanation, Concepts, and Action */}
                <div className="flex flex-col justify-between space-y-6 lg:col-span-7">
                  {/* Detailed Description */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                      What This Topic Covers
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink sm:text-base">
                      {topic.description ?? topic.summary}
                    </p>
                  </div>

                  {/* Key Concepts Box */}
                  {topic.keyConcepts && topic.keyConcepts.length > 0 ? (
                    <div className="rounded-2xl border border-ink/10 bg-white/70 p-5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-action">
                        Key Concepts & Learning Outcomes
                      </h3>
                      <ul className="mt-3 space-y-2 text-xs sm:text-sm text-ink/90">
                        {topic.keyConcepts.map((concept) => (
                          <li key={concept} className="flex items-start gap-2">
                            <CheckCircle
                              size={16}
                              weight="fill"
                              className="mt-0.5 flex-shrink-0 text-emerald-600"
                            />
                            <span>{concept}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* Action Row */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      to={`/explore?topic=${topic.id}`}
                      className="button-primary inline-flex min-h-11 items-center gap-2 px-5 text-sm font-semibold shadow-sm"
                    >
                      <Sparkle size={16} weight="fill" />
                      Explore topic ({matchingLessons.length}{" "}
                      {matchingLessons.length === 1 ? "lesson" : "lessons"})
                      <ArrowRight size={15} weight="bold" />
                    </Link>

                    <Link
                      to="/explore"
                      className="button-secondary inline-flex min-h-11 items-center gap-1.5 px-4 text-xs sm:text-sm font-semibold"
                    >
                      View all lessons &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Bottom Hub Summary */}
      <div className="mt-16 rounded-3xl border border-action/20 bg-gradient-to-r from-action/5 via-canvas-subtle to-action/10 p-8 sm:p-10 text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Ready to discover individual lessons?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Browse the complete catalogue with real-time keyword search, topic filters, and difficulty levels.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/explore"
            className="button-primary inline-flex min-h-11 items-center gap-2 px-6 text-sm font-semibold shadow-sm"
          >
            Open Lesson Catalogue
            <ArrowRight size={16} weight="bold" />
          </Link>
          <Link
            to="/simulator"
            className="button-secondary inline-flex min-h-11 items-center gap-2 px-6 text-sm font-semibold"
          >
            Launch Threat Simulator
          </Link>
        </div>
      </div>
    </main>
  );
}
