// src/components/ProtectedRoute.jsx
import { useAuth } from "../authContext.jsx";

export default function ProtectedRoute({ children, navigate }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="p-6 text-gray-500">Checking login…</p>;
  if (!user) {
    navigate("/login");
    return null;
  }

  return children;
}
