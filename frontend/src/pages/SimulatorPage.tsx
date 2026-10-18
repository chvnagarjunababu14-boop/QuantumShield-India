import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Cpu,
  Info,
  ShieldCheck,
  ShieldWarning,
  Sliders,
  Sparkle,
  Warning,
  WarningOctagon,
} from "@phosphor-icons/react";
import { usePageTitle } from "./usePageTitle";

type Scenario = "key-exchange" | "signatures" | "symmetric";
type AdversaryMode = "classical" | "quantum";

interface ScenarioData {
  id: Scenario;
  title: string;
  shortTitle: string;
  categoryBadge: string;
  classicalName: string;
  classicalMath: string;
  classicalKeySize: string;
  classicalStatus: "vulnerable" | "moderate";
  classicalImpactClassical: string;
  classicalImpactQuantum: string;
  pqcName: string;
  pqcStandard: string;
  pqcMath: string;
  pqcKeySize: string;
  pqcStatus: "resistant";
  pqcDefense: string;
  hndlRelevance: string;
  relevantLessonSlug: string;
  relevantLessonTitle: string;
}

const SCENARIOS: Record<Scenario, ScenarioData> = {
  "key-exchange": {
    id: "key-exchange",
    title: "Key Establishment & Public-Key Encryption",
    shortTitle: "Key Exchange (ML-KEM)",
    categoryBadge: "Asymmetric Encryption",
    classicalName: "RSA-2048 / ECDH P-256",
    classicalMath: "Integer Factorization & Elliptic Curve Discrete Logarithms",
    classicalKeySize: "2048-bit (RSA) / 256-bit (ECDH)",
    classicalStatus: "vulnerable",
    classicalImpactClassical:
      "Computationally secure against classical supercomputers using general number field sieve (GNFS) factoring algorithms.",
    classicalImpactQuantum:
      "Vulnerable to Shor's algorithm on a sufficiently large fault-tolerant quantum computer. High risk of retroactive decryption for long-lived sensitive data.",
    pqcName: "ML-KEM (Module-Lattice Key Encapsulation)",
    pqcStandard: "NIST FIPS 203 (derived from CRYSTALS-Kyber)",
    pqcMath: "Module Learning with Errors (M-LWE) lattice hardness",
    pqcKeySize: "ML-KEM-768 (1184-byte public key, 1088-byte ciphertext)",
    pqcStatus: "resistant",
    pqcDefense:
      "Resistant to both classical and quantum cryptanalysis. Ensures forward confidentiality even against adversaries storing traffic for future decryption.",
    hndlRelevance:
      "Directly threatened by 'Harvest Now, Decrypt Later'. If encrypted confidential data is recorded today, it can be decrypted once quantum hardware arrives.",
    relevantLessonSlug: "post-quantum-cryptography",
    relevantLessonTitle: "Post-quantum cryptography (NIST Standards)",
  },
  signatures: {
    id: "signatures",
    title: "Digital Signatures & Authentication",
    shortTitle: "Signatures (ML-DSA)",
    categoryBadge: "Authentication & Identity",
    classicalName: "RSA-3072 / ECDSA P-256",
    classicalMath: "RSA Factoring & Discrete Logarithms over Elliptic Curves",
    classicalKeySize: "3072-bit (RSA) / 256-bit (ECDSA)",
    classicalStatus: "vulnerable",
    classicalImpactClassical:
      "Current standard for TLS certificates, code signing, and digital identities; secure against classical cryptanalytic methods.",
    classicalImpactQuantum:
      "A quantum computer running Shor's algorithm could forge valid digital signatures, breaking Certificate Authorities and software updates.",
    pqcName: "ML-DSA & SLH-DSA",
    pqcStandard: "NIST FIPS 204 (Dilithium) & FIPS 205 (SPHINCS+)",
    pqcMath: "Module-Lattice and Stateless Hash-Based Signatures",
    pqcKeySize: "ML-DSA-65 (1952-byte public key, 3309-byte signature)",
    pqcStatus: "resistant",
    pqcDefense:
      "Guarantees cryptographic authenticity and non-repudiation without relying on discrete logarithm or factoring problems.",
    hndlRelevance:
      "Digital signatures verify identity in real time. Historical signatures verified in the past cannot be forged retroactively unless private keys are captured.",
    relevantLessonSlug: "post-quantum-cryptography",
    relevantLessonTitle: "Post-quantum cryptography (NIST Standards)",
  },
  symmetric: {
    id: "symmetric",
    title: "Symmetric Bulk Encryption & Ciphers",
    shortTitle: "Symmetric (AES-256)",
    categoryBadge: "Bulk Cipher",
    classicalName: "AES-128",
    classicalMath: "Substitution-Permutation Network (128-bit key space)",
    classicalKeySize: "128-bit key",
    classicalStatus: "moderate",
    classicalImpactClassical:
      "Practically unbreakable by classical brute force (requires 2^128 trial encryptions).",
    classicalImpactQuantum:
      "Grover's algorithm provides a quadratic speedup (O(sqrt(N))), reducing effective security to ~64 bits—marginal against well-funded adversaries.",
    pqcName: "AES-256",
    pqcStandard: "NIST FIPS 197 / SP 800-38A",
    pqcMath: "Substitution-Permutation Network (256-bit key space)",
    pqcKeySize: "256-bit key",
    pqcStatus: "resistant",
    pqcDefense:
      "Under Grover's algorithm, AES-256 retains ~128 bits of quantum security, remaining mathematically infeasible to brute force. No new math required.",
    hndlRelevance:
      "Upgrading to AES-256 is an immediate operational best practice that requires no new mathematical standards, only larger key sizes.",
    relevantLessonSlug: "quantum-computing-and-cryptography",
    relevantLessonTitle: "Why quantum computing matters to cryptography",
  },
};

export function SimulatorPage() {
  usePageTitle("Quantum Cryptography Simulator — QuantumShield India");

  const [selectedScenario, setSelectedScenario] = useState<Scenario>("key-exchange");
  const [adversaryMode, setAdversaryMode] = useState<AdversaryMode>("quantum");
  const [retentionYears, setRetentionYears] = useState<number>(25);

  const scenario = SCENARIOS[selectedScenario];
  const currentYear = 2026;
  const expirationYear = currentYear + retentionYears;

  // Compute exposure risk assessment
  const isHighExposure =
    selectedScenario !== "symmetric" &&
    adversaryMode === "quantum" &&
    retentionYears >= 15;

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      {/* Page Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-action/20 bg-action/5 px-3 py-1 text-xs font-semibold text-action">
          <Cpu size={14} weight="bold" />
          <span>Interactive Cryptography Laboratory</span>
        </div>

        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">
          Quantum Cryptography Simulator
        </h1>

        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          Explore how classical cryptographic primitives respond to quantum algorithms (Shor&apos;s and Grover&apos;s) compared to standardized NIST post-quantum algorithms. Adjust parameters below to evaluate exposure windows and resilience.
        </p>
      </div>

      {/* Educational Notice Banner */}
      <div className="mt-8 rounded-2xl border border-amber-500/25 bg-amber-500/8 p-5 sm:p-6 text-amber-900">
        <div className="flex items-start gap-3">
          <Info size={22} weight="bold" className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900">
              Educational Framing & Scope Notice
            </h2>
            <p className="mt-1 text-xs sm:text-sm leading-relaxed text-amber-950/90">
              This simulator is an educational modeling environment designed to explain mathematical vulnerabilities, key size differences, and retroactive exposure timelines. It does not perform live attacks against live systems, factor real cryptographic keys, or predict specific dates for fault-tolerant quantum computer availability.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="mt-10 rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-2 border-b border-ink/8 pb-4">
          <Sliders size={20} weight="bold" className="text-action" />
          <h2 className="font-heading text-lg font-semibold text-ink">
            Laboratory Experiment Controls
          </h2>
        </div>

        {/* 1. Scenario Tabs */}
        <div className="mt-6">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">
            1. Select Cryptographic Primitive & Scenario:
          </label>
          <div
            className="mt-2.5 grid gap-2.5 sm:grid-cols-3"
            role="tablist"
            aria-label="Cryptographic primitive scenarios"
          >
            {(Object.keys(SCENARIOS) as Scenario[]).map((key) => {
              const item = SCENARIOS[key];
              const isSelected = selectedScenario === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedScenario(key)}
                  className={`flex flex-col text-left rounded-2xl p-4 transition-all cursor-pointer border ${
                    isSelected
                      ? "border-action bg-action/5 shadow-sm ring-1 ring-action"
                      : "border-ink/10 bg-canvas-subtle hover:bg-white hover:border-ink/20"
                  }`}
                >
                  <span className="text-[11px] font-mono font-bold uppercase text-action">
                    {item.categoryBadge}
                  </span>
                  <span className="mt-1 font-heading text-sm font-semibold text-ink">
                    {item.shortTitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Interactive Parameters Grid: Adversary Model + Retention Slider */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 pt-6 border-t border-ink/8">
          {/* Adversary Model Switcher */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted">
              2. Threat Environment & Adversary Capability:
            </label>
            <div className="mt-2.5 flex rounded-xl border border-ink/10 bg-canvas p-1">
              <button
                type="button"
                onClick={() => setAdversaryMode("classical")}
                className={`flex-1 rounded-lg py-2 px-3 text-xs font-semibold transition-all cursor-pointer ${
                  adversaryMode === "classical"
                    ? "bg-white text-ink shadow-xs"
                    : "text-muted hover:text-ink"
                }`}
              >
                Classical Attacker
              </button>
              <button
                type="button"
                onClick={() => setAdversaryMode("quantum")}
                className={`flex-1 rounded-lg py-2 px-3 text-xs font-semibold transition-all cursor-pointer ${
                  adversaryMode === "quantum"
                    ? "bg-action text-white shadow-xs"
                    : "text-muted hover:text-ink"
                }`}
              >
                Quantum Adversary (Shor / Grover)
              </button>
            </div>
            <p className="mt-2 text-xs text-muted">
              {adversaryMode === "classical"
                ? "Simulates adversaries constrained to classical polynomial-time algorithms."
                : "Simulates an adversary equipped with a sufficiently large fault-tolerant quantum computer."}
            </p>
          </div>

          {/* Retention Horizon Slider */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="retention-slider" className="text-xs font-bold uppercase tracking-wider text-muted">
                3. Data Confidentiality Horizon:
              </label>
              <span className="font-mono text-xs font-bold text-action">
                {retentionYears} Years (Expires in {expirationYear})
              </span>
            </div>
            <input
              id="retention-slider"
              type="range"
              min={5}
              max={50}
              step={5}
              value={retentionYears}
              onChange={(e) => setRetentionYears(Number(e.target.value))}
              className="mt-3 w-full cursor-pointer accent-action"
            />
            <div className="mt-1 flex justify-between text-[11px] font-mono text-muted">
              <span>5y (Ephemeral)</span>
              <span>25y (Enterprise)</span>
              <span>50y (Sovereign/Health)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid: Classical vs Post-Quantum Standard */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Panel A: Classical Scheme */}
        <section
          aria-labelledby="classical-scheme-heading"
          className="rounded-3xl border border-red-200/90 bg-red-50/40 p-6 sm:p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-red-200/60">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                Current / Classical Standard
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  adversaryMode === "quantum"
                    ? scenario.classicalStatus === "vulnerable"
                      ? "bg-red-200 text-red-900 border border-red-300"
                      : "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                }`}
              >
                {adversaryMode === "quantum" ? (
                  scenario.classicalStatus === "vulnerable" ? (
                    <>
                      <WarningOctagon size={14} weight="bold" />
                      Quantum Vulnerable
                    </>
                  ) : (
                    <>
                      <ShieldWarning size={14} weight="bold" />
                      Reduced Security
                    </>
                  )
                ) : (
                  <>
                    <ShieldCheck size={14} weight="bold" />
                    Classical Secure
                  </>
                )}
              </span>
            </div>

            <h3 id="classical-scheme-heading" className="mt-4 font-heading text-2xl font-semibold text-ink">
              {scenario.classicalName}
            </h3>

            {/* Spec details */}
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <p className="font-semibold text-muted">Mathematical Basis:</p>
                <p className="mt-1 font-mono text-[11px] rounded-lg bg-white/80 p-2 border border-red-200/60 text-slate-800">
                  {scenario.classicalMath}
                </p>
              </div>
              <div>
                <p className="font-semibold text-muted">Standard Key Size:</p>
                <p className="mt-1 font-mono text-[11px] rounded-lg bg-white/80 p-2 border border-red-200/60 text-slate-800">
                  {scenario.classicalKeySize}
                </p>
              </div>
            </div>

            {/* Impact assessment */}
            <div className="mt-6 rounded-2xl border border-red-200/80 bg-white/90 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-red-800">
                Simulated Impact under {adversaryMode === "quantum" ? "Quantum Adversary" : "Classical Attacker"}:
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-800">
                {adversaryMode === "quantum"
                  ? scenario.classicalImpactQuantum
                  : scenario.classicalImpactClassical}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-red-200/60 flex items-center justify-between text-xs text-red-900">
            <span>Primitive: {scenario.categoryBadge}</span>
            <span className="font-mono">Threat: Shor&apos;s Algorithm</span>
          </div>
        </section>

        {/* Panel B: Post-Quantum Standard */}
        <section
          aria-labelledby="pqc-scheme-heading"
          className="rounded-3xl border border-emerald-200/90 bg-emerald-50/40 p-6 sm:p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-emerald-200/60">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                NIST Post-Quantum Standard
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-900">
                <CheckCircle size={14} weight="bold" />
                Quantum Resilient
              </span>
            </div>

            <h3 id="pqc-scheme-heading" className="mt-4 font-heading text-2xl font-semibold text-ink">
              {scenario.pqcName}
            </h3>

            {/* Spec details */}
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <p className="font-semibold text-muted">Specification / Standard:</p>
                <p className="mt-1 font-mono text-[11px] rounded-lg bg-white/80 p-2 border border-emerald-200/60 text-emerald-900 font-bold">
                  {scenario.pqcStandard}
                </p>
              </div>
              <div>
                <p className="font-semibold text-muted">Hardness Assumption & Math:</p>
                <p className="mt-1 font-mono text-[11px] rounded-lg bg-white/80 p-2 border border-emerald-200/60 text-slate-800">
                  {scenario.pqcMath}
                </p>
              </div>
              <div>
                <p className="font-semibold text-muted">Public Key / Parameter Size:</p>
                <p className="mt-1 font-mono text-[11px] rounded-lg bg-white/80 p-2 border border-emerald-200/60 text-slate-800">
                  {scenario.pqcKeySize}
                </p>
              </div>
            </div>

            {/* Defensive advantage */}
            <div className="mt-6 rounded-2xl border border-emerald-200/80 bg-white/90 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Post-Quantum Cryptographic Advantage:
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-800">
                {scenario.pqcDefense}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-900">
            <span>NIST Project: 2024 Standards</span>
            <span className="font-mono">Resistance: Classical + Quantum</span>
          </div>
        </section>
      </div>

      {/* Harvest Now, Decrypt Later (HNDL) Dynamic Timeline */}
      <section
        aria-labelledby="hndl-analysis-heading"
        className="mt-10 rounded-3xl border border-ink/10 bg-white p-6 sm:p-8 lg:p-10 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/8 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Warning size={20} weight="bold" className="text-action" />
              <h2 id="hndl-analysis-heading" className="font-heading text-xl sm:text-2xl font-semibold text-ink">
                Harvest Now, Decrypt Later (HNDL) Timeline Analysis
              </h2>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-muted">
              {scenario.hndlRelevance}
            </p>
          </div>

          {/* Dynamic exposure status */}
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold ${
              isHighExposure
                ? "bg-red-100 text-red-900 border border-red-300"
                : "bg-emerald-100 text-emerald-900 border border-emerald-300"
            }`}
          >
            {isHighExposure ? (
              <>
                <WarningOctagon size={14} weight="bold" />
                Critical Exposure Window
              </>
            ) : (
              <>
                <CheckCircle size={14} weight="bold" />
                Controlled Exposure Window
              </>
            )}
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-ink/10 bg-canvas-subtle p-5">
            <span className="font-mono text-xs font-bold text-action">STAGE 01</span>
            <h3 className="mt-1 font-heading text-base font-semibold text-ink">
              Interception: {currentYear}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Adversaries passively intercept and store encrypted ciphertext off backbone communication lines.
            </p>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-canvas-subtle p-5">
            <span className="font-mono text-xs font-bold text-action">STAGE 02</span>
            <h3 className="mt-1 font-heading text-base font-semibold text-ink">
              Retention: {currentYear} – {expirationYear} ({retentionYears} Years)
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Sensitive data (intellectual property, healthcare records, identity credentials) retains its commercial and national security value.
            </p>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-canvas-subtle p-5">
            <span className="font-mono text-xs font-bold text-action">STAGE 03</span>
            <h3 className="mt-1 font-heading text-base font-semibold text-ink">
              Quantum Decryption Window
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              If protected solely by classical public-key schemes, the secret is broken retroactively once fault-tolerant hardware exists.
            </p>
          </div>
        </div>

        {/* Dynamic Result Summary Callout */}
        <div className="mt-6 rounded-2xl border border-action/20 bg-action/5 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Sparkle size={18} weight="fill" className="text-action" />
            <h4 className="font-heading text-sm font-semibold text-ink">
              Simulation Takeaway & Migration Recommendation:
            </h4>
          </div>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-800">
            For data requiring a {retentionYears}-year confidentiality window (active until {expirationYear}), relying on {scenario.classicalName} presents a tangible retroactive risk. Organizations must implement hybrid key exchange using {scenario.pqcName} ({scenario.pqcStandard}) to guarantee post-quantum resilience today.
          </p>
        </div>
      </section>

      {/* Relevant Lessons & Curriculum Links */}
      <section
        aria-labelledby="curriculum-links-heading"
        className="mt-12 rounded-3xl border border-ink/10 bg-white p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 id="curriculum-links-heading" className="font-heading text-xl font-semibold text-ink">
              Deepen your theoretical knowledge
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted">
              Connect simulator experiments to structured lessons and post-quantum migration engineering.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/lessons/${scenario.relevantLessonSlug}`}
              className="button-primary inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold"
            >
              <BookOpen size={16} />
              Read {scenario.relevantLessonTitle}
              <ArrowRight size={14} weight="bold" />
            </Link>

            <Link
              to="/topics"
              className="button-secondary inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold"
            >
              Explore All Topics &rarr;
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
