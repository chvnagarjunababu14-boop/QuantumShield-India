import { useState } from "react";
import { CheckCircle, EyeSlash, FileCode, HardDrives, ShieldCheck, WarningOctagon } from "@phosphor-icons/react";

type TriadPillar = "confidentiality" | "integrity" | "availability";

const PILLARS: Record<
  TriadPillar,
  {
    name: string;
    goal: string;
    icon: typeof EyeSlash;
    protectedScenario: string;
    breachedScenario: string;
    controlExamples: string[];
    threats: string;
  }
> = {
  confidentiality: {
    name: "Confidentiality",
    goal: "Only authorized individuals or systems can read the data.",
    icon: EyeSlash,
    protectedScenario: "Customer records are stored with AES-256 encryption. Only authorized employees with MFA can view decrypted data.",
    breachedScenario: "An unencrypted database backup was left publicly accessible on a cloud bucket, allowing anyone to read confidential customer information.",
    controlExamples: ["Strong cryptography in transit & at rest", "Role-based access control (RBAC)", "Multi-factor authentication (MFA)"],
    threats: "Unauthorized data exfiltration, eavesdropping, credential stuffing.",
  },
  integrity: {
    name: "Integrity",
    goal: "Data and system behavior have not been altered without authorization.",
    icon: FileCode,
    protectedScenario: "Financial ledger transactions are signed with cryptographic hashes. Any unauthorized modification immediately invalidates the record.",
    breachedScenario: "An attacker intercepted transit traffic and modified bank routing numbers, silently redirecting vendor payments.",
    controlExamples: ["Cryptographic digital signatures", "Cryptographic hash checksums (SHA-256)", "Immutable audit logging & file integrity monitoring"],
    threats: "Man-in-the-middle tampering, malicious code injection, unapproved schema edits.",
  },
  availability: {
    name: "Availability",
    goal: "Authorized users can access systems and data whenever needed.",
    icon: HardDrives,
    protectedScenario: "The web application runs on multi-region load balancers with automated backups, surviving individual server failures without downtime.",
    breachedScenario: "A massive distributed denial-of-service (DDoS) attack saturated internet gateways, preventing emergency responders from accessing records.",
    controlExamples: ["Redundant server clusters", "Automated backup & disaster recovery", "DDoS rate-limiting & scrubbers"],
    threats: "DDoS attacks, ransomware encrypting active disks, hardware failure, power loss.",
  },
};

export function CiaTriadVisualizer() {
  const [activePillar, setActivePillar] = useState<TriadPillar>("confidentiality");
  const [isCompromised, setIsCompromised] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"triad" | "risk">("triad");

  const data = PILLARS[activePillar];
  const Icon = data.icon;

  return (
    <div id="interactive-lab" className="card-elevated my-10 rounded-2xl border border-ink/10 bg-white p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink/8 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800">
            <ShieldCheck size={16} weight="fill" className="text-emerald-600" />
            Interactive Concept Lab
          </span>
          <h3 className="mt-2 font-heading text-xl font-semibold text-ink">
            CIA Triad & Risk Mechanics
          </h3>
        </div>

        {/* Tab switch between CIA and Threat vs Vulnerability */}
        <div className="flex rounded-lg bg-canvas-subtle p-1 border border-ink/8 text-xs font-semibold" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "triad"}
            onClick={() => setActiveTab("triad")}
            className={`rounded-md px-3 py-1.5 transition-all cursor-pointer ${
              activeTab === "triad" ? "bg-white text-action shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            CIA Triad Simulator
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "risk"}
            onClick={() => setActiveTab("risk")}
            className={`rounded-md px-3 py-1.5 transition-all cursor-pointer ${
              activeTab === "risk" ? "bg-white text-action shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            Threat vs Vulnerability vs Incident
          </button>
        </div>
      </div>

      {activeTab === "triad" ? (
        <div className="mt-6">
          {/* Triad Selector Tabs */}
          <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="CIA Triad properties">
            {(["confidentiality", "integrity", "availability"] as TriadPillar[]).map((pillar) => {
              const item = PILLARS[pillar];
              const isSelected = activePillar === pillar;
              return (
                <button
                  key={pillar}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActivePillar(pillar)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all cursor-pointer ${
                    isSelected
                      ? "border-action bg-action/5 text-action shadow-xs font-semibold"
                      : "border-ink/8 bg-white hover:bg-canvas-subtle text-muted"
                  }`}
                >
                  <item.icon size={22} weight={isSelected ? "bold" : "regular"} />
                  <span className="text-xs sm:text-sm capitalize">{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive State Toggle */}
          <div className="mt-6 flex items-center justify-between rounded-xl bg-canvas-subtle p-3 sm:px-4">
            <span className="text-xs font-semibold text-muted">Simulate System State:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsCompromised(false)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  !isCompromised
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-ink/8"
                }`}
              >
                Healthy / Protected
              </button>
              <button
                type="button"
                onClick={() => setIsCompromised(true)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  isCompromised
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-ink/8"
                }`}
              >
                Compromised / Under Attack
              </button>
            </div>
          </div>

          {/* Dynamic Simulator Output Card */}
          <div
            className={`mt-4 rounded-xl border p-5 transition-all ${
              isCompromised ? "border-red-200 bg-red-50/40" : "border-emerald-200 bg-emerald-50/40"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon
                size={22}
                weight="fill"
                className={isCompromised ? "text-red-600" : "text-emerald-600"}
              />
              <h4 className="font-heading text-base font-semibold text-ink">
                {data.name} State: {isCompromised ? "Breached" : "Secure"}
              </h4>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-muted">
              <span className="font-semibold text-ink">Pillar Goal: </span>
              {data.goal}
            </p>

            <div className="mt-4 rounded-lg bg-white/90 p-3.5 border border-ink/8">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                {isCompromised ? "Simulated Breach Impact:" : "Active Protection Model:"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-800">
                {isCompromised ? data.breachedScenario : data.protectedScenario}
              </p>
            </div>

            <div className="mt-4 border-t border-ink/8 pt-3">
              <p className="text-xs font-semibold text-ink">Defensive Controls Required:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.controlExamples.map((control) => (
                  <span
                    key={control}
                    className="inline-flex items-center gap-1.5 rounded-md bg-white border border-ink/10 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    <CheckCircle size={14} weight="fill" className="text-emerald-600 shrink-0" />
                    {control}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Threat vs Vulnerability vs Incident Explorer */
        <div className="mt-6 space-y-4">
          <p className="text-xs text-muted leading-relaxed">
            A vulnerability is a weakness. A threat is someone or something that could exploit it. An incident occurs only when a threat successfully acts upon a reachable vulnerability.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800">1. Vulnerability</span>
              <p className="mt-1 font-heading text-sm font-semibold text-ink">The Weakness</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">
                A missing security update on an internet-facing web server, or using default passwords like &quot;admin123&quot;.
              </p>
              <div className="mt-3 rounded bg-white/80 p-2 text-[11px] font-mono text-muted">
                Status: Latent flaw. No harm done yet.
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">2. Threat</span>
              <p className="mt-1 font-heading text-sm font-semibold text-ink">The Agent</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">
                An automated exploit scanner operated by cybercriminals, scanning public IP ranges for unpatched flaws.
              </p>
              <div className="mt-3 rounded bg-white/80 p-2 text-[11px] font-mono text-muted">
                Status: External potential for harm.
              </div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-red-800">3. Incident</span>
              <p className="mt-1 font-heading text-sm font-semibold text-ink">The Realized Harm</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">
                The scanner identifies the unpatched server, executes code, and downloads customer records.
              </p>
              <div className="mt-3 rounded bg-white/80 p-2 text-[11px] font-mono text-muted">
                Status: Actual loss of confidentiality/integrity.
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-ink/8 bg-canvas-subtle p-3.5 flex items-start gap-2.5 text-xs text-muted">
            <WarningOctagon size={18} weight="bold" className="text-action shrink-0 mt-0.5" />
            <p>
              <span className="font-semibold text-ink">Key Rule: </span>
              A vulnerability that cannot be reached or exploited has low risk. Patching removes vulnerabilities before threats can connect with them.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
