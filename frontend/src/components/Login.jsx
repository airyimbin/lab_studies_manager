import React, { useState } from "react";
import { apiJson } from "../utils/api";
import { useAuth } from "../authContext";

export default function Login({ navigate }) {
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      await apiJson("/auth/login", "POST", form);
      await refreshUser();                        // ✅ update auth state instantly
      navigate("/");                              // ✅ go to dashboard
    } catch (e) {
      setErr(
        e.message === "Invalid credentials"
          ? "Invalid email or password."
          : e.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back.</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
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
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="px-4 py-2 rounded-md border border-gray-300 text-sm"
            >
              Go to Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
