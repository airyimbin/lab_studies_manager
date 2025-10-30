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
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white";
const activeLinkClasses =
  "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-200/60";
const inactiveLinkClasses =
  "bg-white text-slate-600 hover:text-slate-900 hover:bg-indigo-50 hover:shadow-sm";

export default function NavBar({ currentPath = "/", onNavigate = () => {} }) {
  return (
    <header className="navbar relative sticky top-0 z-50 flex flex-col gap-4 overflow-hidden border-b border-slate-200 bg-white/90 px-6 py-4 text-slate-700 shadow-[0_15px_45px_-28px_rgba(15,23,42,0.35)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-200/40 via-white to-fuchsia-200/40" aria-hidden />

      <div className="navbar__brand relative z-10 flex items-center gap-3 text-lg font-semibold tracking-tight text-slate-900">
        <span>Lab Studies Manager</span>
        <span
          className="inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-br from-indigo-500 via-sky-400 to-fuchsia-500 shadow-[0_0_12px_rgba(99,102,241,0.55)]"
          aria-hidden
        />
      </div>

      <nav className="navbar__links no-scrollbar relative z-10 flex items-center gap-2 overflow-x-auto pb-1 text-sm text-slate-600 sm:gap-3">
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
              }}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-fuchsia-500/20 opacity-0 transition duration-200 group-hover:opacity-100" aria-hidden />
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
