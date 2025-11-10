// src/components/ProtectedRoute.jsx
import React from "react"; // ✅ required for JSX in this file
import { useAuth } from "../authContext.jsx";
import PropTypes from "prop-types";

export default function ProtectedRoute({ children, navigate }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="p-6 text-gray-500">Checking login…</p>;
  if (!user) {
    navigate("/login");
    return null;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  navigate: PropTypes.func.isRequired,
};
