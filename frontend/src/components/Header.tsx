import { Menu, Shield, X } from "lucide-react";
import { useState } from "react";
import type { HealthSnapshot } from "../types/health";

const NAV_ITEMS = [
  { href: "#platform-overview", label: "Platform overview" },
  { href: "#system-status", label: "System status" },
];

function statusLabel(snapshot: HealthSnapshot): string {
  if (snapshot.status === "loading") {
    return "Checking";
  }
  if (snapshot.status === "connected") {
    return "Connected";
  }
  return "Offline";
}

function statusDotClass(snapshot: HealthSnapshot): string {
  if (snapshot.status === "loading") {
    return "bg-blue-accent";
  }
  if (snapshot.status === "connected") {
    return "bg-emerald-300";
  }
  return "bg-rose-300";
}

function SystemStatus({ snapshot }: { snapshot: HealthSnapshot }) {
  const label = statusLabel(snapshot);

  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-line bg-navy-950 px-3 py-1.5 text-xs font-semibold tracking-wide text-mist">
      <span className={`h-2 w-2 rounded-full ${statusDotClass(snapshot)}`} aria-hidden="true" />
      <span className="sr-only">System status: </span>
      System {label}
    </p>
  );
}

export function Header({ snapshot }: { snapshot: HealthSnapshot }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-navy-950/90 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-30 focus:rounded-md focus:bg-navy-800 focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <a href="#main" className="flex items-center gap-3 rounded-md">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-accent/40 bg-navy-800 text-cyan-accent">
            <Shield className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight text-white sm:text-base">
            QuantumShield <span className="text-cyan-accent">India</span>
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-muted hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <SystemStatus snapshot={snapshot} />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-mist md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            <span className="sr-only">{menuOpen ? "Close navigation" : "Open navigation"}</span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav id="mobile-navigation" aria-label="Mobile" className="border-t border-line px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm font-semibold text-mist hover:bg-navy-800"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
