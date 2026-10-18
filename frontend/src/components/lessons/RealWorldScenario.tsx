import { useState } from "react";
import { CheckCircle, Lightbulb, WarningCircle } from "@phosphor-icons/react";

export type ScenarioOption = {
  id: string;
  label: string;
  isBestDecision: boolean;
  explanation: string;
};

export type ScenarioData = {
  id: string;
  title: string;
  situation: string;
  question: string;
  options: ScenarioOption[];
  takeaway: string;
};

type RealWorldScenarioProps = {
  scenario: ScenarioData;
};

export function RealWorldScenario({ scenario }: RealWorldScenarioProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const selectedOption = scenario.options.find((opt) => opt.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setShowExplanation(true);
  };

  const handleReset = () => {
    setSelectedId(null);
    setShowExplanation(false);
  };

  return (
    <section
      id="scenario"
      aria-labelledby={`scenario-${scenario.id}-heading`}
      className="card-elevated my-10 overflow-hidden rounded-2xl border border-ink/10 bg-white p-6 sm:p-7"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-action/10 px-3 py-1 text-xs font-semibold text-action">
          <Lightbulb size={16} weight="fill" />
          Real-World Scenario
        </span>
        <span className="text-xs text-muted">Applied Decision Lab</span>
      </div>

      <h3 id={`scenario-${scenario.id}-heading`} className="mt-3 font-heading text-xl font-semibold text-ink">
        {scenario.title}
      </h3>

      <div className="mt-3 rounded-xl border border-ink/8 bg-canvas-subtle p-4 text-sm leading-relaxed text-slate-800">
        <p className="font-semibold text-ink/80 text-xs uppercase tracking-wider mb-1">The Situation:</p>
        <p>{scenario.situation}</p>
      </div>

      <p className="mt-4 text-sm font-semibold text-ink">
        {scenario.question}
      </p>

      {/* Option Buttons */}
      <div className="mt-3 grid gap-2.5" role="group" aria-label="Scenario options">
        {scenario.options.map((option) => {
          const isSelected = selectedId === option.id;
          let buttonStyle = "border-ink/10 bg-white hover:bg-canvas-subtle text-ink";

          if (showExplanation && isSelected) {
            buttonStyle = option.isBestDecision
              ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-1 ring-emerald-500"
              : "border-amber-500 bg-amber-50/50 text-amber-950 ring-1 ring-amber-500";
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-all cursor-pointer ${buttonStyle}`}
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink/20 text-xs font-bold">
                {isSelected ? (
                  option.isBestDecision ? (
                    <CheckCircle size={16} weight="fill" className="text-emerald-600" />
                  ) : (
                    <WarningCircle size={16} weight="fill" className="text-amber-600" />
                  )
                ) : (
                  option.id.toUpperCase()
                )}
              </span>
              <span className="leading-snug">{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Instant Pedagogical Feedback */}
      {showExplanation && selectedOption && (
        <div
          className={`mt-5 rounded-xl border p-4.5 text-sm transition-all ${
            selectedOption.isBestDecision
              ? "border-emerald-200 bg-emerald-50/60 text-emerald-950"
              : "border-amber-200 bg-amber-50/60 text-amber-950"
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 font-semibold">
            {selectedOption.isBestDecision ? (
              <>
                <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0" />
                <span>Effective Security Decision</span>
              </>
            ) : (
              <>
                <WarningCircle size={18} weight="fill" className="text-amber-600 shrink-0" />
                <span>Needs Consideration</span>
              </>
            )}
          </div>

          <p className="mt-2 text-xs leading-relaxed sm:text-sm">
            {selectedOption.explanation}
          </p>

          <div className="mt-3 border-t border-ink/8 pt-2.5 text-xs text-muted">
            <span className="font-semibold text-ink">Core Security Insight: </span>
            {scenario.takeaway}
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="mt-3 text-xs font-semibold text-action hover:underline cursor-pointer"
          >
            Try another choice
          </button>
        </div>
      )}
    </section>
  );
}
