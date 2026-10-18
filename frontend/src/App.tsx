import { BrandMark } from "./components/BrandMark";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { useHealthStatus } from "./hooks/useHealthStatus";

export default function App() {
  const { snapshot, retry } = useHealthStatus();

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="mx-auto flex w-full max-w-2xl items-center px-5 py-5 sm:px-8">
        <BrandMark />
      </header>
      <main id="main" className="mx-auto w-full max-w-2xl px-5 pb-16 sm:px-8">
        <p className="text-sm font-semibold tracking-wide text-action">Public learning platform</p>
        <h1 className="mt-3 font-heading text-[2rem] leading-tight font-semibold tracking-tight sm:text-5xl">
          Learn cybersecurity and emerging technology together.
        </h1>
        <p className="mt-5 text-lg leading-relaxed">
          QuantumShield India is a public place to study cybersecurity, quantum computing,
          post-quantum cryptography, and other emerging technologies, then discuss what you learn
          with a global community.
        </p>
        <p className="mt-3 text-base leading-relaxed text-muted">
          This release is the foundation: the learning site and a live check of its service.
          Structured lessons, quizzes, the quantum-threat simulator, accounts, and discussion rooms
          are planned for later releases.
        </p>
        <div className="mt-8">
          <ConnectionStatus snapshot={snapshot} onRetry={retry} />
        </div>
      </main>
      <footer className="mx-auto w-full max-w-2xl px-5 pb-10 text-sm leading-relaxed text-muted sm:px-8">
        QuantumShield India is an educational project for learners. It does not issue
        certifications.
      </footer>
    </div>
  );
}
