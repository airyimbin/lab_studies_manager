import React, { useCallback, useEffect, useState } from "react";
import NavBar from "./components/NavBar.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ParticipantsList from "./components/ParticipantsList.jsx";
import ParticipantDetail from "./components/ParticipantDetail.jsx";
import StudiesList from "./components/StudiesList.jsx";
import StudiesDetail from "./components/StudiesDetail.jsx";
import SessionsList from "./components/SessionsList.jsx";
import SessionsDetail from "./components/SessionsDetail.jsx";
import Login from "./components/Login.jsx";

const routes = [
  { path: "/", Component: Dashboard },
  { path: "/participants", Component: ParticipantsList },
  { path: "/participants/:id", Component: ParticipantDetail },
  { path: "/studies", Component: StudiesList },
  { path: "/studies/:id", Component: StudiesDetail },
  { path: "/sessions", Component: SessionsList },
  { path: "/sessions/:id", Component: SessionsDetail },
  { path: "/login", Component: Login },
];

const defaultPath = "/";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const COMPILED_ROUTES = routes.map((route) => {
  const keys = [];
  const pattern = route.path
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        keys.push(segment.slice(1));
        return "([^/]+)";
      }
      return escapeRegex(segment);
    })
    .join("/");
  const regex = new RegExp(`^${pattern}$`);
  return { ...route, regex, keys };
});

function normalizePath(path) {
  if (!path) return defaultPath;
  return path.startsWith("/") ? path : `/${path}`;
}

function matchRoute(path) {
  const normalized = normalizePath(path);
  for (const route of COMPILED_ROUTES) {
    const match = normalized.match(route.regex);
    if (match) {
      const params = {};
      route.keys.forEach((key, index) => {
        params[key] = match[index + 1];
      });
      return { path: normalized, route, params };
    }
  }
  const fallback = COMPILED_ROUTES[0];
  return { path: fallback.path, route: fallback, params: {} };
}

function readHash() {
  if (typeof window === "undefined") {
    return matchRoute(defaultPath);
  }
  const raw = window.location.hash.replace(/^#/, "");
  return matchRoute(raw || defaultPath);
}

export default function App() {
  const [routeState, setRouteState] = useState(() => readHash());
  const { path: currentPath, route, params } = routeState;

  useEffect(() => {
    const handleHashChange = () => {
      setRouteState(readHash());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = useCallback(
    (path) => {
      const next = matchRoute(path);
      if (next.path === currentPath) return;
      window.location.hash = next.path;
      setRouteState(next);
    },
    [currentPath]
  );

  const ActiveComponent = route.Component;

  return (
    <>
      <NavBar currentPath={currentPath} onNavigate={navigate} />
      <main className="container">
        <ActiveComponent {...params} />
      </main>
    </>
  );
}
