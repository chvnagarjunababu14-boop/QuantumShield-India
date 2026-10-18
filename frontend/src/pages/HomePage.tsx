import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  ArrowSquareOut,
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Compass,
  Cpu,
  FileText,
  GraduationCap,
  Info,
  Key,
  Lightning,
  LockSimple,
  ShieldCheck,
  Sparkle,
  UsersThree,
} from "@phosphor-icons/react";
import { QuantumShieldHeroVisual } from "../components/QuantumShieldHeroVisual";
import { QuantumSimulatorPreview } from "../components/QuantumSimulatorPreview";
import { learningPaths } from "../content/catalog";
import { getLesson } from "../content/queries";
import { usePageTitle } from "./usePageTitle";

export function HomePage() {
  usePageTitle("QuantumShield India — Prepare for a World Beyond Today's Encryption");
  const location = useLocation();

  // Scroll to anchor on load or hash change
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.hash]);

  return (
    <main id="main" className="overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section
        className="relative border-b border-ink/8 bg-gradient-to-b from-white via-canvas to-white py-12 sm:py-20 lg:py-24"
        aria-labelledby="hero-heading"
      >
        {/* Subtle decorative background grids */}
        <div
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#0b1f3a05_1px,transparent_1px),linear-gradient(to_bottom,#0b1f3a05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"
          aria-hidden="true"
        />

        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            {/* Hero Copy */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-action/20 bg-action/5 px-3.5 py-1.5 text-xs font-semibold text-action">
                <Sparkle size={14} weight="fill" className="text-action" />
                <span>Open Post-Quantum Cybersecurity Education</span>
              </div>

              <h1
                id="hero-heading"
                className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-ink leading-[1.15] text-balance"
              >
                Prepare for a world beyond today’s encryption.
              </h1>

              <p className="max-w-[54ch] text-lg sm:text-xl leading-relaxed text-muted">
                Understand quantum computing, cybersecurity and post-quantum cryptography
                through practical lessons, interactive experiments and accessible explanations.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/explore"
                  className="button-primary inline-flex items-center gap-2 px-6 py-3 text-base shadow-sm hover:shadow"
                >
                  <Compass size={18} weight="bold" />
                  Explore Learning
                </Link>

                <Link
                  to="/simulator"
                  className="button-secondary inline-flex items-center gap-2 px-6 py-3 text-base"
                >
                  <Cpu size={18} weight="bold" className="text-action" />
                  Try the Quantum Simulator
                </Link>
              </div>

              {/* Restrained Credibility Statement */}
              <div className="pt-4 border-t border-ink/8">
                <p className="text-xs leading-relaxed text-muted max-w-[54ch]">
                  QuantumShield India helps learners, developers, and organizations understand
                  emerging cryptographic risks, NIST post-quantum standards, and practical defensive architectures.
                </p>

                {/* Key Pillars */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-ink/80">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={16} weight="fill" className="text-emerald-600" />
                    <span>Free & Open Access</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={16} weight="fill" className="text-emerald-600" />
                    <span>NIST FIPS 203 / 204 Standards</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={16} weight="fill" className="text-emerald-600" />
                    <span>Self-Paced Conceptual Modules</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Visual */}
            <div className="relative">
              <QuantumShieldHeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION: WHY LEARN QUANTUM TECHNOLOGY NOW?
      ───────────────────────────────────────────────────────────── */}
      <section
        id="why-now"
        className="border-b border-ink/8 bg-white py-16 sm:py-24"
        aria-labelledby="why-now-heading"
      >
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-wider text-action">
              The Quantum Inflection Point
            </p>
            <h2
              id="why-now-heading"
              className="mt-2 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-ink"
            >
              Why learn quantum technology now?
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted">
              Quantum computing is an emerging technology that may transform scientific research,
              optimization, materials discovery, and other specialized workloads.
              However, sufficiently capable fault-tolerant quantum computers could threaten widely
              used public-key cryptography, including RSA and elliptic-curve cryptography (ECC).
            </p>
          </div>

          {/* Urgency & Risk Pillars */}
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="card-elevated rounded-2xl p-6 sm:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-action/10 text-action">
                <Clock size={24} weight="duotone" />
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-ink">
                Long Migration Lead Times
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Organizations need substantial time to discover where cryptography is used,
                inventory software and hardware dependencies, prioritize long-lived sensitive
                information, test post-quantum replacements, and migrate mission-critical systems.
                Previous cryptographic migrations have historically spanned five to ten years or longer.
              </p>
            </div>

            <div className="card-elevated rounded-2xl p-6 sm:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
                <ShieldCheck size={24} weight="duotone" />
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-ink">
                “Harvest Now, Decrypt Later” (HNDL)
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                The most immediate risk is the “harvest now, decrypt later” threat: adversaries may
                intercept and retain encrypted information today in the hope of decrypting it in the
                future once fault-tolerant quantum capability matures. Sensitive data with multi-decade
                retention lifespans is vulnerable to collection today.
              </p>
            </div>
          </div>

          {/* Precise Scientific Context & Guardrail */}
          <div className="mt-8 rounded-2xl border border-action/20 bg-canvas-subtle p-5 sm:p-6 text-sm text-ink/90">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-action/15 text-action">
                <Info size={18} weight="bold" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-ink">
                  A Note on Scientific Precision
                </p>
                <p className="text-xs sm:text-sm leading-relaxed text-muted">
                  Today’s quantum computers operate in the noisy intermediate-scale regime and cannot
                  break modern RSA or ECC at practical scale. Furthermore, reputable scientists do not
                  predict a definitive date when that capability will arrive. The urgency lies in the
                  proactive preparation required to inventory systems and deploy post-quantum standards
                  before that capability emerges.
                </p>
              </div>
            </div>
          </div>

          {/* Visual connected sequence: 4 stages */}
          <div className="mt-14">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-action">
                  Visual Sequence
                </p>
                <h3 className="font-heading text-lg sm:text-xl font-semibold text-ink">
                  Quantum advances → Cryptographic risk → Preparation → Quantum-safe migration
                </h3>
              </div>
              <span className="text-xs text-muted">
                4 Connected Stages
              </span>
            </div>

            <ol
              aria-label="Quantum security transition sequence"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {/* Sequence 1 */}
              <li className="relative rounded-2xl border border-ink/8 bg-canvas-subtle p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-action text-white text-xs font-bold font-mono">
                      01
                    </span>
                    <span className="text-[11px] font-semibold text-action uppercase tracking-wider">
                      Progress
                    </span>
                  </div>
                  <h4 className="mt-4 font-heading text-base font-semibold text-ink">
                    Quantum advances
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    Ongoing breakthroughs in hardware, error mitigation, and qubit design open new
                    possibilities for scientific research, optimization, and molecular simulations.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-ink/8 text-[11px] font-medium text-ink/70">
                  Computational breakthroughs
                </div>
              </li>

              {/* Sequence 2 */}
              <li className="relative rounded-2xl border border-ink/8 bg-canvas-subtle p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-600 text-white text-xs font-bold font-mono">
                      02
                    </span>
                    <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                      Vulnerability
                    </span>
                  </div>
                  <h4 className="mt-4 font-heading text-base font-semibold text-ink">
                    Cryptographic risk
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    Shor’s algorithm threatens public-key cryptography (RSA and ECC), while adversaries
                    intercept and retain encrypted communications today to decrypt them later.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-ink/8 text-[11px] font-medium text-ink/70">
                  Public-key algorithms threatened
                </div>
              </li>

              {/* Sequence 3 */}
              <li className="relative rounded-2xl border border-ink/8 bg-canvas-subtle p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-600 text-white text-xs font-bold font-mono">
                      03
                    </span>
                    <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">
                      Discovery
                    </span>
                  </div>
                  <h4 className="mt-4 font-heading text-base font-semibold text-ink">
                    Preparation
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    Organizations discover cryptographic dependencies, inventory assets, prioritize
                    long-lived secrets, and establish cryptographic agility frameworks.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-ink/8 text-[11px] font-medium text-ink/70">
                  Asset discovery & risk prioritization
                </div>
              </li>

              {/* Sequence 4 */}
              <li className="relative rounded-2xl border border-ink/8 bg-canvas-subtle p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white text-xs font-bold font-mono">
                      04
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                      Resilience
                    </span>
                  </div>
                  <h4 className="mt-4 font-heading text-base font-semibold text-ink">
                    Quantum-safe migration
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    Gradual deployment of post-quantum standards (ML-KEM and ML-DSA) and hybrid schemes
                    across digital services, protocols, and critical infrastructure.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-ink/8 text-[11px] font-medium text-ink/70">
                  NIST FIPS 203/204 adoption
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION: WHY ARE WE LEARNING THIS? (PURPOSE & PATHWAYS)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="why-learning"
        className="border-b border-ink/8 bg-canvas-subtle/50 py-16 sm:py-24"
        aria-labelledby="why-learning-heading"
      >
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-wider text-action">
              Platform Purpose
            </p>
            <h2
              id="why-learning-heading"
              className="mt-2 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-ink"
            >
              Why are we learning this?
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted">
              QuantumShield India provides structured, conceptual education and interactive tools
              to help India’s technical community build intuition about quantum computing,
              understand emerging cryptographic threats, and prepare for quantum-safe security.
            </p>
          </div>

          {/* Three Audience-Focused Pathways */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Pathway 1 */}
            <div className="card-elevated flex flex-col justify-between rounded-2xl p-6 sm:p-7">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-action/10 text-action">
                  <GraduationCap size={24} weight="bold" />
                </div>
                <h3 className="mt-4 font-heading text-xl font-semibold text-ink">
                  Students and learners
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Understand quantum concepts, cryptography, and the future of digital security
                  through accessible lessons and interactive experiments.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-muted">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-action" />
                    Foundational intuition for bits versus qubits
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-action" />
                    Accessible analogies without dense prerequisites
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-action" />
                    Essential cybersecurity principles & everyday hygiene
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-ink/8 flex flex-wrap items-center gap-3">
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-action hover:underline"
                >
                  Explore Lessons <ArrowRight size={14} weight="bold" />
                </Link>
                <Link
                  to="/topics"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"
                >
                  View Topics Hub
                </Link>
              </div>
            </div>

            {/* Pathway 2 */}
            <div className="card-elevated flex flex-col justify-between rounded-2xl p-6 sm:p-7">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
                  <Cpu size={24} weight="bold" />
                </div>
                <h3 className="mt-4 font-heading text-xl font-semibold text-ink">
                  Developers and security practitioners
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Learn how cryptographic algorithms are used, where quantum-related risks arise,
                  and why cryptographic agility and migration planning matter.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-muted">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    NIST FIPS 203 (ML-KEM) and FIPS 204 (ML-DSA) standards
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Key encapsulation mechanisms & hybrid schemes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Designing software for seamless algorithm agility
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-ink/8 flex flex-wrap items-center gap-3">
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-action hover:underline"
                >
                  Study PQC Algorithms <ArrowRight size={14} weight="bold" />
                </Link>
                <Link
                  to="/simulator"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"
                >
                  Test in Simulator
                </Link>
              </div>
            </div>

            {/* Pathway 3 */}
            <div className="card-elevated flex flex-col justify-between rounded-2xl p-6 sm:p-7">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700">
                  <UsersThree size={24} weight="bold" />
                </div>
                <h3 className="mt-4 font-heading text-xl font-semibold text-ink">
                  Organizations and technology teams
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Build awareness of cryptographic inventories, risk prioritization, post-quantum
                  standards, interoperability, testing, and gradual migration.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-muted">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                    Cryptographic asset discovery and risk prioritization
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                    Quantifying long-lived data exposure windows
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                    Phased migration roadmaps aligned with national milestones
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-ink/8 flex flex-wrap items-center gap-3">
                <Link
                  to="/simulator"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-action hover:underline"
                >
                  Evaluate Threat Simulator <ArrowRight size={14} weight="bold" />
                </Link>
                <Link
                  to="/topics"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"
                >
                  Explore Topics
                </Link>
              </div>
            </div>
          </div>

          {/* Connected Platform Features Grid */}
          <div className="mt-14 rounded-2xl border border-ink/8 bg-white p-6 sm:p-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-wider text-action">
                Real Platform Features
              </p>
              <h3 className="mt-1 font-heading text-xl font-semibold text-ink">
                How QuantumShield India puts learning into practice
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Each learning pathway links directly to functional platform capabilities.
              </p>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="rounded-xl border border-ink/8 bg-canvas-subtle p-4 flex flex-col justify-between">
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-action/10 text-action">
                    <BookOpen size={20} weight="duotone" />
                  </div>
                  <h4 className="mt-3 font-heading text-sm font-semibold text-ink">
                    Six foundational lessons
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    Curated modules covering cybersecurity basics, quantum computing, PQC, AI security, and cloud/IoT.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-ink/8">
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-action hover:underline"
                  >
                    View lessons <ArrowRight size={12} weight="bold" />
                  </Link>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="rounded-xl border border-ink/8 bg-canvas-subtle p-4 flex flex-col justify-between">
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700">
                    <Lightning size={20} weight="duotone" />
                  </div>
                  <h4 className="mt-3 font-heading text-sm font-semibold text-ink">
                    Interactive lesson experiments
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    Visual tools embedded in lessons to explore qubit states, algorithm parameters, and prompt defense.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-ink/8">
                  <Link
                    to="/lessons/post-quantum-cryptography"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-action hover:underline"
                  >
                    Try experiment <ArrowRight size={12} weight="bold" />
                  </Link>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="rounded-xl border border-ink/8 bg-canvas-subtle p-4 flex flex-col justify-between">
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-700">
                    <Cpu size={20} weight="duotone" />
                  </div>
                  <h4 className="mt-3 font-heading text-sm font-semibold text-ink">
                    The quantum cryptography simulator
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    A dedicated lab environment to examine Shor’s vs Grover’s dynamics, retention exposure, and lattice schemes.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-ink/8">
                  <Link
                    to="/simulator"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-action hover:underline"
                  >
                    Open simulator <ArrowRight size={12} weight="bold" />
                  </Link>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="rounded-xl border border-ink/8 bg-canvas-subtle p-4 flex flex-col justify-between">
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-700">
                    <CheckCircle size={20} weight="duotone" />
                  </div>
                  <h4 className="mt-3 font-heading text-sm font-semibold text-ink">
                    Knowledge checks & learning progress
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    Targeted quiz assessments with clear explanations, completion tracking, and saved learner bookmarks.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-ink/8">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-action hover:underline"
                  >
                    Learner dashboard <ArrowRight size={12} weight="bold" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION A — LEARNING PATHWAYS
      ───────────────────────────────────────────────────────────── */}
      <section
        id="topics"
        className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24"
        aria-labelledby="topics-heading"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wider text-action">
            Curriculum & Foundations
          </p>
          <h2
            id="topics-heading"
            className="mt-2 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-ink"
          >
            Explore the technologies shaping digital security
          </h2>
          <p className="mt-3 text-base sm:text-lg leading-relaxed text-muted">
            Ground your knowledge in core cybersecurity principles, then examine how quantum
            algorithms and post-quantum lattice mathematics redefine confidentiality.
          </p>
        </div>

        {/* Responsive Topic Cards Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Cryptography & Post-Quantum */}
          <div className="card-elevated flex flex-col justify-between rounded-2xl p-6">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-action/10 text-action">
                  <Key size={24} weight="duotone" />
                </div>
                <span className="rounded-full bg-canvas-subtle px-2.5 py-1 text-xs font-medium text-action">
                  Intermediate
                </span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-ink">
                Quantum Security & PQC
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Analyze Shor’s and Grover’s algorithms, the &apos;Harvest Now, Decrypt Later&apos; threat window,
                and NIST post-quantum standards (FIPS 203 ML-KEM and FIPS 204 ML-DSA).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-ink/8 flex items-center justify-between">
              <span className="text-xs font-mono text-muted">FIPS 203 / 204</span>
              <Link
                to="/lessons/post-quantum-cryptography"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-action hover:underline"
              >
                Read Lesson <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>

          {/* Card 2: Quantum Computing */}
          <div className="card-elevated flex flex-col justify-between rounded-2xl p-6">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700">
                  <Cpu size={24} weight="duotone" />
                </div>
                <span className="rounded-full bg-canvas-subtle px-2.5 py-1 text-xs font-medium text-muted">
                  Foundational
                </span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-ink">
                Quantum Computing Principles
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Learn the realities of bits versus qubits, superposition, entanglement, and the
                practical engineering hurdles between noisy devices and fault tolerance.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-ink/8 flex items-center justify-between">
              <span className="text-xs font-mono text-muted">Qubits & Limits</span>
              <Link
                to="/lessons/quantum-computing-fundamentals"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-action hover:underline"
              >
                Read Lesson <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>

          {/* Card 3: Cybersecurity Fundamentals */}
          <div className="card-elevated flex flex-col justify-between rounded-2xl p-6">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
                  <ShieldCheck size={24} weight="duotone" />
                </div>
                <span className="rounded-full bg-canvas-subtle px-2.5 py-1 text-xs font-medium text-muted">
                  Foundational
                </span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-ink">
                Cybersecurity Fundamentals
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Master the CIA triad (confidentiality, integrity, availability), understand the crucial
                distinction between a weakness and an incident, and apply everyday hygiene.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-ink/8 flex items-center justify-between">
              <span className="text-xs font-mono text-muted">CIA Triad</span>
              <Link
                to="/lessons/cybersecurity-fundamentals"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-action hover:underline"
              >
                Read Lesson <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>

          {/* Card 4: AI Security */}
          <div className="card-elevated flex flex-col justify-between rounded-2xl p-6">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-700">
                  <Brain size={24} weight="duotone" />
                </div>
                <span className="rounded-full bg-canvas-subtle px-2.5 py-1 text-xs font-medium text-muted">
                  Foundational
                </span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-ink">
                AI & Machine Learning Security
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Explore how machine learning pattern matching works, why model outputs must be
                treated as untrusted input, and the defensive limits of automated analysis.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-ink/8 flex items-center justify-between">
              <span className="text-xs font-mono text-muted">Untrusted Inputs</span>
              <Link
                to="/lessons/artificial-intelligence"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-action hover:underline"
              >
                Read Lesson <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>

          {/* Card 5: Cloud & IoT Security */}
          <div className="card-elevated flex flex-col justify-between rounded-2xl p-6 sm:col-span-2 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-800">
                  <LockSimple size={24} weight="duotone" />
                </div>
                <span className="rounded-full bg-canvas-subtle px-2.5 py-1 text-xs font-medium text-muted">
                  Foundational
                </span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-ink">
                Cloud & IoT Security
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted max-w-[64ch]">
                Understand how the shared responsibility model divides platform security from customer
                configuration, and why small connected IoT devices present unique patching challenges.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-ink/8 flex items-center justify-between">
              <span className="text-xs font-mono text-muted">Shared Responsibility</span>
              <Link
                to="/lessons/cloud-and-iot-security"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-action hover:underline"
              >
                Read Lesson <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>
        </div>

        {/* Structured Learning Paths overview */}
        <div className="mt-14 rounded-2xl border border-ink/8 bg-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-ink/8">
            <div>
              <h3 className="font-heading text-xl font-semibold text-ink">
                Structured Learning Sequences
              </h3>
              <p className="text-sm text-muted">
                Follow curated progression paths designed to build systematic comprehension.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/topics"
                className="button-secondary inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5"
              >
                Explore Topics Hub &rarr;
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center gap-1 text-sm font-semibold text-action hover:underline self-start sm:self-auto"
              >
                Browse all lessons <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {learningPaths.map((path, idx) => {
              const firstLesson = getLesson(path.lessonSlugs[0] ?? "");
              return (
                <div key={path.id} className="flex flex-col justify-between rounded-xl bg-canvas-subtle p-5">
                  <div>
                    <div className="flex items-center gap-2 text-action font-heading font-bold text-sm">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-action/10 text-xs">
                        {idx + 1}
                      </span>
                      <span>Sequence {idx + 1}</span>
                    </div>
                    <h4 className="mt-3 font-heading text-base font-semibold text-ink">
                      {path.title}
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      {path.summary}
                    </p>
                  </div>
                  {firstLesson && (
                    <div className="mt-4 pt-3 border-t border-ink/8">
                      <Link
                        to={`/lessons/${firstLesson.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-action hover:underline"
                      >
                        Start: {firstLesson.title} <ArrowRight size={12} weight="bold" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION B — LEARN BY DOING (QUANTUM SIMULATOR PREVIEW)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="simulator-preview"
        className="border-y border-ink/8 bg-canvas-subtle/60 py-16 sm:py-24"
        aria-labelledby="simulator-heading"
      >
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-wider text-action">
              Interactive Lab Preview
            </p>
            <h2
              id="simulator-heading"
              className="mt-2 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-ink"
            >
              Learn by doing: Explore cryptographic risks & defenses
            </h2>
            <p className="mt-3 text-base sm:text-lg leading-relaxed text-muted">
              Preview our conceptual simulator to see how Shor’s and Grover’s algorithms differ in their
              effects, why long-lived data is vulnerable to retroactive decryption, and how lattice
              cryptography provides resilience. Open the interactive laboratory to experiment with active parameters.
            </p>
          </div>

          <div className="mt-10">
            <QuantumSimulatorPreview />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION C — HOW LEARNING WORKS
      ───────────────────────────────────────────────────────────── */}
      <section
        className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24"
        aria-labelledby="how-it-works-heading"
      >
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-wider text-action">
            Pedagogical Approach
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-2 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-ink"
          >
            How learning works on QuantumShield India
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            A three-step progressive model that transforms theoretical cryptography into concrete,
            defensible engineering understanding.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {/* Step 1 */}
          <div className="card-elevated rounded-2xl p-6 sm:p-8 text-center sm:text-left flex flex-col justify-between">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-action/10 text-action">
                <BookOpen size={26} weight="duotone" />
              </div>
              <p className="mt-4 font-mono text-xs font-bold uppercase tracking-wider text-action">
                Step 01
              </p>
              <h3 className="mt-1 font-heading text-xl font-semibold text-ink">
                Explore a concept
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Read accessible, structured lessons written without unnecessary academic gatekeeping.
                Understand qubits, factoring limits, and NIST algorithms in plain language.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-ink/8">
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-action hover:underline"
              >
                Browse lesson catalogue <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>

          {/* Step 2 */}
          <div className="card-elevated rounded-2xl p-6 sm:p-8 text-center sm:text-left flex flex-col justify-between">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700">
                <Lightning size={26} weight="duotone" />
              </div>
              <p className="mt-4 font-mono text-xs font-bold uppercase tracking-wider text-emerald-700">
                Step 02
              </p>
              <h3 className="mt-1 font-heading text-xl font-semibold text-ink">
                Experiment interactively
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Interact with diagrams and simulator models. Examine the &apos;Harvest Now, Decrypt Later&apos;
                timeline and compare classical versus lattice-based cryptographic schemes.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-ink/8">
              <Link
                to="/simulator"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-action hover:underline"
              >
                Open interactive simulator <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>

          {/* Step 3 */}
          <div className="card-elevated rounded-2xl p-6 sm:p-8 text-center sm:text-left flex flex-col justify-between">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700">
                <GraduationCap size={26} weight="duotone" />
              </div>
              <p className="mt-4 font-mono text-xs font-bold uppercase tracking-wider text-sky-700">
                Step 03
              </p>
              <h3 className="mt-1 font-heading text-xl font-semibold text-ink">
                Test understanding
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Reinforce retention with targeted comprehension quizzes that offer immediate,
                detailed explanations for each answer. Track your achievements in your profile.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-ink/8">
              <Link
                to="/lessons/post-quantum-cryptography"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-action hover:underline"
              >
                Try sample NIST quiz <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION: INDIA'S JOURNEY TOWARD QUANTUM-SAFE SECURITY
      ───────────────────────────────────────────────────────────── */}
      <section
        id="india-roadmap"
        className="border-t border-ink/8 bg-gradient-to-b from-white via-canvas to-white py-16 sm:py-24"
        aria-labelledby="roadmap-heading"
      >
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-wider text-action">
              National Strategic Framework
            </p>
            <h2
              id="roadmap-heading"
              className="mt-2 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-ink"
            >
              India’s journey toward quantum-safe security
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted">
              Based on the official Department of Science and Technology (DST) report,{" "}
              <em className="font-semibold text-ink not-italic">
                Quantum-Safe Ecosystem in India — Roadmap to Quantum Resiliency
              </em>
              , India has established a structured, phased approach to transition critical digital
              infrastructure and enterprise networks toward quantum-safe cryptography.
            </p>
          </div>

          {/* Prominent Clarification Callout */}
          <div className="mt-8 rounded-2xl border-l-4 border-l-action border border-ink/8 bg-canvas-subtle p-5 sm:p-6 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-action/15 text-action">
                <Info size={18} weight="bold" />
              </div>
              <div className="space-y-1">
                <p className="text-sm sm:text-base font-semibold text-ink">
                  “2033 is the roadmap milestone for regular enterprises. Critical information
                  infrastructure follows an earlier timeline, with full migration targeted by the end of 2029.”
                </p>
                <p className="text-xs sm:text-sm leading-relaxed text-muted">
                  These roadmap milestones guide governance, cryptographic asset discovery, and phased
                  implementation across Indian institutions. They are strategic target milestones for
                  preparation and migration planning, not a claim that every organization has already
                  achieved quantum safety or that quantum computers will definitely break encryption by those dates.
                </p>
              </div>
            </div>
          </div>

          {/* Visual Responsive 3-Stage Timeline Infographic */}
          <div className="mt-14">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-action">
                  Implementation Roadmap
                </p>
                <h3 className="font-heading text-lg sm:text-xl font-semibold text-ink">
                  Three-Stage National Transition Milestones
                </h3>
              </div>
              <span className="text-xs text-muted">
                Department of Science and Technology (DST) Timeline
              </span>
            </div>

            <ol
              aria-label="India quantum-safe migration timeline"
              className="grid gap-6 md:grid-cols-3"
            >
              {/* Stage 1 */}
              <li className="card-elevated flex flex-col justify-between rounded-2xl p-6 sm:p-7 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-action to-sky-400" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-action/10 px-2.5 py-1 text-xs font-bold text-action font-mono">
                      Stage 01
                    </span>
                    <span className="text-sm font-bold font-mono text-ink">
                      2027–2028
                    </span>
                  </div>

                  <h4 className="mt-4 font-heading text-xl font-semibold text-ink">
                    Build the foundations
                  </h4>

                  {/* Target Breakdown Box */}
                  <div className="mt-4 rounded-xl bg-canvas-subtle p-3.5 space-y-2 border border-ink/6">
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <span className="font-semibold text-ink">Critical Information Infrastructure:</span>
                      <span className="shrink-0 font-medium text-action bg-action/10 px-2 py-0.5 rounded text-[11px]">
                        By end of 2027
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <span className="font-semibold text-ink">Regular Enterprises:</span>
                      <span className="shrink-0 font-medium text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded text-[11px]">
                        By end of 2028
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">
                    Key Roadmap Actions:
                  </p>
                  <ul className="mt-2 space-y-2 text-xs text-muted">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={15} weight="fill" className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>Establish governance bodies and transition steering frameworks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={15} weight="fill" className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>Identify and catalog all cryptographic assets and dependencies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={15} weight="fill" className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>Assess exposure risks and initiate priority post-quantum pilots</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-ink/8 flex items-center justify-between text-xs text-muted">
                  <span className="font-medium text-action">Phase 1: Governance & Discovery</span>
                  <span className="font-mono text-[11px]">Milestones 2027/28</span>
                </div>
              </li>

              {/* Stage 2 */}
              <li className="card-elevated flex flex-col justify-between rounded-2xl p-6 sm:p-7 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 to-indigo-500" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-700 font-mono">
                      Stage 02
                    </span>
                    <span className="text-sm font-bold font-mono text-ink">
                      2028–2030
                    </span>
                  </div>

                  <h4 className="mt-4 font-heading text-xl font-semibold text-ink">
                    Migrate high-priority systems
                  </h4>

                  {/* Target Breakdown Box */}
                  <div className="mt-4 rounded-xl bg-canvas-subtle p-3.5 space-y-2 border border-ink/6">
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <span className="font-semibold text-ink">Critical Information Infrastructure:</span>
                      <span className="shrink-0 font-medium text-action bg-action/10 px-2 py-0.5 rounded text-[11px]">
                        By end of 2028
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <span className="font-semibold text-ink">Regular Enterprises:</span>
                      <span className="shrink-0 font-medium text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded text-[11px]">
                        By end of 2030
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">
                    Key Roadmap Actions:
                  </p>
                  <ul className="mt-2 space-y-2 text-xs text-muted">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={15} weight="fill" className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>Prioritize sensitive databases and high-value communications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={15} weight="fill" className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>Modernize cryptographic libraries, HSMs, and public-key infrastructure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={15} weight="fill" className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>Test post-quantum (ML-KEM/ML-DSA) and hybrid dual-mode approaches</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-ink/8 flex items-center justify-between text-xs text-muted">
                  <span className="font-medium text-sky-700">Phase 2: High-Priority Systems</span>
                  <span className="font-mono text-[11px]">Milestones 2028/30</span>
                </div>
              </li>

              {/* Stage 3 */}
              <li className="card-elevated flex flex-col justify-between rounded-2xl p-6 sm:p-7 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-emerald-500" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 font-mono">
                      Stage 03
                    </span>
                    <span className="text-sm font-bold font-mono text-ink">
                      2029–2033
                    </span>
                  </div>

                  <h4 className="mt-4 font-heading text-xl font-semibold text-ink">
                    Complete the planned migration
                  </h4>

                  {/* Target Breakdown Box */}
                  <div className="mt-4 rounded-xl bg-canvas-subtle p-3.5 space-y-2 border border-ink/6">
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <span className="font-semibold text-ink">Critical Information Infrastructure:</span>
                      <span className="shrink-0 font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                        Target: 31 Dec 2029
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <span className="font-semibold text-ink">Regular Enterprises:</span>
                      <span className="shrink-0 font-medium text-action bg-action/10 px-2 py-0.5 rounded text-[11px]">
                        Target: 31 Dec 2033
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">
                    Key Roadmap Actions:
                  </p>
                  <ul className="mt-2 space-y-2 text-xs text-muted">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={15} weight="fill" className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>Continue rigorous interoperability, performance, and compliance testing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={15} weight="fill" className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>Maintain rigorous vendor oversight and cryptographic agility controls</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={15} weight="fill" className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>Safely isolate and phase out obsolete legacy cryptographic protocols</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-ink/8 flex items-center justify-between text-xs text-muted">
                  <span className="font-medium text-emerald-700">Phase 3: Planned Completion</span>
                  <span className="font-mono text-[11px]">CII 2029 / Enterprise 2033</span>
                </div>
              </li>
            </ol>
          </div>

          {/* Official Source Link Card */}
          <div className="mt-8 rounded-2xl border border-ink/8 bg-white p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-action/10 text-action">
                <FileText size={22} weight="duotone" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-action">
                  Primary Government Source
                </p>
                <h4 className="font-heading text-base font-semibold text-ink">
                  Quantum-Safe Ecosystem in India — Roadmap to Quantum Resiliency
                </h4>
                <p className="mt-0.5 text-xs text-muted">
                  Official report published by the Department of Science and Technology (DST), Government of India.
                </p>
              </div>
            </div>

            <a
              href="https://dst.gov.in/sites/default/files/Quantum-Safe-Ecosystem-in-India.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-action/30 bg-action/5 px-4 py-2 text-xs font-semibold text-action transition-colors hover:bg-action hover:text-white shrink-0 self-start sm:self-center"
            >
              <span>Read the official roadmap</span>
              <ArrowSquareOut size={16} weight="bold" />
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION: FINAL CALL TO ACTION & PLATFORM HEALTH STATUS
      ───────────────────────────────────────────────────────────── */}
      <section
        className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24"
        aria-labelledby="cta-heading"
      >
        <div className="relative overflow-hidden rounded-3xl border border-action/20 bg-gradient-to-br from-white via-canvas-subtle to-sky-50/50 p-8 sm:p-12 shadow-[0_16px_40px_-8px_rgba(21,94,239,0.08)]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-action/10 px-3 py-1 text-xs font-semibold text-action">
              <Sparkle size={14} weight="fill" />
              Start Learning Today
            </span>

            <h2
              id="cta-heading"
              className="mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-ink"
            >
              The transition starts with understanding.
            </h2>

            <p className="mt-3 text-base sm:text-lg leading-relaxed text-muted">
              Explore the concepts, experiment with cryptographic ideas, and learn why preparing for
              quantum-safe security matters today.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/explore"
                className="button-primary inline-flex items-center gap-2 px-6 py-3 text-base shadow-sm"
              >
                <Compass size={18} weight="bold" />
                Start Learning
              </Link>

              <Link
                to="/simulator"
                className="button-secondary inline-flex items-center gap-2 px-6 py-3 text-base"
              >
                <Cpu size={18} weight="bold" className="text-action" />
                Try the Simulator
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
