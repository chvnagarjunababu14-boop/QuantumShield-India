export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)] lg:py-20">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-accent">
          Phase 1 · Foundation
        </p>
        <h1
          id="hero-heading"
          className="font-display mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl"
        >
          Prepare Today for a Quantum-Safe Tomorrow.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          QuantumShield India is a learning platform for quantum-related cryptographic risk.
          It is being built to help people understand how quantum computing could affect
          today&apos;s public-key cryptography and prepare for a move to post-quantum cryptography.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#platform-overview"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-accent px-5 text-sm font-semibold text-navy-950 hover:bg-white"
          >
            Explore the Platform
          </a>
          <a
            href="#system-status"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line px-5 text-sm font-semibold text-mist hover:border-blue-accent hover:text-white"
          >
            View system status
          </a>
        </div>
      </div>

      <aside className="rounded-2xl border border-line bg-navy-900/80 p-6">
        <h2 className="font-display text-lg font-semibold text-white">Included in this phase</h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
          <li className="border-l-2 border-cyan-accent/70 pl-3">Application shell and navigation</li>
          <li className="border-l-2 border-blue-accent/70 pl-3">Live check of the local API</li>
          <li className="border-l-2 border-violet-accent/70 pl-3">Preview of planned capabilities</li>
        </ul>
        <p className="mt-5 text-sm leading-6 text-muted">
          Inventory analysis, threat simulation, readiness scoring, and quizzes are not part of
          this release.
        </p>
      </aside>
    </section>
  );
}
