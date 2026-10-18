import { useState } from "react";
import { Key, ListChecks, ShieldCheck } from "@phosphor-icons/react";

type PqcAlgorithmKey = "ml-kem" | "ml-dsa" | "slh-dsa";

const PQC_STANDARDS: Record<
  PqcAlgorithmKey,
  {
    name: string;
    standard: string;
    researchName: string;
    purpose: string;
    mathFamily: string;
    classicalCounterpart: string;
    keySizeNote: string;
    securityNotes: string;
  }
> = {
  "ml-kem": {
    name: "ML-KEM",
    standard: "NIST FIPS 203",
    researchName: "CRYSTALS-Kyber",
    purpose: "Key Encapsulation Mechanism (Encryption & Key Establishment)",
    mathFamily: "Module Learning with Errors (M-LWE) over polynomial lattices",
    classicalCounterpart: "Replaces RSA key exchange and Diffie-Hellman / ECDH",
    keySizeNote: "Public key: ~800–1,568 bytes. Ciphertext: ~768–1,568 bytes. (Compare to ECDH P-256's 32 bytes).",
    securityNotes: "Primary standard for general encryption and TLS key establishment. Solves the 'Harvest Now, Decrypt Later' threat for encrypted sessions.",
  },
  "ml-dsa": {
    name: "ML-DSA",
    standard: "NIST FIPS 204",
    researchName: "CRYSTALS-Dilithium",
    purpose: "Digital Signatures & Authentication",
    mathFamily: "Module Learning with Errors and Short Integer Solution (SIS)",
    classicalCounterpart: "Replaces RSA signatures and ECDSA",
    keySizeNote: "Public key: ~1,312–2,592 bytes. Signature: ~2,420–4,595 bytes. (Significantly larger than ECDSA's 64-byte signature).",
    securityNotes: "Primary general-purpose post-quantum signature standard for software signing, document authentication, and public key infrastructure (PKI) certificates.",
  },
  "slh-dsa": {
    name: "SLH-DSA",
    standard: "NIST FIPS 205",
    researchName: "SPHINCS+",
    purpose: "Stateless Hash-Based Digital Signatures",
    mathFamily: "Hash-based cryptography (Merkle trees & one-time signature chains)",
    classicalCounterpart: "Conservative alternative signature scheme",
    keySizeNote: "Small public keys (~32–64 bytes), but very large signatures (~7.8 KB to 49 KB).",
    securityNotes: "Provides a conservative cryptographic backup. Relies purely on secure hash functions without any lattice hardness assumptions.",
  },
};

const MIGRATION_STAGES = [
  {
    step: "01",
    title: "Discovery & Inventory",
    task: "Identify every instance where public-key cryptography is currently used across services, VPNs, TLS terminators, and internal APIs.",
    detail: "You cannot protect what you do not know exists. Catalog all certificates, signature verification routines, and embedded device keys.",
  },
  {
    step: "02",
    title: "Risk Prioritization",
    task: "Rank systems by the required secrecy lifetime of the data they process and transmit.",
    detail: "Data that must remain secret for 15+ years (e.g., patient records, sovereign intelligence, trade secrets) must be migrated first due to HNDL.",
  },
  {
    step: "03",
    title: "Hybrid Deployment & Testing",
    task: "Combine classical algorithms with post-quantum standards in parallel (e.g., X25519 + ML-KEM-768).",
    detail: "Hybrid key agreement ensures security even if an early PQC implementation has a flaw, while defending against quantum adversaries.",
  },
  {
    step: "04",
    title: "Full PQC Standards Migration",
    task: "Transition root certificate authorities, software code-signing pipelines, and protocol handshakes to pure FIPS 203/204.",
    detail: "Deprecate legacy RSA and discrete-log curves as post-quantum software ecosystems, hardware acceleration, and testing mature.",
  },
];

export function PqcAlgorithmExplorer() {
  const [selectedAlgo, setSelectedAlgo] = useState<PqcAlgorithmKey>("ml-kem");
  const [activeStage, setActiveStage] = useState<number>(0);

  const algo = PQC_STANDARDS[selectedAlgo];

  return (
    <div id="interactive-lab" className="card-elevated my-10 rounded-2xl border border-ink/10 bg-white p-6 sm:p-7">
      <div className="flex items-center gap-2 border-b border-ink/8 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-action/10 px-3 py-1 text-xs font-semibold text-action">
          <Key size={16} weight="fill" />
          NIST Standards & Migration Lab
        </span>
        <span className="text-xs text-muted">FIPS 203 / 204 / 205 Standards</span>
      </div>

      <div className="mt-4">
        <h3 className="font-heading text-xl font-semibold text-ink">
          Interactive Post-Quantum Algorithm Matrix
        </h3>
        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted">
          Examine the three official standards published by NIST in 2024. Understand their purposes, mathematical foundations, and why they are not direct drop-in byte replacements.
        </p>
      </div>

      {/* Algorithm Tabs */}
      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="NIST Standards">
        {(["ml-kem", "ml-dsa", "slh-dsa"] as PqcAlgorithmKey[]).map((key) => {
          const item = PQC_STANDARDS[key];
          const isSelected = selectedAlgo === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedAlgo(key)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "bg-action text-white shadow-xs"
                  : "bg-canvas-subtle text-ink hover:bg-slate-100 border border-ink/8"
              }`}
            >
              {item.name} ({item.standard})
            </button>
          );
        })}
      </div>

      {/* Algorithm Details Box */}
      <div className="mt-4 rounded-xl border border-ink/10 bg-canvas-subtle p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-heading text-lg font-semibold text-ink">
              {algo.name} — {algo.standard}
            </h4>
            <p className="text-xs text-muted">Original Research Name: {algo.researchName}</p>
          </div>
          <span className="self-start sm:self-auto rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            Official NIST Standard (2024)
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-lg bg-white p-3 border border-ink/8">
            <p className="font-bold text-ink">Primary Purpose:</p>
            <p className="mt-1 text-slate-700">{algo.purpose}</p>
          </div>
          <div className="rounded-lg bg-white p-3 border border-ink/8">
            <p className="font-bold text-ink">Mathematical Foundation:</p>
            <p className="mt-1 text-slate-700">{algo.mathFamily}</p>
          </div>
          <div className="rounded-lg bg-white p-3 border border-ink/8">
            <p className="font-bold text-ink">Classical Replacement:</p>
            <p className="mt-1 text-slate-700">{algo.classicalCounterpart}</p>
          </div>
          <div className="rounded-lg bg-white p-3 border border-ink/8">
            <p className="font-bold text-amber-800">Key & Ciphertext Size Reality:</p>
            <p className="mt-1 text-slate-700">{algo.keySizeNote}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-white p-3.5 border border-ink/8 text-xs leading-relaxed text-slate-700">
          <span className="font-semibold text-ink">Security & Engineering Context: </span>
          {algo.securityNotes}
        </div>
      </div>

      {/* Interactive 4-Stage Migration Sequence */}
      <div className="mt-8 border-t border-ink/8 pt-6">
        <div className="flex items-center gap-2">
          <ListChecks size={20} weight="bold" className="text-action" />
          <h4 className="font-heading text-base font-semibold text-ink">
            Interactive PQC Migration Sequence
          </h4>
        </div>
        <p className="mt-1 text-xs text-muted">
          Switching cryptographic algorithms is an engineering project. Step through the 4 essential phases of a post-quantum migration program:
        </p>

        {/* Step Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {MIGRATION_STAGES.map((stage, idx) => {
            const isActive = activeStage === idx;
            return (
              <button
                key={stage.step}
                type="button"
                onClick={() => setActiveStage(idx)}
                className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                  isActive
                    ? "border-action bg-action text-white shadow-xs"
                    : "border-ink/8 bg-white hover:bg-canvas-subtle text-ink"
                }`}
              >
                <span className={`text-[11px] font-mono font-bold ${isActive ? "text-white/80" : "text-action"}`}>
                  Phase {stage.step}
                </span>
                <p className="mt-1 font-heading text-xs font-semibold leading-snug line-clamp-1">
                  {stage.title}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detail */}
        <div className="mt-4 rounded-xl border border-action/20 bg-action/5 p-4.5 text-xs">
          <div className="flex items-center gap-2 text-action font-semibold text-sm">
            <ShieldCheck size={18} weight="fill" />
            <span>
              Phase {MIGRATION_STAGES[activeStage].step}: {MIGRATION_STAGES[activeStage].title}
            </span>
          </div>
          <p className="mt-2 font-semibold text-ink">
            {MIGRATION_STAGES[activeStage].task}
          </p>
          <p className="mt-1 leading-relaxed text-slate-700">
            {MIGRATION_STAGES[activeStage].detail}
          </p>
        </div>
      </div>
    </div>
  );
}
