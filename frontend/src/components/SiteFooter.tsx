import { Link } from "react-router-dom";
import { BrandMark } from "./BrandMark";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/8 bg-white/60 text-sm text-muted">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand & Purpose */}
          <div className="space-y-4">
            <BrandMark />
            <p className="max-w-[42ch] text-xs leading-relaxed text-muted">
              QuantumShield India is an open cybersecurity education platform dedicated to
              post-quantum cryptography, cryptographic agility, and foundational digital defense.
            </p>
            <p className="text-[11px] font-mono text-ink/60">
              Post-Quantum Standards: NIST FIPS 203, 204, 205
            </p>
          </div>

          {/* Curriculum Links */}
          <div>
            <p className="font-heading text-xs font-semibold uppercase tracking-wider text-ink">
              Curriculum
            </p>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link to="/topics" className="hover:text-action transition-colors">
                  Topic Discovery Hub
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-action transition-colors">
                  All Lessons
                </Link>
              </li>
              <li>
                <Link to="/explore?topic=cryptography" className="hover:text-action transition-colors">
                  Post-Quantum Cryptography
                </Link>
              </li>
              <li>
                <Link to="/explore?topic=quantum-computing" className="hover:text-action transition-colors">
                  Quantum Computing
                </Link>
              </li>
              <li>
                <Link to="/explore?topic=cybersecurity" className="hover:text-action transition-colors">
                  Cybersecurity Fundamentals
                </Link>
              </li>
              <li>
                <Link to="/explore?topic=cloud-and-iot" className="hover:text-action transition-colors">
                  Cloud & IoT Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Practice & Tools */}
          <div>
            <p className="font-heading text-xs font-semibold uppercase tracking-wider text-ink">
              Interactive Tools
            </p>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link to="/simulator" className="hover:text-action transition-colors">
                  Quantum Threat Simulator
                </Link>
              </li>
              <li>
                <Link to="/lessons/post-quantum-cryptography" className="hover:text-action transition-colors">
                  Interactive NIST Quizzes
                </Link>
              </li>
              <li>
                <Link to="/lessons/cybersecurity-fundamentals" className="hover:text-action transition-colors">
                  CIA Triad Foundations
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <p className="font-heading text-xs font-semibold uppercase tracking-wider text-ink">
              Platform
            </p>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link to="/community" className="hover:text-action transition-colors">
                  Global Community
                </Link>
              </li>
              <li>
                <Link to="/learning" className="hover:text-action transition-colors">
                  Learner Dashboard
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-action transition-colors">
                  Sign In / Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Educational Notice */}
        <div className="mt-10 border-t border-ink/8 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-muted/80">
          <p className="max-w-2xl leading-relaxed">
            QuantumShield India is an open educational project. Lessons, simulations, and quizzes are designed
            for conceptual understanding and do not constitute security audits, compliance certifications, or commercial security guarantees.
          </p>
          <p className="whitespace-nowrap text-[11px] font-mono">
            © 2026 QuantumShield India
          </p>
        </div>
      </div>
    </footer>
  );
}
