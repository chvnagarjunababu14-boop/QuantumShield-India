import { useState } from "react";
import type { QuizQuestion } from "../content/types";

type QuizProps = {
  questions: QuizQuestion[];
};

type Answers = Record<string, string>;

export function Quiz({ questions }: QuizProps) {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const allAnswered = questions.every((question) => answers[question.id]);
  const incorrect = submitted
    ? questions.filter((question) => answers[question.id] !== question.correctChoiceId)
    : [];

  return (
    <section aria-labelledby="sample-quiz-heading" className="mt-10 border-t border-ink/10 pt-8">
      <h2 id="sample-quiz-heading" className="font-heading text-2xl font-semibold">
        Sample quiz
      </h2>
      <p className="mt-2 max-w-[68ch] leading-relaxed text-muted">
        These questions check this sample lesson. The result stays in this browser tab and is not saved to an account.
      </p>
      <form
        className="mt-6 flex max-w-[68ch] flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        {questions.map((question) => (
          <fieldset key={question.id} className="border border-ink/10 bg-surface px-4 py-4">
            <legend className="px-1 font-semibold">{question.prompt}</legend>
            <div className="mt-3 flex flex-col gap-2">
              {question.choices.map((choice) => (
                <label key={choice.id} className="flex min-h-11 items-start gap-3 leading-relaxed">
                  <input
                    className="mt-1.5"
                    type="radio"
                    name={question.id}
                    value={choice.id}
                    checked={answers[question.id] === choice.id}
                    onChange={() => {
                      setAnswers((current) => ({ ...current, [question.id]: choice.id }));
                    }}
                  />
                  <span>{choice.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <button type="submit" className="button-primary w-fit" disabled={!allAnswered}>
          Check answers
        </button>
        {!allAnswered ? (
          <p className="text-sm text-muted">Choose an answer for each question to continue.</p>
        ) : null}
      </form>
      {submitted ? (
        <div
          className="mt-6 max-w-[68ch]"
          role={incorrect.length > 0 ? "alert" : "status"}
          aria-atomic="true"
        >
          <p className="font-semibold">
            {incorrect.length === 0
              ? `All ${questions.length} answers match this lesson.`
              : `${incorrect.length} of ${questions.length} answers need another look.`}
          </p>
          <ul className="mt-4 flex flex-col gap-4">
            {questions.map((question) => {
              const selected = answers[question.id];
              const correct = selected === question.correctChoiceId;
              return (
                <li key={question.id} className="border-l-2 border-action pl-4">
                  <p className="font-semibold">{correct ? "Matches the lesson" : "Does not match the lesson"}</p>
                  <p className="mt-1 leading-relaxed">{question.explanation}</p>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
