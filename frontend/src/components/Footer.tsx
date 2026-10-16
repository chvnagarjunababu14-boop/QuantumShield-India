export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="font-display text-base font-semibold text-white">QuantumShield India</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          An educational project for understanding quantum-related cryptographic risk and preparing
          for post-quantum migration. It is not a government service, not an official certification,
          and it does not guarantee quantum safety.
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Phase 1 — Foundation
        </p>
      </div>
    </footer>
  );
}
