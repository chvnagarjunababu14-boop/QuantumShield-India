import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { usePageTitle } from "./usePageTitle";

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { signIn, signUp, isConfigured } = useAuth();
  const navigate = useNavigate();

  usePageTitle(mode === "signin" ? "Sign In — QuantumShield India" : "Create Account — QuantumShield India");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFormError("Please enter your email address.");
      return;
    }
    if (!password) {
      setFormError("Please enter your password.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        const res = await signIn(trimmedEmail, password);
        if (res.success) {
          navigate("/learning");
        } else {
          setFormError(res.error || "Invalid email or password.");
        }
      } else {
        const res = await signUp(trimmedEmail, password, displayName);
        if (res.success) {
          navigate("/learning");
        } else {
          setFormError(res.error || "Unable to create account. Please try again.");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main id="main" className="mx-auto w-full max-w-xl px-5 py-12 sm:px-8">
      <div className="rounded-lg border border-ink/10 bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="font-heading text-3xl font-semibold text-ink">
          {mode === "signin" ? "Sign in to your account" : "Create your learner account"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          All lessons on QuantumShield India are free and publicly accessible without an account.
          Sign in to save your lesson progress, manage bookmarks, and record quiz results.
        </p>

        {!isConfigured && (
          <div
            role="status"
            className="mt-6 rounded-md border border-action/30 bg-canvas/40 p-4 text-sm leading-relaxed text-ink"
          >
            <p className="font-semibold text-action">InsForge BaaS Configuration Notice</p>
            <p className="mt-1">
              Live authentication and PostgreSQL persistence require configuring an InsForge project.
              Set <code className="rounded bg-white/70 px-1 py-0.5 font-mono text-xs">VITE_INSFORGE_BASE_URL</code> and{" "}
              <code className="rounded bg-white/70 px-1 py-0.5 font-mono text-xs">VITE_INSFORGE_ANON_KEY</code> in your{" "}
              <code className="rounded bg-white/70 px-1 py-0.5 font-mono text-xs">.env</code> file.
            </p>
          </div>
        )}

        <div className="mt-6 flex border-b border-ink/10" role="tablist" aria-label="Authentication modes">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signin"}
            className={`min-h-11 flex-1 border-b-2 px-4 py-2 font-semibold text-sm transition-colors ${
              mode === "signin"
                ? "border-action text-action font-bold"
                : "border-transparent text-muted hover:text-ink"
            }`}
            onClick={() => {
              setMode("signin");
              setFormError(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            className={`min-h-11 flex-1 border-b-2 px-4 py-2 font-semibold text-sm transition-colors ${
              mode === "signup"
                ? "border-action text-action font-bold"
                : "border-transparent text-muted hover:text-ink"
            }`}
            onClick={() => {
              setMode("signup");
              setFormError(null);
            }}
          >
            Create Account
          </button>
        </div>

        {formError && (
          <div
            role="alert"
            tabIndex={-1}
            className="mt-6 rounded-md border border-danger/20 bg-danger/10 p-4 text-sm font-medium text-danger focus:outline-none focus:ring-2 focus:ring-danger"
          >
            <p>{formError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5" noValidate>
          {mode === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="auth-display-name" className="font-semibold text-sm text-ink">
                Display name (optional)
              </label>
              <input
                id="auth-display-name"
                name="displayName"
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Radhika Sharma"
                className="min-h-11 rounded-md border border-ink/20 bg-surface px-3 py-2 text-ink placeholder:text-muted/60 focus:border-action focus:outline-none focus:ring-2 focus:ring-action"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-email" className="font-semibold text-sm text-ink">
              Email address
            </label>
            <input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="min-h-11 rounded-md border border-ink/20 bg-surface px-3 py-2 text-ink placeholder:text-muted/60 focus:border-action focus:outline-none focus:ring-2 focus:ring-action"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-password" className="font-semibold text-sm text-ink">
              Password
            </label>
            <input
              id="auth-password"
              name="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="min-h-11 rounded-md border border-ink/20 bg-surface px-3 py-2 text-ink placeholder:text-muted/60 focus:border-action focus:outline-none focus:ring-2 focus:ring-action"
            />
            {mode === "signup" && (
              <span className="text-xs text-muted">Must be at least 6 characters.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="button-primary mt-2 flex min-h-11 items-center justify-center font-semibold disabled:opacity-70"
          >
            {isSubmitting
              ? mode === "signin"
                ? "Signing in..."
                : "Creating account..."
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Looking for lessons?{" "}
          <Link to="/explore" className="text-link font-medium">
            Browse public catalogue
          </Link>
        </p>
      </div>
    </main>
  );
}
