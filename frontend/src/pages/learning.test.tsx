import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../App";
import { getLesson } from "../content/queries";
import type { QuizQuestion } from "../content/types";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function quizQuestions(): QuizQuestion[] {
  const lesson = getLesson("post-quantum-cryptography");
  const quiz = lesson?.blocks.find((block) => block.type === "quiz");
  if (!quiz || quiz.type !== "quiz") {
    throw new Error("Sample quiz is missing");
  }
  return quiz.questions;
}

describe("learning pages", () => {
  it("filters the catalogue and recovers from an empty search", async () => {
    const user = userEvent.setup();
    renderAt("/explore");

    expect(screen.getByRole("heading", { name: "Explore lessons" })).toBeInTheDocument();
    await user.type(screen.getByLabelText("Search lessons"), "zzzz-not-a-lesson");
    expect(screen.getByRole("status")).toHaveTextContent("0 sample lessons");
    expect(screen.getByText(/try cybersecurity, quantum computing/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByRole("status")).toHaveTextContent("6 sample lessons");
  });

  it("opens a topic from the query string", () => {
    renderAt("/explore?topic=artificial-intelligence");
    expect(screen.getByRole("heading", { name: "Artificial intelligence and machine learning" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Cybersecurity fundamentals" })).not.toBeInTheDocument();
  });

  it("reads a lesson, moves to the next one, and explains quiz answers", async () => {
    const user = userEvent.setup();
    renderAt("/lessons/post-quantum-cryptography");

    expect(screen.getByRole("heading", { name: "Post-quantum cryptography" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Standards published by NIST" })).toHaveAttribute(
      "href",
      "#nist-standards",
    );
    expect(screen.queryByText(/educational concept · not a live tool/i)).not.toBeInTheDocument();

    const questions = quizQuestions();
    for (const question of questions) {
      const correct = question.choices.find((choice) => choice.id === question.correctChoiceId);
      if (!correct) {
        throw new Error("Correct choice is missing");
      }
      await user.click(screen.getByRole("radio", { name: correct.label }));
    }
    await user.click(screen.getByRole("button", { name: "Check answers" }));
    expect(screen.getByRole("status")).toHaveTextContent("All 3 answers match this lesson.");

    await user.click(screen.getByRole("link", { name: /Previous: Why quantum computing matters/i }));
    expect(
      screen.getByRole("heading", { name: "Why quantum computing matters to cryptography" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Quantum-threat simulator" })).toBeInTheDocument();
    expect(screen.getByText(/will not attempt to break real encryption/i)).toBeInTheDocument();
  });

  it("explains a wrong quiz answer", async () => {
    const user = userEvent.setup();
    renderAt("/lessons/post-quantum-cryptography");
    const questions = quizQuestions();

    for (const question of questions) {
      const wrong = question.choices.find((choice) => choice.id !== question.correctChoiceId);
      if (!wrong) {
        throw new Error("Wrong choice is missing");
      }
      await user.click(screen.getByRole("radio", { name: wrong.label }));
    }
    await user.click(screen.getByRole("button", { name: "Check answers" }));
    expect(screen.getByRole("alert")).toHaveTextContent("3 of 3 answers need another look.");
    expect(screen.getByText(/FIPS 203 specifies ML-KEM/i)).toBeInTheDocument();
  });

  it("renders the community forum with technology topic rooms", async () => {
    renderAt("/community");
    expect(
      await screen.findByRole("heading", { name: /Collaborative Engineering Forum/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All Topics" })).toBeInTheDocument();
  });

  it("opens the menu and offers the primary links", async () => {
    const user = userEvent.setup();
    renderAt("/");
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.getByRole("link", { name: "Community" })).toBeInTheDocument();
  });
});
