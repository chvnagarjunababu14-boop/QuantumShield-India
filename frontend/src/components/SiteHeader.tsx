import { List, X } from "@phosphor-icons/react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { BrandMark } from "./BrandMark";

function navClass({ isActive }: { isActive: boolean }): string {
  return `inline-flex min-h-11 items-center rounded-md px-3 font-semibold text-ink ${isActive ? "underline decoration-2 underline-offset-8" : ""}`;
}

const links = [
  { to: "/explore", label: "Explore" },
  { to: "/community", label: "Community" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-ink/10 bg-canvas">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <NavLink to="/" end className={({ isActive }) => `inline-flex min-h-11 items-center rounded-md ${isActive ? "underline decoration-2 underline-offset-8" : ""}`} onClick={() => setOpen(false)}>
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
          className={`${open ? "absolute inset-x-0 top-[4.5rem] z-20 flex flex-col border-b border-ink/10 bg-surface px-5 py-3" : "hidden"} gap-1 md:static md:z-auto md:flex md:flex-row md:border-0 md:bg-transparent md:p-0`}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={navClass}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
