import React, { useState } from "react";
import { apiJson } from "../utils/api";

export default function Signup({ navigate }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await apiJson("/auth/signup", "POST", form);
      setSuccessMsg("Account created! Please sign in.");
      setTimeout(() => navigate("/login"), 1200); // redirect after short delay
    } catch (e) {
      const msg = e.message.includes("409")
        ? "This email or username is already in use."
        : "Could not create your account.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Sign Up</h1>
        <p className="text-sm text-gray-500 mt-1">Create your account.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs text-gray-600">Name</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required
            />
          </div>

          {err && <div className="text-sm text-red-600">{err}</div>}
          {successMsg && <div className="text-sm text-green-600">{successMsg}</div>}

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
