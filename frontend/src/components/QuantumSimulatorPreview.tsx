import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Cpu,
  ShieldWarning,
  Sparkle,
  Warning,
} from "@phosphor-icons/react";

export function QuantumSimulatorPreview() {
  return (
    <div className="card-elevated rounded-3xl border border-ink/8 bg-surface p-6 sm:p-8 lg:p-10 shadow-sm">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ink/8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-action/10 px-3 py-1 text-xs font-semibold text-action">
            <Sparkle size={14} weight="fill" />
            <span>Interactive Laboratory Preview</span>
          </div>
          <h3 className="mt-2 font-heading text-xl sm:text-2xl font-semibold text-ink">
            Cryptographic Threat & Defense Modeling
          </h3>
          <p className="mt-1 text-sm text-muted">
            Preview our interactive mathematical model comparing classical algorithms against Shor&apos;s and Grover&apos;s algorithms.
          </p>
        </div>

        <Link
          to="/simulator"
          className="button-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold shadow-sm self-start sm:self-auto whitespace-nowrap"
        >
          <Cpu size={16} weight="bold" />
          Launch Interactive Simulator
          <ArrowRight size={14} weight="bold" />
        </Link>
      </div>

      {/* Snapshot Preview Grid */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Classical Preview Card */}
        <div className="rounded-2xl border border-red-200/80 bg-red-50/40 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">
              Classical Public-Key Schemes
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
              <ShieldWarning size={14} weight="bold" />
              Quantum Vulnerable
            </span>
          </div>
          <h4 className="mt-3 font-heading text-lg font-semibold text-ink">
            RSA-2048 & ECDH P-256
          </h4>
          <p className="mt-2 text-xs leading-relaxed text-slate-700">
            Relies on prime factorization and discrete logarithms. Vulnerable to Shor&apos;s algorithm on fault-tolerant quantum hardware, exposing long-lived communications to retroactive decryption.
          </p>
          <div className="mt-4 pt-3 border-t border-red-200/60 flex items-center justify-between text-[11px] text-red-900 font-mono">
            <span>Shor Factorization</span>
            <span>Polynomial Break</span>
          </div>
        </div>

        {/* Post-Quantum Preview Card */}
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              NIST Standardized PQC
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              <CheckCircle size={14} weight="bold" />
              Quantum Resistant
            </span>
          </div>
          <h4 className="mt-3 font-heading text-lg font-semibold text-ink">
            ML-KEM (FIPS 203) & ML-DSA (FIPS 204)
          </h4>
          <p className="mt-2 text-xs leading-relaxed text-slate-700">
            Engineered on lattice-based mathematics (Module Learning with Errors). Withstands both classical computers and known quantum cryptanalytic attacks, preserving future confidentiality.
          </p>
          <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-900 font-mono">
            <span>M-LWE Hardness</span>
            <span>NIST Standardized</span>
          </div>
        </div>
      </div>

      {/* HNDL Concept Snapshot */}
      <div className="mt-6 rounded-2xl border border-ink/8 bg-canvas-subtle p-5">
        <div className="flex items-center gap-2">
          <Warning size={18} weight="bold" className="text-action" />
          <h4 className="font-heading text-sm font-semibold text-ink">
            Harvest Now, Decrypt Later (HNDL) Threat Window
          </h4>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Adversaries intercept encrypted data today to decrypt once fault-tolerant quantum computers mature. Open the full simulator to experiment with interactive retention timelines and impact matrices.
        </p>
      </div>

      {/* Action Footer */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-ink/8 text-xs text-muted">
        <span>Educational conceptual model · Does not execute live cryptanalysis</span>
        <Link
          to="/simulator"
          className="inline-flex items-center gap-1 font-semibold text-action hover:underline"
        >
          Open simulator workspace <ArrowRight size={13} weight="bold" />
        </Link>
      </div>
    </div>
  );
}
