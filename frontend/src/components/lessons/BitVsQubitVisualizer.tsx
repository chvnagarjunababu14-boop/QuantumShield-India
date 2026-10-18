import { useState } from "react";
import { ArrowsCounterClockwise, Cpu, Lightning, Sparkle } from "@phosphor-icons/react";

export function BitVsQubitVisualizer() {
  const [thetaDegrees, setThetaDegrees] = useState<number>(90); // 90° = 50% |0⟩, 50% |1⟩
  const [classicalBit, setClassicalBit] = useState<0 | 1>(0);
  const [lastMeasurement, setLastMeasurement] = useState<0 | 1 | null>(null);
  const [trials, setTrials] = useState<{ zeros: number; ones: number }>({ zeros: 0, ones: 0 });
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);

  // Compute quantum amplitudes and probabilities
  const thetaRadians = (thetaDegrees * Math.PI) / 180;
  const alpha = Math.cos(thetaRadians / 2);
  const beta = Math.sin(thetaRadians / 2);
  const probZero = Math.round(alpha * alpha * 100);
  const probOne = 100 - probZero;

  const totalTrials = trials.zeros + trials.ones;

  const handleMeasure = () => {
    setIsMeasuring(true);
    setTimeout(() => {
      const outcome = Math.random() < (alpha * alpha) ? 0 : 1;
      setLastMeasurement(outcome);
      setTrials((prev) => ({
        zeros: outcome === 0 ? prev.zeros + 1 : prev.zeros,
        ones: outcome === 1 ? prev.ones + 1 : prev.ones,
      }));
      setIsMeasuring(false);
    }, 180);
  };

  const handleResetTrials = () => {
    setTrials({ zeros: 0, ones: 0 });
    setLastMeasurement(null);
  };

  return (
    <div id="interactive-lab" className="card-elevated my-10 rounded-2xl border border-ink/10 bg-white p-6 sm:p-7">
      <div className="flex items-center gap-2 border-b border-ink/8 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-action/10 px-3 py-1 text-xs font-semibold text-action">
          <Cpu size={16} weight="fill" />
          Quantum Physics & Measurement Lab
        </span>
        <span className="text-xs text-muted">Superposition & Collapse</span>
      </div>

      <div className="mt-4">
        <h3 className="font-heading text-xl font-semibold text-ink">
          Interactive Bit vs Qubit Simulator
        </h3>
        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted">
          Compare a deterministic classical bit with a quantum qubit. Adjust the superposition angle to see how measurement probabilities shift, then test measurement collapse.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Classical Bit Card */}
        <div className="rounded-xl border border-ink/10 bg-canvas-subtle p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Classical Bit</span>
            <span className="text-[11px] font-mono text-muted">Laptop / Phone Logic</span>
          </div>

          <div className="mt-4 flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-ink/8">
            <span className="font-mono text-6xl font-bold text-ink">{classicalBit}</span>
            <span className="mt-2 text-xs font-semibold text-muted">
              Definite value: {classicalBit === 0 ? "Off (0)" : "On (1)"}
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setClassicalBit(0)}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
                classicalBit === 0
                  ? "bg-action text-white shadow-xs"
                  : "bg-white text-ink hover:bg-slate-50 border border-ink/8"
              }`}
            >
              Set Bit to 0
            </button>
            <button
              type="button"
              onClick={() => setClassicalBit(1)}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
                classicalBit === 1
                  ? "bg-action text-white shadow-xs"
                  : "bg-white text-ink hover:bg-slate-50 border border-ink/8"
              }`}
            >
              Set Bit to 1
            </button>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted">
            A classical bit is always definitely 0 or 1. Reading it returns the stored value without changing the system.
          </p>
        </div>

        {/* Qubit Card */}
        <div className="rounded-xl border border-action/30 bg-action/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-action">Quantum Qubit</span>
            <span className="text-[11px] font-mono text-action font-semibold">
              |ψ⟩ = {alpha.toFixed(2)}|0⟩ + {beta.toFixed(2)}|1⟩
            </span>
          </div>

          {/* Bloch Circle Vector Visualization */}
          <div className="mt-4 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-ink/8">
            <svg viewBox="0 0 200 120" className="w-full max-w-[180px] h-auto" aria-hidden="true">
              {/* Semicircle track */}
              <path d="M 30 100 A 70 70 0 0 1 170 100" fill="none" stroke="#E2E8F0" strokeWidth="3" />
              {/* Origin node */}
              <circle cx="100" cy="100" r="4" fill="#0B1F3A" />
              {/* State vector pointer */}
              {(() => {
                const angleRad = (180 - thetaDegrees) * (Math.PI / 180);
                const x = 100 + 70 * Math.cos(angleRad);
                const y = 100 - 70 * Math.sin(angleRad);
                return (
                  <>
                    <line x1="100" y1="100" x2={x} y2={y} stroke="#155EEF" strokeWidth="2.5" />
                    <circle cx={x} cy={y} r="5" fill="#155EEF" />
                  </>
                );
              })()}
              <text x="25" y="115" fontSize="11" fontFamily="Lexend, sans-serif" fill="#0B1F3A">|0⟩</text>
              <text x="165" y="115" fontSize="11" fontFamily="Lexend, sans-serif" fill="#0B1F3A">|1⟩</text>
            </svg>

            {/* Probability Amplitudes */}
            <div className="mt-2 w-full space-y-1.5 text-xs">
              <div className="flex justify-between font-mono">
                <span>P(|0⟩): {probZero}%</span>
                <span>P(|1⟩): {probOne}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 flex">
                <div style={{ width: `${probZero}%` }} className="bg-action transition-all duration-150" />
                <div style={{ width: `${probOne}%` }} className="bg-emerald-500 transition-all duration-150" />
              </div>
            </div>
          </div>

          {/* Angle Slider */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted mb-1">
              <span>Superposition Angle (θ):</span>
              <span className="font-mono font-semibold text-action">{thetaDegrees}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="5"
              value={thetaDegrees}
              onChange={(e) => setThetaDegrees(Number(e.target.value))}
              className="w-full cursor-pointer accent-action"
              aria-label="Superposition Angle slider"
            />
          </div>
        </div>
      </div>

      {/* Interactive Measurement Experiment */}
      <div className="mt-6 rounded-xl border border-ink/8 bg-canvas-subtle p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
              <Lightning size={16} weight="bold" className="text-amber-500" />
              <span>Experiment: Measure the Qubit</span>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Trigger a physical measurement to see probability amplitudes collapse into a single classical bit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMeasure}
              disabled={isMeasuring}
              className="button-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Sparkle size={14} weight="fill" />
              {isMeasuring ? "Measuring..." : "Measure Qubit"}
            </button>

            {totalTrials > 0 && (
              <button
                type="button"
                onClick={handleResetTrials}
                className="inline-flex items-center gap-1 rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-semibold text-muted hover:text-ink cursor-pointer"
                title="Reset measurements"
              >
                <ArrowsCounterClockwise size={14} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Measurement Result Display */}
        {lastMeasurement !== null && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-action/20 bg-white p-3.5" role="status" aria-live="polite">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-action text-white font-mono text-xl font-bold">
                {lastMeasurement}
              </span>
              <div>
                <p className="text-xs font-semibold text-ink">
                  Measurement Result: Collapsed to |{lastMeasurement}⟩
                </p>
                <p className="text-[11px] text-muted">
                  The pre-measurement amplitudes are gone; the device now reports a single classical outcome.
                </p>
              </div>
            </div>

            <div className="text-xs font-mono text-muted text-right">
              <span>Empirical Stats ({totalTrials} trials): </span>
              <span className="text-action font-bold">0s: {trials.zeros}</span>
              {" | "}
              <span className="text-emerald-600 font-bold">1s: {trials.ones}</span>
            </div>
          </div>
        )}
      </div>

      {/* Conceptual Clarity Banner */}
      <div className="mt-4 rounded-xl border border-amber-200/60 bg-amber-50/40 p-3.5 text-xs text-slate-800 leading-relaxed">
        <span className="font-semibold text-amber-900">Crucial Concept: </span>
        Superposition does <strong>not</strong> mean the qubit holds two readable numbers simultaneously. You cannot extract two answers at once. Quantum algorithms succeed by orchestrating interference before measurement, so that the correct answer is measured with high probability.
      </div>
    </div>
  );
}
