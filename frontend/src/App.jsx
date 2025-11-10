import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import NavBar from "./components/NavBar";
import Dashboard from "./components/Dashboard";
import ParticipantsList from "./components/ParticipantsList";
import ParticipantsDetail from "./components/ParticipantDetail";
import StudiesList from "./components/StudiesList";
import StudiesDetail from "./components/StudiesDetail";
import SessionsList from "./components/SessionsList";
import SessionsDetail from "./components/SessionsDetail";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { AuthProvider, useAuth } from "./authContext";
import Instructions from "./components/Instructions";

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

  // Wait for auth state
  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;

  // Redirect logged-in users away from login or signup
  if (user && (path === "/login" || path === "/signup")) {
    navigate("/");
    return null;
  }

  // Public routes
  if (path === "/login") return <Login navigate={navigate} />;
  if (path === "/signup") return <Signup navigate={navigate} />;

  // Protected routes
  if (!user) {
    navigate("/login");
    return null;
  }

  const isDetailRoute = (prefix) => path.startsWith(prefix + "/");

  return (
    <>
      <NavBar currentPath={path} onNavigate={navigate} />

      {path === "/" && <Dashboard navigate={navigate} />}

      {/* Participants */}
      {path === "/participants" && <ParticipantsList navigate={navigate} />}
      {isDetailRoute("/participants") && (
        <ParticipantsDetail id={path.split("/")[2]} navigate={navigate} />
      )}

      {/* Studies */}
      {path === "/studies" && <StudiesList navigate={navigate} />}
      {isDetailRoute("/studies") && (
        <StudiesDetail id={path.split("/")[2]} navigate={navigate} />
      )}

      {/* Sessions */}
      {path === "/sessions" && <SessionsList navigate={navigate} />}
      {isDetailRoute("/sessions") && (
        <SessionsDetail id={path.split("/")[2]} navigate={navigate} />
      )}

      {/* Instructions */}
      {path === "/instructions" && <Instructions navigate={navigate} />}
      {isDetailRoute("/instructions") && (
        <SessionsDetail id={path.split("/")[2]} navigate={navigate} />
      )}
    </> 
  );
}

/* ✅ FIX: define PropTypes for the right component */
AppRoutes.propTypes = {
  path: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
};
