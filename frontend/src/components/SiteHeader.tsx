import { List, X } from "@phosphor-icons/react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { BrandMark } from "./BrandMark";

function navClass({ isActive }: { isActive: boolean }): string {
  return `inline-flex min-h-11 items-center rounded-md px-3 font-semibold text-ink ${isActive ? "underline decoration-2 underline-offset-8" : ""}`;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <header className="border-b border-ink/10 bg-canvas">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `inline-flex min-h-11 items-center rounded-md ${isActive ? "underline decoration-2 underline-offset-8" : ""}`
          }
          onClick={() => setOpen(false)}
        >
          <BrandMark />
        </NavLink>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 font-semibold md:hidden"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? (
            <X size={20} weight="regular" aria-hidden="true" />
          ) : (
            <List size={20} weight="regular" aria-hidden="true" />
          )}
          {open ? "Close menu" : "Menu"}
        </button>
        <nav
          id="site-nav"
          aria-label="Primary"
          className={`${open ? "absolute inset-x-0 top-[4.5rem] z-20 flex flex-col border-b border-ink/10 bg-surface px-5 py-3" : "hidden"} gap-1 md:static md:z-auto md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}
        >
          <NavLink to="/explore" className={navClass} onClick={() => setOpen(false)}>
            Explore
          </NavLink>
          <NavLink to="/community" className={navClass} onClick={() => setOpen(false)}>
            Community
          </NavLink>
          {user ? (
            <>
              <NavLink to="/learning" className={navClass} onClick={() => setOpen(false)}>
                My Learning
              </NavLink>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex min-h-11 items-center rounded-md px-3 text-left font-semibold text-ink hover:text-action cursor-pointer"
              >
                Sign Out
              </button>
              <span className="hidden md:inline-block text-xs font-semibold text-action px-2 py-1 rounded bg-action/10 max-w-[120px] truncate" title={user.email}>
                {profile?.display_name || user.displayName || user.email.split("@")[0]}
              </span>
            </>
          ) : (
            <NavLink to="/auth" className={navClass} onClick={() => setOpen(false)}>
              Sign In
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
