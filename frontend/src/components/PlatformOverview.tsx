import { Atom, ClipboardCheck, GraduationCap, Library, type LucideIcon } from "lucide-react";

interface PlannedCapability {
  title: string;
  description: string;
  icon: LucideIcon;
}

const CAPABILITIES: PlannedCapability[] = [
  {
    title: "Cryptographic Inventory",
    description:
      "A future catalog of cryptographic assets, so teams can see which algorithms and keys need review before a post-quantum migration.",
    icon: Library,
  },
  {
    title: "Quantum Threat Simulator",
    description:
      "A future illustration of how large quantum computers could affect common public-key algorithms. No simulation runs in this phase.",
    icon: Atom,
  },
  {
    title: "PQC Readiness Assessment",
    description:
      "A future questionnaire for the decisions an organization must make before adopting post-quantum cryptography. It does not score readiness yet.",
    icon: ClipboardCheck,
  },
  {
    title: "Cybersecurity Awareness",
    description:
      "Future explainers that describe quantum-related cryptographic risk in plain language for students and practitioners.",
    icon: GraduationCap,
  },
];

export function PlatformOverview() {
  return (
    <section
      id="platform-overview"
      aria-labelledby="overview-heading"
      className="mx-auto max-w-6xl px-4 py-6 sm:px-6"
    >
      <div className="max-w-2xl">
        <h2 id="overview-heading" className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Platform overview
        </h2>
        <p className="mt-3 text-base leading-7 text-muted">
          These capabilities are planned for later phases. They are shown here so the product
          direction is clear. None of the underlying tools are available yet.
        </p>
      </div>

      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {CAPABILITIES.map((capability) => {
          const Icon = capability.icon;
          return (
            <li key={capability.title} className="rounded-2xl border border-line bg-navy-900/70 p-5">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-navy-800 text-blue-accent">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="rounded-full border border-violet-accent/40 bg-navy-950 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-accent">
                  Planned
                </span>
              </div>
              <h3 className="font-display mt-4 text-lg font-semibold text-white">{capability.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{capability.description}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Coming in a future phase
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
