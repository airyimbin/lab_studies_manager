import React from "react";
import PropTypes from "prop-types";

const LINKS = [
  { path: "/", label: "Dashboard" },
  { path: "/participants", label: "Participants" },
  { path: "/studies", label: "Studies" },
  { path: "/sessions", label: "Sessions" },
  { path: "/login", label: "Login" },
];

export default function NavBar({ currentPath = "/", onNavigate = () => {} }) {
  return (
    <header className="navbar">
      <div className="navbar__brand">VisionLab</div>
      <nav className="navbar__links">
        {LINKS.map(({ path, label }) => {
          const isActive =
            currentPath === path || (path !== "/" && currentPath.startsWith(`${path}/`));
          return (
            <a
              key={path}
              href={`#${path}`}
              className={isActive ? "is-active" : ""}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(path);
              }}
            >
              {label}
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
