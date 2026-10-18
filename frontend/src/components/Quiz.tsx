import { CheckCircle, FloppyDisk } from "@phosphor-icons/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getInsForgeClient } from "../api/insforge";
import { saveQuizResult } from "../api/learning";
import type { QuizQuestion } from "../content/types";
import { useAuth } from "../context/useAuth";

type QuizProps = {
  questions: QuizQuestion[];
  quizId?: string;
};

type Answers = Record<string, string>;

export function Quiz({ questions, quizId = "post-quantum-cryptography" }: QuizProps) {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const allAnswered = questions.every((question) => answers[question.id]);
  const incorrect = submitted
    ? questions.filter((question) => answers[question.id] !== question.correctChoiceId)
    : [];
  const score = questions.length - incorrect.length;

  const handleSaveResult = async () => {
    if (!user?.id) return;
    const client = getInsForgeClient();
    if (!client) {
      setSaveError("InsForge backend is not configured.");
      return;
    }

    setSavingResult(true);
    setSaveError(null);

    try {
      const saved = await saveQuizResult(client, {
        userId: user.id,
        quizId,
        score,
        totalScore: questions.length,
      });
      setSavedAt(new Date(saved.submitted_at).toLocaleTimeString());
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save quiz result.");
    } finally {
      setSavingResult(false);
    }
  };

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
          setSavedAt(null);
          setSaveError(null);
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

          {/* Result Persistence & Account Section */}
          <div className="mt-6 rounded-lg border border-ink/10 bg-surface p-4">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Score: {score} / {questions.length}
                    </p>
                    <p className="text-xs text-muted">
                      {savedAt
                        ? `Saved to your learning profile at ${savedAt}.`
                        : "Result not yet saved to your permanent learning profile."}
                    </p>
                  </div>
                  {!savedAt ? (
                    <button
                      type="button"
                      onClick={handleSaveResult}
                      disabled={savingResult}
                      className="inline-flex min-h-11 items-center gap-2 rounded-md bg-action px-3 py-1.5 text-xs font-semibold text-white hover:bg-action-pressed cursor-pointer disabled:opacity-60"
                    >
                      <FloppyDisk size={16} weight="regular" aria-hidden="true" />
                      {savingResult ? "Saving..." : "Save score"}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ok">
                      <CheckCircle size={16} weight="fill" aria-hidden="true" />
                      Saved
                    </span>
                  )}
                </div>
                {saveError && (
                  <p role="alert" className="text-xs text-danger font-medium">
                    {saveError}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted">
                <p>Sign in to save this score to your profile and track learning history.</p>
                <Link to="/auth?mode=signin" className="text-link font-semibold whitespace-nowrap">
                  Sign in to save →
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
