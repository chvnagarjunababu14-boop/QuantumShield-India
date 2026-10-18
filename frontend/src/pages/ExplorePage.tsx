import { useSearchParams } from "react-router-dom";
import { LessonSummary } from "../components/LessonSummary";
import { topics } from "../content/catalog";
import { filterLessons } from "../content/queries";
import type { Difficulty } from "../content/types";
import { usePageTitle } from "./usePageTitle";

const difficulties: Array<Difficulty | "all"> = ["all", "Foundational", "Intermediate"];

export function ExplorePage() {
  const [params, setParams] = useSearchParams();
  usePageTitle("Explore lessons");
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
      <h1 className="font-heading text-[2rem] font-semibold tracking-tight sm:text-5xl">Explore lessons</h1>
      <p className="mt-4 max-w-[62ch] text-lg leading-relaxed">
        Browse the sample catalogue. Search looks through titles, summaries, and lesson text.
      </p>

      <form className="glass-panel mt-8 rounded-2xl p-5 sm:p-6" role="search" onSubmit={(event) => event.preventDefault()}>
        <div className="grid gap-5 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <label htmlFor="lesson-search" className="font-semibold">
              Search lessons
            </label>
            <input
              id="lesson-search"
              className="field mt-2"
              type="search"
              value={query}
              onChange={(event) => update({ query: event.target.value })}
            />
          </div>
          <div>
            <label htmlFor="topic-filter" className="font-semibold">
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
            <label htmlFor="difficulty-filter" className="font-semibold">
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

      <p className="mt-6 font-semibold" role="status" aria-atomic="true">
        {unknownTopic ? "That topic is not in the sample catalogue." : countLabel}
      </p>

      {matches.length === 0 ? (
        <div className="mt-6 max-w-[62ch] border border-ink/10 bg-surface px-5 py-5">
          <p className="text-lg leading-relaxed">
            No sample lessons match this search. Try cybersecurity, quantum computing, or post-quantum cryptography.
          </p>
          {filtered ? (
            <button type="button" className="button-secondary mt-4" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-2">
          {matches.map((lesson) => (
            <LessonSummary key={lesson.slug} lesson={lesson} headingLevel="h2" />
          ))}
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
