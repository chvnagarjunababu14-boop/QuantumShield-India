import { List, Sparkle, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { BrandMark } from "./BrandMark";

function navClass({ isActive }: { isActive: boolean }): string {
  return `inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-ink transition-colors duration-150 hover:text-action hover:bg-canvas-subtle ${
    isActive ? "text-action bg-canvas-subtle underline decoration-2 underline-offset-8" : ""
  }`;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate("/");
  };

  const displayName = profile?.display_name || user?.displayName || user?.email.split("@")[0] || "";

  return (
    <header className="sticky top-0 z-30 border-b border-ink/8 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
        {/* Wordmark / Logo */}
        <NavLink
          to="/"
          end
          className="inline-flex min-h-10 items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
          onClick={() => setOpen(false)}
          aria-label="QuantumShield India home"
        >
          <BrandMark />
        </NavLink>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-ink/10 px-3 text-sm font-semibold text-ink hover:bg-canvas md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? (
            <X size={20} weight="bold" aria-hidden="true" />
          ) : (
            <List size={20} weight="bold" aria-hidden="true" />
          )}
          {open ? "Close menu" : "Menu"}
        </button>

        {/* Desktop & Mobile Navigation */}
        <nav
          id="site-nav"
          aria-label="Primary"
          className={`${
            open
              ? "absolute inset-x-0 top-[3.75rem] z-30 flex flex-col border-b border-ink/10 bg-white p-5 shadow-xl sm:px-8"
              : "hidden"
          } gap-1 md:static md:z-auto md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          <NavLink to="/explore" className={navClass} onClick={() => setOpen(false)}>
            Learning
          </NavLink>
          <NavLink to="/topics" className={navClass} onClick={() => setOpen(false)}>
            Topics
          </NavLink>
          <NavLink
            to="/simulator"
            className={navClass}
            onClick={() => setOpen(false)}
          >
            Simulator
          </NavLink>
          <NavLink to="/community" className={navClass} onClick={() => setOpen(false)}>
            Community
          </NavLink>

          <div className="my-2 h-px w-full bg-ink/10 md:hidden" />

          {/* User state and CTAs */}
          <div className="flex flex-col gap-2 md:ml-2 md:flex-row md:items-center md:gap-3">
            {user ? (
              <>
                <NavLink
                  to="/learning"
                  className={navClass}
                  onClick={() => setOpen(false)}
                >
                  My Learning
                </NavLink>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block text-xs font-semibold text-action px-2.5 py-1 rounded-full bg-action/10 max-w-[130px] truncate"
                    title={user.email}
                  >
                    {displayName}
                  </span>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex min-h-9 items-center rounded-lg px-2.5 text-xs font-semibold text-muted hover:text-ink hover:bg-canvas cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink
                  to="/auth"
                  className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-ink hover:text-action hover:bg-canvas-subtle"
                  onClick={() => setOpen(false)}
                >
                  Sign In
                </NavLink>
                <Link
                  to="/explore"
                  className="button-primary inline-flex min-h-10 items-center gap-1.5 px-4 text-sm font-semibold shadow-sm"
                  onClick={() => setOpen(false)}
                >
                  <Sparkle size={16} weight="fill" />
                  Start Learning
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
