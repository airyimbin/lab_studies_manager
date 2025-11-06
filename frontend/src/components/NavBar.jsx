import React from "react";
import PropTypes from "prop-types";

const LINKS = [
  { path: "/", label: "Dashboard" },
  { path: "/participants", label: "Participants" },
  { path: "/studies", label: "Studies" },
  { path: "/sessions", label: "Sessions" },
  { path: "/login", label: "Login" },
];

const baseLinkClasses =
  "group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-all duration-200 sm:px-5 sm:py-2.5";
const focusRingClasses =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";
const activeLinkClasses =
  "bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-slate-900 shadow-[0_18px_40px_-22px_rgba(99,102,241,0.9)]";
const inactiveLinkClasses =
  "bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white hover:-translate-y-0.5";

export default function NavBar({ currentPath = "/", onNavigate = () => {} }) {
  return (
    <header className="navbar relative sticky top-0 z-50 flex flex-col gap-4 overflow-hidden border-b border-white/10 bg-slate-950/70 px-6 py-4 text-slate-100 shadow-[0_35px_60px_-35px_rgba(15,23,42,0.9)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-transparent to-fuchsia-500/20" aria-hidden />

      <div className="navbar__brand relative z-10 flex items-center gap-3 text-lg font-semibold tracking-tight text-white">
        <span>Lab Studies Manager</span>
        <span
          className="inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-br from-indigo-400 via-sky-400 to-fuchsia-400 shadow-[0_0_14px_rgba(129,140,248,0.8)]"
          aria-hidden
        />
      </div>

      <nav className="navbar__links no-scrollbar relative z-10 flex items-center gap-2 overflow-x-auto pb-1 text-sm text-slate-200 sm:gap-3">
        {LINKS.map(({ path, label }) => {
          const isActive =
            currentPath === path || (path !== "/" && currentPath.startsWith(`${path}/`));
          return (
            <a
              key={path}
              href={`#${path}`}
              className={`${baseLinkClasses} ${focusRingClasses} ${
                isActive ? activeLinkClasses : inactiveLinkClasses
              }`}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(path);
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className="absolute inset-0 bg-white/20 opacity-0 transition duration-200 group-hover:opacity-40"
                aria-hidden
              />
              <span className="relative z-10">{label}</span>
            </a>
          );
        })}
      </nav>
    </header>
  );
}

NavBar.propTypes = {
  currentPath: PropTypes.string,
  onNavigate: PropTypes.func,
};
