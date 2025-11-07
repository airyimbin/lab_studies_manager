import React, { useState, useEffect } from "react";
import NavBar from "./components/NavBar";

// Pages
import Dashboard from "./components/Dashboard";
import ParticipantsList from "./components/ParticipantsList";
import StudiesList from "./components/StudiesList";
import SessionsList from "./components/SessionsList";
import Login from "./components/Login";
import Signup from "./components/Signup";

// Detail Pages
import ParticipantDetail from './components/ParticipantDetail'
import StudyDetail from './components/StudiesDetail'
import SessionsDetail from "./components/SessionsDetail";

import { AuthProvider, useAuth } from "./authContext";

export default function App() {
  const [path, setPath] = useState(window.location.hash.slice(1) || "/");

  useEffect(() => {
    const update = () => setPath(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  const navigate = (to) => {
    window.location.hash = to;
  };

  return (
    <AuthProvider>
      <AppRoutes path={path} navigate={navigate} />
    </AuthProvider>
  );
}

function AppRoutes({ path, navigate }) {
  const { user, loading } = useAuth();

  // Wait until /auth/me check completes
  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;

  // Redirect logged-in users away from login/signup
  if (user && (path === "/login" || path === "/signup")) {
    navigate("/");
    return null;
  }

  // Public routes
  if (path === "/login") return <Login navigate={navigate} />;
  if (path === "/signup") return <Signup navigate={navigate} />;

  // If NOT logged in, redirect to login
  if (!user) {
    navigate("/login");
    return null;
  }

  // ✅ Detail Pages (match `/route/:id`)
  if (path.startsWith("/participants/")) {
    const id = path.split("/")[2];
    return <ParticipantDetail id={id} navigate={navigate} />;
  }

  if (path.startsWith("/studies/")) {
    const id = path.split("/")[2];
    return <StudyDetail id={id} navigate={navigate} />;
  }

  if (path.startsWith("/sessions/")) {
    const id = path.split("/")[2];
    return <SessionsDetail id={id} navigate={navigate} />;
  }

  // ✅ Main protected pages (lists / dashboard)
  return (
    <>
      <NavBar currentPath={path} onNavigate={navigate} />
      {path === "/" && <Dashboard navigate={navigate} />}
      {path === "/participants" && <ParticipantsList navigate={navigate} />}
      {path === "/studies" && <StudiesList navigate={navigate} />}
      {path === "/sessions" && <SessionsList navigate={navigate} />}
      {/* Fallback: redirect unknown routes */}
      {!["/", "/participants", "/studies", "/sessions"].includes(path) &&
        navigate("/")}
    </>
  );
}
