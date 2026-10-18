import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { usePageTitle } from "./usePageTitle";

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const paramMode = searchParams.get("mode");
  const initialMode =
    paramMode === "signup"
      ? "signup"
      : paramMode === "verify"
        ? "verify"
        : "signin";

  const [mode, setMode] = useState<"signin" | "signup" | "verify">(initialMode);
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otp, setOtp] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signIn, signUp, verifyEmail, resendVerificationCode, isConfigured } =
    useAuth();
  const navigate = useNavigate();

  // Dynamic page title per active flow
  usePageTitle(
    mode === "signin"
      ? "Sign In — QuantumShield India"
      : mode === "signup"
        ? "Create Account — QuantumShield India"
        : "Verify Email — QuantumShield India",
  );

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleSignInOrSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

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
        } else if (res.requireVerification) {
          setMode("verify");
          setOtp("");
          setFormError(
            res.error ||
              "Your email address is not verified yet. Please enter the verification code sent to your email.",
          );
        } else {
          setFormError(res.error || "Invalid email or password.");
        }
      } else {
        const res = await signUp(trimmedEmail, password, displayName);
        if (res.requireVerification) {
          setMode("verify");
          setOtp("");
          setSuccessMessage(
            "Account created! We've sent a 6-digit verification code to your email address.",
          );
          setResendCooldown(60);
        } else if (res.success) {
          navigate("/learning");
        } else {
          setFormError(
            res.error ||
              "Unable to create account. Please check your details and try again.",
          );
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setFormError("Please enter the 6-digit verification code.");
      return;
    }
    if (cleanOtp.length !== 6) {
      setFormError("The verification code must be exactly 6 digits.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await verifyEmail(email.trim(), cleanOtp);
      if (res.success) {
        setSuccessMessage("Email verified successfully! Redirecting...");
        setTimeout(() => {
          navigate("/learning");
        }, 500);
      } else {
        setFormError(
          res.error ||
            "The verification code is invalid or has expired. Please check your code or request a new one.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFormError("Email address is missing. Please return to sign up.");
      return;
    }

    setIsResending(true);
    setFormError(null);

    try {
      const res = await resendVerificationCode(trimmedEmail);
      if (res.success) {
        setSuccessMessage(
          res.message ||
            "A new 6-digit verification code has been sent to your email.",
        );
        setResendCooldown(60);
      } else {
        setFormError(
          res.error ||
            "Unable to resend verification code. Please wait a moment before trying again.",
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main id="main" className="mx-auto w-full max-w-xl px-5 py-12 sm:px-8">
      <div className="rounded-lg border border-ink/10 bg-surface p-6 shadow-sm sm:p-8">
        {mode === "verify" ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-action/10 text-action font-bold text-sm">
                ✓
              </span>
              <p className="font-semibold text-action text-xs tracking-wide uppercase">
                Step 2 of 2: Email Verification
              </p>
            </div>
            <h1 className="mt-2 font-heading text-3xl font-semibold text-ink">
              Verify your email address
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              We sent a 6-digit verification code to{" "}
              <strong className="font-semibold text-ink break-all">
                {email || "your registered email"}
              </strong>
              . Enter the code below to activate your account.
            </p>
          </div>
        ) : (
          <div>
            <h1 className="font-heading text-3xl font-semibold text-ink">
              {mode === "signin"
                ? "Sign in to your account"
                : "Create your learner account"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              All lessons on QuantumShield India are free and publicly accessible
              without an account. Sign in to save your lesson progress, manage
              bookmarks, and record quiz results.
            </p>
          </div>
        )}

        {!isConfigured && (
          <div
            role="status"
            className="mt-6 rounded-md border border-action/30 bg-canvas/40 p-4 text-sm leading-relaxed text-ink"
          >
            <p className="font-semibold text-action">
              InsForge BaaS Configuration Notice
            </p>
            <p className="mt-1">
              Live authentication and PostgreSQL persistence require configuring an
              InsForge project. Set{" "}
              <code className="rounded bg-white/70 px-1 py-0.5 font-mono text-xs">
                VITE_INSFORGE_BASE_URL
              </code>{" "}
              and{" "}
              <code className="rounded bg-white/70 px-1 py-0.5 font-mono text-xs">
                VITE_INSFORGE_ANON_KEY
              </code>{" "}
              in your{" "}
              <code className="rounded bg-white/70 px-1 py-0.5 font-mono text-xs">
                .env
              </code>{" "}
              file.
            </p>
          </div>
        )}

        {mode !== "verify" && (
          <div
            className="mt-6 flex border-b border-ink/10"
            role="tablist"
            aria-label="Authentication modes"
          >
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
                setSuccessMessage(null);
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
                setSuccessMessage(null);
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mt-6 rounded-md border border-ok/30 bg-ok/10 p-4 text-sm font-medium text-ok"
          >
            <p>{successMessage}</p>
          </div>
        )}

        {formError && (
          <div
            role="alert"
            tabIndex={-1}
            className="mt-6 rounded-md border border-danger/20 bg-danger/10 p-4 text-sm font-medium text-danger focus:outline-none focus:ring-2 focus:ring-danger"
          >
            <p>{formError}</p>
          </div>
        )}

        {mode === "verify" ? (
          /* OTP Verification Form */
          <form
            onSubmit={handleVerifyOtp}
            className="mt-6 flex flex-col gap-5"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="auth-verification-code"
                className="font-semibold text-sm text-ink"
              >
                6-digit verification code
              </label>
              <input
                id="auth-verification-code"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                required
                autoFocus
                value={otp}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(cleaned);
                  if (formError) setFormError(null);
                }}
                placeholder="123456"
                aria-describedby="otp-description"
                className="min-h-12 rounded-md border border-ink/20 bg-surface px-4 py-2 text-center font-mono text-2xl font-bold tracking-widest text-ink placeholder:text-muted/40 focus:border-action focus:outline-none focus:ring-2 focus:ring-action"
              />
              <span id="otp-description" className="text-xs text-muted">
                Check your inbox for a 6-digit numeric code from InsForge.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.trim().length !== 6}
              className="button-primary mt-2 flex min-h-11 items-center justify-center font-semibold disabled:opacity-60"
            >
              {isSubmitting ? "Verifying code..." : "Verify email"}
            </button>

            <div className="mt-2 flex flex-col items-center gap-3 border-t border-ink/10 pt-4 text-center sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className="inline-flex min-h-11 items-center font-medium text-action text-sm hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
              >
                {isResending
                  ? "Resending code..."
                  : resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Resend verification code"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setFormError(null);
                  setSuccessMessage(null);
                }}
                className="inline-flex min-h-11 items-center font-medium text-muted text-sm hover:text-ink hover:underline"
              >
                Change email address
              </button>
            </div>

            <div className="mt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setFormError(null);
                  setSuccessMessage(null);
                }}
                className="font-medium text-action text-sm hover:underline"
              >
                Return to sign in
              </button>
            </div>
          </form>
        ) : (
          /* Sign In & Sign Up Forms */
          <form
            onSubmit={handleSignInOrSignUp}
            className="mt-6 flex flex-col gap-5"
            noValidate
          >
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="auth-display-name"
                  className="font-semibold text-sm text-ink"
                >
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
              <label
                htmlFor="auth-password"
                className="font-semibold text-sm text-ink"
              >
                Password
              </label>
              <input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="min-h-11 rounded-md border border-ink/20 bg-surface px-3 py-2 text-ink placeholder:text-muted/60 focus:border-action focus:outline-none focus:ring-2 focus:ring-action"
              />
              {mode === "signup" && (
                <span className="text-xs text-muted">
                  Must be at least 6 characters.
                </span>
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
        )}

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
