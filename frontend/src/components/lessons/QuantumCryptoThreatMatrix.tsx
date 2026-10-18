import { useState } from "react";
import { Clock, ShieldCheck, ShieldWarning, Sparkle, WarningOctagon } from "@phosphor-icons/react";

type CryptoCategory = "public-key" | "symmetric" | "hashing";

export function QuantumCryptoThreatMatrix() {
  const [category, setCategory] = useState<CryptoCategory>("public-key");
  const [retentionYears, setRetentionYears] = useState<number>(20);

  const currentYear = 2026;
  const expirationYear = currentYear + retentionYears;

  return (
    <div id="interactive-lab" className="card-elevated my-10 rounded-2xl border border-ink/10 bg-white p-6 sm:p-7">
      <div className="flex items-center gap-2 border-b border-ink/8 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-action/10 px-3 py-1 text-xs font-semibold text-action">
          <Sparkle size={16} weight="fill" />
          Cryptographic Impact & Threat Lab
        </span>
        <span className="text-xs text-muted">Shor vs Grover & HNDL Timeline</span>
      </div>

      <div className="mt-4">
        <h3 className="font-heading text-xl font-semibold text-ink">
          Quantum Cryptanalysis & Algorithm Exposure
        </h3>
        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted">
          Quantum computers do not treat all encryption identically. Compare how Shor&apos;s and Grover&apos;s algorithms affect different cryptographic primitives.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Cryptographic primitive category">
        <button
          type="button"
          role="tab"
          aria-selected={category === "public-key"}
          onClick={() => setCategory("public-key")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
            category === "public-key"
              ? "bg-action text-white shadow-xs"
              : "bg-canvas-subtle text-ink hover:bg-slate-100 border border-ink/8"
          }`}
        >
          Public-Key Schemes (RSA / ECC)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={category === "symmetric"}
          onClick={() => setCategory("symmetric")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
            category === "symmetric"
              ? "bg-action text-white shadow-xs"
              : "bg-canvas-subtle text-ink hover:bg-slate-100 border border-ink/8"
          }`}
        >
          Symmetric Ciphers (AES)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={category === "hashing"}
          onClick={() => setCategory("hashing")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
            category === "hashing"
              ? "bg-action text-white shadow-xs"
              : "bg-canvas-subtle text-ink hover:bg-slate-100 border border-ink/8"
          }`}
        >
          Hash Functions (SHA-2 / SHA-3)
        </button>
      </div>

      {/* Detail Card for selected category */}
      <div className="mt-4 rounded-xl border border-ink/10 bg-canvas-subtle p-5">
        {category === "public-key" && (
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading text-base font-semibold text-ink">
                Public-Key Cryptography (RSA, Diffie-Hellman, ECDSA)
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                <ShieldWarning size={14} weight="bold" />
                Vulnerable to Shor&apos;s Algorithm
              </span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-muted">
              <strong>Relevant Algorithm:</strong> Peter Shor (1994) developed a polynomial-time algorithm for finding the period of a function, solving both integer factorization and discrete logarithms.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-lg bg-white p-3 border border-ink/8">
                <p className="font-bold text-red-700">The Problem:</p>
                <p className="mt-1 text-slate-700">
                  On a sufficiently large, fault-tolerant quantum computer, Shor&apos;s algorithm solves RSA-2048 and ECC P-256 in hours rather than trillions of years.
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 border border-ink/8">
                <p className="font-bold text-emerald-700">The Defense:</p>
                <p className="mt-1 text-slate-700">
                  Migrate to lattice-based post-quantum cryptography (e.g., NIST ML-KEM and ML-DSA) whose hard mathematical problems do not depend on factoring or discrete log.
                </p>
              </div>
            </div>
          </div>
        )}

        {category === "symmetric" && (
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading text-base font-semibold text-ink">
                Symmetric Block Ciphers (AES-128, AES-256)
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <ShieldCheck size={14} weight="bold" />
                Resistant with 256-bit Keys
              </span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-muted">
              <strong>Relevant Algorithm:</strong> Lov Grover (1996) proved a quadratic speedup for unstructured search (O(&radic;N) queries instead of O(N)).
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-lg bg-white p-3 border border-ink/8">
                <p className="font-bold text-amber-700">AES-128 Impact:</p>
                <p className="mt-1 text-slate-700">
                  Grover&apos;s algorithm effectively cuts the effective key length in half ($2^{128} \rightarrow 2^{64}$). 64-bit security is within reach of large distributed compute.
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 border border-ink/8">
                <p className="font-bold text-emerald-700">AES-256 Security:</p>
                <p className="mt-1 text-slate-700">
                  With 256-bit keys, Grover reduces security to approximately 128 bits ($2^{128}$). This remains mathematically infeasible to brute-force for the foreseeable future.
                </p>
              </div>
            </div>
          </div>
        )}

        {category === "hashing" && (
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading text-base font-semibold text-ink">
                Cryptographic Hash Functions (SHA-256, SHA-384, SHA-3)
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <ShieldCheck size={14} weight="bold" />
                Resistant with Standard Digest Sizes
              </span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-muted">
              <strong>Quantum Impact:</strong> Grover&apos;s algorithm speeds up finding pre-images (given $H$, find $M$). Collision resistance (finding two messages with the same digest) is bounded by the Brassard-Høyer-Tapp algorithm ($O(N^{1/3})$).
            </p>

            <div className="mt-4 rounded-lg bg-white p-3 border border-ink/8 text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-ink">Practical Standard Recommendation:</p>
              <p className="mt-1">
                Standard digests like SHA-256 and SHA-384 retain robust security against quantum collision and pre-image attacks. No mathematical redesign is needed for hashing.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Harvest Now Decrypt Later Timeline */}
      <div className="mt-6 rounded-xl border border-ink/8 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock size={18} weight="bold" className="text-action" />
            <h4 className="font-heading text-sm font-semibold text-ink">
              Interactive &apos;Harvest Now, Decrypt Later&apos; (HNDL) Risk Timeline
            </h4>
          </div>
          <span className="text-xs font-mono font-semibold text-action">
            {retentionYears} Years Secret Lifetime
          </span>
        </div>

        <p className="mt-1.5 text-xs text-muted">
          Drag the slider to represent how long confidential data (such as sovereign communications, medical records, or trade secrets) must remain secret:
        </p>

        <div className="mt-4">
          <input
            type="range"
            min="5"
            max="40"
            step="5"
            value={retentionYears}
            onChange={(e) => setRetentionYears(Number(e.target.value))}
            className="w-full cursor-pointer accent-action"
            aria-label="Data retention years slider"
          />
          <div className="flex justify-between text-[11px] font-mono text-muted mt-1">
            <span>5 Years (Low Retention)</span>
            <span>20 Years (Enterprise Standard)</span>
            <span>40 Years (National Security / Health)</span>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-lg border border-ink/8 bg-canvas-subtle p-3">
            <p className="font-bold text-ink">1. Interception Today ({currentYear})</p>
            <p className="mt-1 text-slate-600">
              Encrypted TLS sessions protected by RSA/ECC are recorded by passive eavesdroppers.
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
            <p className="font-bold text-amber-900">2. Secrecy Horizon ({currentYear}–{expirationYear})</p>
            <p className="mt-1 text-slate-700">
              The data remains legally or commercially confidential for {retentionYears} years until {expirationYear}.
            </p>
          </div>

          <div className="rounded-lg border border-action/20 bg-action/5 p-3">
            <p className="font-bold text-action">3. Quantum Exposure Window</p>
            <p className="mt-1 text-slate-700">
              {retentionYears >= 15
                ? `High exposure window! A fault-tolerant machine built before ${expirationYear} could retroactively decrypt this recorded data.`
                : "Lower exposure for short-lived ephemeral data that loses all value before fault-tolerant machines are likely to arrive."}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-ink/6 flex items-start gap-2 text-[11px] text-muted">
          <WarningOctagon size={16} weight="bold" className="text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Note on Evidence:</strong> This timeline illustrates risk duration. It is not an engineering prediction of the year a fault-tolerant quantum computer will be constructed.
          </p>
        </div>
      </div>
    </div>
  );
}
