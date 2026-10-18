import { useState } from "react";
import { Cloud, Cpu, HardDrives, Lock, Network } from "@phosphor-icons/react";

type ArchLayer = "iot" | "network" | "platform" | "iam";
type CloudModel = "iaas" | "paas" | "saas";

export function CloudIotArchitecture() {
  const [activeLayer, setActiveLayer] = useState<ArchLayer>("iot");
  const [activeModel, setActiveModel] = useState<CloudModel>("iaas");

  return (
    <div id="interactive-lab" className="card-elevated my-10 rounded-2xl border border-ink/10 bg-white p-6 sm:p-7">
      <div className="flex items-center gap-2 border-b border-ink/8 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-800">
          <Cloud size={16} weight="fill" className="text-amber-600" />
          Cloud & IoT Systems Lab
        </span>
        <span className="text-xs text-muted">Architecture & Shared Responsibility</span>
      </div>

      <div className="mt-4">
        <h3 className="font-heading text-xl font-semibold text-ink">
          Interactive Architecture & Attack Surface Explorer
        </h3>
        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted">
          Security responsibilities shift as data moves from edge IoT sensors across networks into managed cloud environments. Click each layer to examine attack vectors and defensive measures.
        </p>
      </div>

      {/* Layer Navigation Tabs */}
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { id: "iot", label: "1. Edge IoT Devices", icon: Cpu },
          { id: "network", label: "2. Gateway & Network", icon: Network },
          { id: "platform", label: "3. Cloud Platform", icon: HardDrives },
          { id: "iam", label: "4. Customer IAM & Data", icon: Lock },
        ].map((layer) => {
          const isSelected = activeLayer === layer.id;
          const Icon = layer.icon;
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => setActiveLayer(layer.id as ArchLayer)}
              className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-action bg-action text-white shadow-xs font-semibold"
                  : "border-ink/8 bg-canvas-subtle hover:bg-slate-100 text-ink"
              }`}
            >
              <Icon size={18} weight={isSelected ? "bold" : "regular"} className="shrink-0" />
              <span className="text-xs">{layer.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Layer Attack Surface Details */}
      <div className="mt-4 rounded-xl border border-ink/10 bg-canvas-subtle p-5 text-xs">
        {activeLayer === "iot" && (
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm font-semibold text-ink">
                Edge IoT Devices (Cameras, Sensors, Smart Badges)
              </span>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                High Risk: Long Lifecycle & Default Credentials
              </span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3 border border-ink/8">
                <p className="font-bold text-red-700">Common Attack Vectors:</p>
                <ul className="mt-1 list-disc pl-4 space-y-1 text-slate-700">
                  <li>Factory default passwords printed in user manuals.</li>
                  <li>Hardcoded private keys and insecure telnet/HTTP ports.</li>
                  <li>Lack of automated over-the-air (OTA) patching.</li>
                </ul>
              </div>
              <div className="rounded-lg bg-white p-3 border border-ink/8">
                <p className="font-bold text-emerald-700">Defensive Controls:</p>
                <ul className="mt-1 list-disc pl-4 space-y-1 text-slate-700">
                  <li>Mandatory password change upon first boot.</li>
                  <li>Cryptographically signed firmware updates.</li>
                  <li>Isolate devices on a separate, firewalled IoT VLAN.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeLayer === "network" && (
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm font-semibold text-ink">
                Local Gateway & Transit Network
              </span>
              <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                Transit Boundary
              </span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3 border border-ink/8">
                <p className="font-bold text-red-700">Common Attack Vectors:</p>
                <ul className="mt-1 list-disc pl-4 space-y-1 text-slate-700">
                  <li>Unencrypted protocols (HTTP, plain MQTT) vulnerable to eavesdropping.</li>
                  <li>Exposed administrative management portals over the public internet.</li>
                  <li>Man-in-the-middle DNS spoofing attacks.</li>
                </ul>
              </div>
              <div className="rounded-lg bg-white p-3 border border-ink/8">
                <p className="font-bold text-emerald-700">Defensive Controls:</p>
                <ul className="mt-1 list-disc pl-4 space-y-1 text-slate-700">
                  <li>Mutual TLS (mTLS) authentication for device-to-cloud handshakes.</li>
                  <li>Strict outbound-only egress firewall rules.</li>
                  <li>Zero Trust network segmentation and continuous monitoring.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeLayer === "platform" && (
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm font-semibold text-ink">
                Cloud Provider Infrastructure (Platform Layer)
              </span>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                Provider Responsibility
              </span>
            </div>

            <p className="mt-2 text-slate-700 leading-relaxed">
              The cloud provider (AWS, GCP, Azure) secures the physical data centers, host virtualization hypervisors, and core platform hardware. While the provider guarantees the stability of the foundation, they do NOT configure your access policies or inspect your stored data.
            </p>

            <div className="mt-3 rounded-lg bg-white p-3 border border-ink/8 text-slate-700">
              <span className="font-semibold text-ink">Provider Guarantees: </span>
              Physical premises security, hardware redundancy, hypervisor isolation, and platform availability SLA.
            </div>
          </div>
        )}

        {activeLayer === "iam" && (
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm font-semibold text-ink">
                Customer IAM, Configuration & Data
              </span>
              <span className="rounded bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-800">
                Customer Responsibility
              </span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3 border border-ink/8">
                <p className="font-bold text-red-700">Customer Misconfigurations:</p>
                <ul className="mt-1 list-disc pl-4 space-y-1 text-slate-700">
                  <li>Storage buckets left open to the public internet.</li>
                  <li>Over-privileged IAM roles granting full administrator access.</li>
                  <li>API access keys accidentally committed to public Git repositories.</li>
                </ul>
              </div>
              <div className="rounded-lg bg-white p-3 border border-ink/8">
                <p className="font-bold text-emerald-700">Customer Defenses:</p>
                <ul className="mt-1 list-disc pl-4 space-y-1 text-slate-700">
                  <li>Principle of Least Privilege (enforcing strict RBAC policies).</li>
                  <li>Default-deny public bucket access settings.</li>
                  <li>Automated secret scanning and centralized key management (KMS).</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shared Responsibility Model Matrix */}
      <div className="mt-8 border-t border-ink/8 pt-6">
        <h4 className="font-heading text-base font-semibold text-ink">
          Interactive Shared Responsibility Matrix
        </h4>
        <p className="mt-1 text-xs text-muted">
          Toggle the cloud service delivery model to see how responsibility shifts between customer and cloud provider:
        </p>

        <div className="mt-4 flex gap-2" role="tablist">
          {[
            { id: "iaas", label: "IaaS (Virtual Machines)" },
            { id: "paas", label: "PaaS (Managed Database / App)" },
            { id: "saas", label: "SaaS (Hosted Software)" },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={activeModel === m.id}
              onClick={() => setActiveModel(m.id as CloudModel)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeModel === m.id
                  ? "bg-action text-white shadow-xs"
                  : "bg-canvas-subtle text-muted hover:text-ink border border-ink/8"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Matrix Comparison Table */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-ink/8 bg-white text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-ink/8 bg-canvas-subtle text-muted">
                <th className="p-3 font-semibold">Architectural Layer</th>
                <th className="p-3 font-semibold">Responsible Party</th>
                <th className="p-3 font-semibold">Practical Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              <tr>
                <td className="p-3 font-semibold text-ink">Data & Customer Identity</td>
                <td className="p-3"><span className="text-purple-700 font-bold">Always Customer</span></td>
                <td className="p-3 text-muted">Who can log in, what files are stored, and access permissions.</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-ink">Application Logic</td>
                <td className="p-3">
                  <span className={activeModel === "saas" ? "text-emerald-700 font-bold" : "text-purple-700 font-bold"}>
                    {activeModel === "saas" ? "Provider" : "Customer"}
                  </span>
                </td>
                <td className="p-3 text-muted">
                  {activeModel === "saas" ? "Provider builds and patches software." : "Customer writes, deploys, and patches application code."}
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-ink">Operating System & Runtime</td>
                <td className="p-3">
                  <span className={activeModel === "iaas" ? "text-purple-700 font-bold" : "text-emerald-700 font-bold"}>
                    {activeModel === "iaas" ? "Customer" : "Provider"}
                  </span>
                </td>
                <td className="p-3 text-muted">
                  {activeModel === "iaas" ? "Customer must apply security patches to VM OS." : "Provider manages runtime updates automatically."}
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-ink">Physical Data Center & Hardware</td>
                <td className="p-3"><span className="text-emerald-700 font-bold">Always Provider</span></td>
                <td className="p-3 text-muted">Physical guards, building security, servers, power, hypervisor.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
