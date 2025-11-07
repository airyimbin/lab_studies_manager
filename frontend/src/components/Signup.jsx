import React, { useState } from "react";
import { apiJson } from "../utils/api";
import { useAuth } from "../authContext";

export default function Signup({ navigate }) {
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      await apiJson("/auth/signup", "POST", form);
      await refreshUser();                       // ✅ user becomes logged-in immediately
      navigate("/");                             // ✅ direct to dashboard
    } catch (e) {
      if (e.message.includes("Email already exists")) {
        setErr("An account with this email already exists.");
      } else if (e.message.includes("Name already exists")) {
        setErr("That name is already taken. Choose a different one.");
      } else {
        setErr(e.message || "Failed to create account.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Sign Up</h1>
        <p className="text-sm text-gray-500 mt-1">Create your account.</p>

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs text-gray-600">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
              required
            />
          </div>

          {err && (
            <div className="bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded text-sm">
              {err}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create Account"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-md border border-gray-300 text-sm"
            >
              Go to Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
