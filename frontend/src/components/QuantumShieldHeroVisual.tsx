import { useState } from "react";
import { Cpu, Key, ShieldCheck, Waves } from "@phosphor-icons/react";

type NodeConcept = {
  id: string;
  name: string;
  badge: string;
  detail: string;
  x: number;
  y: number;
  color: string;
};

const NODES: NodeConcept[] = [
  {
    id: "superposition",
    name: "Quantum Superposition",
    badge: "|ψ⟩ = α|0⟩ + β|1⟩",
    detail: "Quantum processors compute using superposition & entanglement, enabling Shor's algorithm to threaten classical factoring.",
    x: 85,
    y: 110,
    color: "#155EEF",
  },
  {
    id: "lattice",
    name: "Lattice Cryptography",
    badge: "FIPS 203 (ML-KEM)",
    detail: "High-dimensional geometric lattices provide post-quantum key establishment resistant to both classical and quantum attacks.",
    x: 395,
    y: 105,
    color: "#059669",
  },
  {
    id: "signatures",
    name: "Digital Signatures",
    badge: "FIPS 204 (ML-DSA)",
    detail: "Authentication that verifies integrity and identity without relying on vulnerable discrete logarithms.",
    x: 410,
    y: 360,
    color: "#155EEF",
  },
  {
    id: "symmetric",
    name: "Symmetric Ciphers",
    badge: "AES-256",
    detail: "Grover's algorithm gives quadratic speedup; 256-bit symmetric keys retain at least 128 bits of quantum security.",
    x: 70,
    y: 350,
    color: "#059669",
  },
];

export function QuantumShieldHeroVisual() {
  const [activeNode, setActiveNode] = useState<string>("lattice");
  const selectedConcept = NODES.find((n) => n.id === activeNode) ?? NODES[1];

  return (
    <div
      className="relative w-full max-w-[520px] mx-auto select-none"
      role="region"
      aria-label="Quantum Cryptography and Post-Quantum Security interactive visualization"
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-action/5 via-sky-200/20 to-emerald-200/15 blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative rounded-3xl border border-ink/8 bg-white/70 backdrop-blur-md p-4 sm:p-6 shadow-[0_16px_40px_-8px_rgba(11,31,58,0.07)]">
        {/* Top visual header indicator */}
        <div className="flex items-center justify-between pb-3 border-b border-ink/8 text-xs font-semibold text-muted">
          <span className="inline-flex items-center gap-1.5 text-action">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Post-Quantum Cryptographic Model
          </span>
          <span className="text-[11px] font-mono tracking-tight text-ink/60">NIST FIPS 203 / 204</span>
        </div>

        {/* Central Graphic (SVG) */}
        <div className="relative aspect-square max-w-[420px] mx-auto my-2">
          <svg
            viewBox="0 0 480 480"
            className="w-full h-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#155EEF" stopOpacity="0.12" />
                <stop offset="50%" stopColor="#059669" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#155EEF" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#155EEF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="coreGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#155EEF" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <filter id="subtleBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>

            {/* Background circular lattice guides */}
            <circle cx="240" cy="240" r="210" fill="none" stroke="#0B1F3A" strokeOpacity="0.04" strokeWidth="1" />
            <circle cx="240" cy="240" r="160" fill="none" stroke="#155EEF" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="240" cy="240" r="110" fill="none" stroke="#059669" strokeOpacity="0.1" strokeWidth="1" />

            {/* Orbiting ring with subtle CSS rotation */}
            <g className="animate-orbit" style={{ transformOrigin: "240px 240px" }}>
              <ellipse
                cx="240"
                cy="240"
                rx="185"
                ry="80"
                fill="none"
                stroke="url(#orbitGrad)"
                strokeWidth="1.25"
                strokeDasharray="6 8"
                transform="rotate(-28 240 240)"
              />
              <circle cx="90" cy="200" r="4.5" fill="#155EEF" />
              <circle cx="390" cy="280" r="4.5" fill="#059669" />
            </g>

            {/* Counter-orbital ring */}
            <g className="animate-orbit" style={{ transformOrigin: "240px 240px", animationDirection: "reverse", animationDuration: "64s" }}>
              <ellipse
                cx="240"
                cy="240"
                rx="195"
                ry="75"
                fill="none"
                stroke="#155EEF"
                strokeOpacity="0.18"
                strokeWidth="1"
                transform="rotate(35 240 240)"
              />
              <circle cx="240" cy="45" r="3.5" fill="#155EEF" opacity="0.7" />
            </g>

            {/* Central Quantum Shield Structure */}
            <path
              d="M 240 70 L 330 115 L 330 250 C 330 330, 240 395, 240 405 C 240 395, 150 330, 150 250 L 150 115 Z"
              fill="url(#shieldGrad)"
              stroke="#155EEF"
              strokeWidth="1.75"
              strokeOpacity="0.75"
            />

            {/* Inner Shield Layer */}
            <path
              d="M 240 95 L 310 132 L 310 242 C 310 308, 240 362, 240 370 C 240 362, 170 308, 170 242 L 170 132 Z"
              fill="#FFFFFF"
              fillOpacity="0.4"
              stroke="#059669"
              strokeWidth="1.25"
              strokeOpacity="0.4"
            />

            {/* Lattice Geometry Lines inside Shield */}
            <g stroke="#0B1F3A" strokeOpacity="0.12" strokeWidth="1">
              <line x1="240" y1="95" x2="240" y2="370" />
              <line x1="170" y1="180" x2="310" y2="180" />
              <line x1="180" y1="240" x2="300" y2="240" />
              <line x1="200" y1="300" x2="280" y2="300" />
              <line x1="170" y1="132" x2="310" y2="242" />
              <line x1="310" y1="132" x2="170" y2="242" />
            </g>

            {/* Center Core Node (Cryptographic Nucleus) */}
            <circle cx="240" cy="225" r="28" fill="#FFFFFF" stroke="#155EEF" strokeWidth="2" filter="url(#subtleBlur)" opacity="0.3" />
            <circle cx="240" cy="225" r="22" fill="#FFFFFF" stroke="#155EEF" strokeWidth="2.5" />
            <circle cx="240" cy="225" r="14" fill="url(#coreGlow)" className="animate-pulse-subtle" />

            {/* Interconnecting dynamic lines between outer concept nodes and shield */}
            {NODES.map((node) => {
              const isSelected = node.id === activeNode;
              return (
                <line
                  key={`line-${node.id}`}
                  x1={node.x + 35}
                  y1={node.y + 15}
                  x2={240}
                  y2={225}
                  stroke={node.color}
                  strokeWidth={isSelected ? 1.75 : 1}
                  strokeOpacity={isSelected ? 0.45 : 0.12}
                  strokeDasharray={isSelected ? "none" : "3 4"}
                />
              );
            })}
          </svg>

          {/* Interactive HTML Node Badges positioned over the SVG */}
          {NODES.map((node) => {
            const isSelected = node.id === activeNode;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setActiveNode(node.id)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action rounded-xl ${
                  isSelected
                    ? "scale-105 z-20 shadow-md ring-2 ring-action/50 bg-white"
                    : "scale-95 hover:scale-100 z-10 bg-white/95 hover:bg-white hover:shadow-sm"
                }`}
                style={{
                  left: `${(node.x / 480) * 100}%`,
                  top: `${(node.y / 480) * 100}%`,
                }}
                aria-pressed={isSelected}
                aria-label={`${node.name}: ${node.badge}`}
              >
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-ink/10">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: node.color }}
                  />
                  <div className="leading-tight">
                    <p className="text-[11px] font-bold text-ink whitespace-nowrap">{node.name}</p>
                    <p className="text-[10px] font-mono text-muted whitespace-nowrap">{node.badge}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Concept Explanation Panel */}
        <div
          className="mt-2 rounded-2xl border border-ink/8 bg-canvas-subtle p-3.5 sm:p-4 transition-all duration-200"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            {selectedConcept.id === "lattice" && (
              <ShieldCheck size={20} className="text-emerald-600 flex-shrink-0" weight="fill" />
            )}
            {selectedConcept.id === "superposition" && (
              <Cpu size={20} className="text-action flex-shrink-0" weight="fill" />
            )}
            {selectedConcept.id === "signatures" && (
              <Key size={20} className="text-action flex-shrink-0" weight="fill" />
            )}
            {selectedConcept.id === "symmetric" && (
              <Waves size={20} className="text-emerald-600 flex-shrink-0" weight="fill" />
            )}
            <h3 className="font-heading text-sm font-semibold text-ink">
              {selectedConcept.name}
            </h3>
            <span className="ml-auto text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-white border border-ink/10 text-muted">
              {selectedConcept.badge}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            {selectedConcept.detail}
          </p>
        </div>

        {/* Educational caption */}
        <p className="mt-3 text-center text-[11px] text-muted/80">
          Click any cryptographic node to see how quantum computing transforms digital defenses.
        </p>
      </div>
    </div>
  );
}
