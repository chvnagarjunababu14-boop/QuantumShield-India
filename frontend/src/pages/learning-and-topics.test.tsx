import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../App";
import { LessonSummary } from "../components/LessonSummary";
import { lessons, topics } from "../content/catalog";
import { getLessonsForTopic } from "../content/queries";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("Separated Learning and Topics Navigation & Content", () => {
  it("resolves Learning (/explore) and Topics (/topics) to different routes with distinct headings and structures", () => {
    // 1. Learning Route
    const { unmount: unmountLearning } = renderAt("/explore");
    expect(
      screen.getByRole("heading", { name: "Explore lessons", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByLabelText("Search lessons")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View Topics Discovery Hub/i })).toHaveAttribute(
      "href",
      "/topics",
    );
    unmountLearning();

    // 2. Topics Route
    const { unmount: unmountTopics } = renderAt("/topics");
    expect(
      screen.getByRole("heading", { name: "Educational Topics", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Topics jump navigation" })).toBeInTheDocument();
    expect(screen.queryByRole("search")).not.toBeInTheDocument();
    unmountTopics();
  });

  it("redirects /learn alias to /explore", () => {
    renderAt("/learn");
    expect(
      screen.getByRole("heading", { name: "Explore lessons", level: 1 }),
    ).toBeInTheDocument();
  });

  it("header links navigate distinctly to /explore and /topics", () => {
    renderAt("/");
    const nav = screen.getByRole("navigation", { name: "Primary" });
    const learningLink = within(nav).getByRole("link", { name: "Learning" });
    const topicsLink = within(nav).getByRole("link", { name: "Topics" });

    expect(learningLink).toHaveAttribute("href", "/explore");
    expect(topicsLink).toHaveAttribute("href", "/topics");
  });

  it("renders distinct informative topic sections with illustrations, concepts, and dynamic counts", () => {
    renderAt("/topics");

    // Must have exactly 6 distinct topic sections
    expect(topics).toHaveLength(6);
    const expectedTopicIds = [
      "cybersecurity",
      "quantum-computing",
      "cryptography",
      "post-quantum-cryptography",
      "artificial-intelligence",
      "cloud-and-iot",
    ];

    for (const topicId of expectedTopicIds) {
      const topic = topics.find((t) => t.id === topicId);
      expect(topic).toBeDefined();

      const section = document.getElementById(topicId);
      expect(section).toBeInTheDocument();
      if (!section) continue;

      // Section title
      expect(
        within(section).getByRole("heading", { name: topic!.title, level: 2 }),
      ).toBeInTheDocument();

      // Meaningful description and key concepts
      expect(within(section).getByText(/What This Topic Covers/i)).toBeInTheDocument();
      expect(within(section).getByText(/Key Concepts & Learning Outcomes/i)).toBeInTheDocument();

      // Dynamic matching lesson count
      const matching = getLessonsForTopic(topicId);
      const expectedCountLabel =
        matching.length === 1 ? "1 matching lesson" : `${matching.length} matching lessons`;
      expect(within(section).getByText(expectedCountLabel)).toBeInTheDocument();

      // Explore action
      const exploreAction = within(section).getByRole("link", {
        name: new RegExp(`Explore topic \\(${matching.length}`, "i"),
      });
      expect(exploreAction).toHaveAttribute("href", `/explore?topic=${topicId}`);
    }
  });

  it("verifies accurate topic-to-lesson derivation and no duplicate cards or lessons", () => {
    renderAt("/topics");

    // Exactly 6 lesson records in catalogue source of truth
    expect(lessons).toHaveLength(6);
    const lessonSlugs = lessons.map((l) => l.slug);
    expect(new Set(lessonSlugs).size).toBe(6);

    // Exactly 6 topic sections rendered
    const topicSections = expectedSections();
    expect(topicSections).toHaveLength(6);

    // Cryptography and Quantum Threats groups both quantum-computing-and-cryptography and post-quantum-cryptography
    const cryptoLessons = getLessonsForTopic("cryptography");
    expect(cryptoLessons.map((l) => l.slug)).toEqual([
      "quantum-computing-and-cryptography",
      "post-quantum-cryptography",
    ]);

    // Cybersecurity has 1 lesson
    const cyberLessons = getLessonsForTopic("cybersecurity");
    expect(cyberLessons.map((l) => l.slug)).toEqual(["cybersecurity-fundamentals"]);

    // Post-quantum cryptography has 1 lesson
    const pqcLessons = getLessonsForTopic("post-quantum-cryptography");
    expect(pqcLessons.map((l) => l.slug)).toEqual(["post-quantum-cryptography"]);
  });

  it("action from Topics page navigates to correctly filtered catalogue", () => {
    // Direct load of topic filtered catalogue
    renderAt("/explore?topic=cryptography");

    expect(screen.getByRole("status")).toHaveTextContent("2 sample lessons");
    expect(
      screen.getByRole("heading", { name: "Why quantum computing matters to cryptography" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Post-quantum cryptography" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Cybersecurity fundamentals" }),
    ).not.toBeInTheDocument();
  });

  it("learning page contains working search, difficulty filter, lesson cards, and action buttons", async () => {
    const user = userEvent.setup();
    renderAt("/explore");

    // All 6 lessons initially visible
    expect(screen.getByRole("status")).toHaveTextContent("6 sample lessons");

    // Every lesson card has an action button
    const startLessonButtons = screen.getAllByRole("link", { name: /Start lesson/i });
    expect(startLessonButtons.length).toBe(6);

    // Search for "ML-KEM" (matches post-quantum cryptography)
    const searchInput = screen.getByLabelText("Search lessons");
    await user.type(searchInput, "ML-KEM");
    expect(screen.getByRole("status")).toHaveTextContent("1 sample lesson");
    expect(
      screen.getByRole("heading", { name: "Post-quantum cryptography" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Cybersecurity fundamentals" }),
    ).not.toBeInTheDocument();

    // Clear search
    await user.clear(searchInput);
    expect(screen.getByRole("status")).toHaveTextContent("6 sample lessons");

    // Filter by difficulty: Intermediate
    const difficultySelect = screen.getByLabelText("Difficulty");
    await user.selectOptions(difficultySelect, "Intermediate");
    expect(screen.getByRole("status")).toHaveTextContent("2 sample lessons");
    expect(
      screen.getByRole("heading", { name: "Why quantum computing matters to cryptography" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Post-quantum cryptography" }),
    ).toBeInTheDocument();
  });

  it("preserves individual lesson route and interactive features", () => {
    renderAt("/lessons/cybersecurity-fundamentals");
    expect(
      screen.getByRole("heading", { name: "Cybersecurity fundamentals", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/confidentiality, integrity, availability/i).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("heading", { name: "Three goals" })).toBeInTheDocument();
  });

  it("renders accurate completion indicators and continue action when lesson progress exists", () => {
    const lesson = lessons[0];
    const { rerender } = render(
      <MemoryRouter>
        <LessonSummary lesson={lesson} isCompleted={true} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Continue learning/i })).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <LessonSummary lesson={lesson} isInProgress={true} />
      </MemoryRouter>,
    );
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Continue learning/i })).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <LessonSummary lesson={lesson} />
      </MemoryRouter>,
    );
    expect(screen.queryByText("Completed")).not.toBeInTheDocument();
    expect(screen.queryByText("In Progress")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start lesson/i })).toBeInTheDocument();
  });
});

function expectedSections() {
  return [
    document.getElementById("cybersecurity"),
    document.getElementById("quantum-computing"),
    document.getElementById("cryptography"),
    document.getElementById("post-quantum-cryptography"),
    document.getElementById("artificial-intelligence"),
    document.getElementById("cloud-and-iot"),
  ].filter(Boolean);
}
