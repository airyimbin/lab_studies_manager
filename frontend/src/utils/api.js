// src/utils/api.js
const API_BASE = import.meta.env.DEV
  ? "/api"
  : (import.meta.env.VITE_API_BASE || "/api");

// --- GET helper ---
export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // ✅ sends cookies (JWT)
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    void e;
  }

  if (!res.ok) {
    const msg =
      data?.error ||
      data?.message ||
      `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data;
}

// --- JSON (POST/PUT/DELETE) helper ---
export async function apiJson(path, method, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ✅ sends cookies (JWT)
    body: JSON.stringify(body),
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    void e;
  }

  if (!res.ok) {
    const msg =
      data?.error ||
      data?.message ||
      `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data;
}
