import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getInsForgeClient } from "../api/insforge";
import { fetchLessonProgress } from "../api/learning";
import { LessonSummary } from "../components/LessonSummary";
import { topics } from "../content/catalog";
import { filterLessons } from "../content/queries";
import type { Difficulty } from "../content/types";
import { useAuth } from "../context/useAuth";
import type { LessonProgress } from "../types/learning";
import { usePageTitle } from "./usePageTitle";

const difficulties: Array<Difficulty | "all"> = ["all", "Foundational", "Intermediate"];

export function ExplorePage() {
  const [params, setParams] = useSearchParams();
  usePageTitle("Explore lessons");

  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});

  useEffect(() => {
    if (!user?.id) return;
    const client = getInsForgeClient();
    if (!client) return;

    let active = true;
    fetchLessonProgress(client, user.id)
      .then((records) => {
        if (!active) return;
        const map: Record<string, LessonProgress> = {};
        for (const r of records) {
          map[r.lesson_slug] = r;
        }
        setProgressMap(map);
      })
      .catch(() => {
        // Fallback gracefully if offline or in tests
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const query = params.get("q") ?? "";
  const topicId = params.get("topic") ?? "all";
  const difficulty = parseDifficulty(params.get("difficulty"));
  const { matches, unknownTopic } = filterLessons({ query, topicId, difficulty });
  const filtered = query !== "" || topicId !== "all" || difficulty !== "all";
  const countLabel =
    matches.length === 1 ? "1 sample lesson" : `${matches.length} sample lessons`;

  function update(next: { query?: string; topicId?: string; difficulty?: Difficulty | "all" }) {
    const upcoming = {
      query: next.query ?? query,
      topicId: next.topicId ?? topicId,
      difficulty: next.difficulty ?? difficulty,
    };
    const search = new URLSearchParams();
    if (upcoming.query.trim() !== "") {
      search.set("q", upcoming.query);
    }
    if (upcoming.topicId !== "all") {
      search.set("topic", upcoming.topicId);
    }
    if (upcoming.difficulty !== "all") {
      search.set("difficulty", upcoming.difficulty);
    }
    setParams(search, { replace: true });
  }

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      {/* Header section with Topics link */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-action">
            Lesson Catalogue
          </span>
          <h1 className="mt-1 font-heading text-[2rem] font-semibold tracking-tight sm:text-5xl text-ink">
            Explore lessons
          </h1>
          <p className="mt-3 max-w-[62ch] text-lg leading-relaxed text-muted">
            Browse the sample catalogue. Search looks through titles, summaries, and lesson text.
          </p>
        </div>
        <Link
          to="/topics"
          className="button-secondary inline-flex self-start sm:self-auto items-center gap-1.5 text-xs font-semibold px-3.5 py-2 whitespace-nowrap"
        >
          View Topics Discovery Hub &rarr;
        </Link>
      </div>

      {/* Filter Form */}
      <form
        className="glass-panel mt-8 rounded-2xl p-5 sm:p-6"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="grid gap-5 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <label htmlFor="lesson-search" className="font-semibold text-ink">
              Search lessons
            </label>
            <input
              id="lesson-search"
              className="field mt-2"
              type="search"
              placeholder="Search by topic, keyword, or concept..."
              value={query}
              onChange={(event) => update({ query: event.target.value })}
            />
          </div>
          <div>
            <label htmlFor="topic-filter" className="font-semibold text-ink">
              Topic
            </label>
            <select
              id="topic-filter"
              className="field mt-2"
              value={topicId}
              onChange={(event) => update({ topicId: event.target.value })}
            >
              <option value="all">All topics</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="difficulty-filter" className="font-semibold text-ink">
              Difficulty
            </label>
            <select
              id="difficulty-filter"
              className="field mt-2"
              value={difficulty}
              onChange={(event) => update({ difficulty: parseDifficulty(event.target.value) })}
            >
              {difficulties.map((level) => (
                <option key={level} value={level}>
                  {level === "all" ? "All levels" : level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      {/* Status Label */}
      <p className="mt-6 font-semibold text-ink" role="status" aria-atomic="true">
        {unknownTopic ? "That topic is not in the sample catalogue." : countLabel}
      </p>

      {/* Empty State */}
      {matches.length === 0 ? (
        <div className="mt-6 max-w-[62ch] border border-ink/10 bg-surface rounded-2xl px-6 py-6 shadow-sm">
          <p className="text-lg leading-relaxed text-ink">
            No sample lessons match this search. Try cybersecurity, quantum computing, or post-quantum cryptography.
          </p>
          {filtered ? (
            <button
              type="button"
              className="button-secondary mt-4"
              onClick={() => setParams(new URLSearchParams(), { replace: true })}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {matches.map((lesson) => {
            const p = progressMap[lesson.slug];
            return (
              <LessonSummary
                key={lesson.slug}
                lesson={lesson}
                headingLevel="h2"
                isCompleted={Boolean(p?.completed)}
                isInProgress={Boolean(p && !p.completed)}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}

function parseDifficulty(value: string | null): Difficulty | "all" {
  if (value === "Foundational" || value === "Intermediate") {
    return value;
  }
  return "all";
}
