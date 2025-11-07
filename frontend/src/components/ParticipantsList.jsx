import React from "react";
import PropTypes from "prop-types";
import { apiJson } from "../utils/api";

const pageSize = 24;

const sortOptions = [
  { value: "recent", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name A-Z" },
  { value: "externalId", label: "External ID" },
];

function useParticipants() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/participants");
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error("Failed to load participants", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/participants");
        const d = await res.json();
        if (active) {
          setData(d);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load participants", err);
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [fetchData]);

  return { data, loading, reload: fetchData };
}

function initials(name) {
  if (!name) return "P";
  const parts = name.split(" ").slice(0, 2).map(word => word[0] || "");
  const result = parts.join("").toUpperCase();
  return result || "P";
}

function Avatar({ name }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white font-semibold shadow-soft">
      {initials(name)}
    </div>
  );
}

Avatar.propTypes = {
  name: PropTypes.string,
};

export default function ParticipantsList({ navigate }) {
  const { data, loading, reload } = useParticipants();
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState("recent");
  const [page, setPage] = React.useState(1);
  const [showNew, setShowNew] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", notes: "" });
  const [error, setError] = React.useState(null);

  const handleSelect = React.useCallback(
    (id) => {
      if (!id) return;
      if (typeof navigate === "function") {
        navigate(`/participants/${id}`);
        return;
      }
      if (typeof window !== "undefined") {
        window.location.hash = `/participants/${id}`;
      }
    },
    [navigate]
  );

  const filtered = React.useMemo(() => {
    if (!data) return [];
    if (!q.trim()) return data;
    const s = q.toLowerCase();
    return data.filter(p =>
      (p.name && p.name.toLowerCase().includes(s)) ||
      (p.email && p.email.toLowerCase().includes(s)) ||
      (p.externalId && p.externalId.toLowerCase().includes(s))
    );
  }, [data, q]);

  const sorted = React.useMemo(() => {
    if (!filtered) return [];
    const sorter = {
      recent: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      oldest: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
      name: (a, b) => (a.name || "").localeCompare(b.name || ""),
      externalId: (a, b) => (a.externalId || "").localeCompare(b.externalId || ""),
    }[sort];
    return sorter ? [...filtered].sort(sorter) : filtered;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const currentItems = sorted.slice(startIndex, startIndex + pageSize);

  React.useEffect(() => {
    setPage(1);
  }, [q, sort]);

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="min-h-screen w-full px-6 py-8 mx-auto max-w-7xl">
      <div className="flex flex-col gap-3 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Participants</h1>
          <p className="text-sm text-gray-600 mt-1">View all study participants</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <input
            className="w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 outline-none"
            placeholder="Search participants..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />

          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 outline-none"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm font-medium shadow hover:bg-indigo-700"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 4v12m6-6H4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>New Participant</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-5 rounded-xl bg-white border border-gray-200 shadow">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-3 w-2/3 bg-gray-200 rounded mt-4 animate-pulse" />
              <div className="h-3 w-1/3 bg-gray-200 rounded mt-2 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {!loading && sorted.length === 0 && (
        <div className="text-center p-10 mx-auto max-w-md rounded-xl bg-white border border-gray-200 shadow">
          <p className="text-lg font-medium text-gray-700">No participants found</p>
          <p className="text-sm text-gray-500 mt-1">Try a different search term.</p>
        </div>
      )}

      {!loading && sorted.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {currentItems.map(p => (
            <button
              key={p._id}
              onClick={() => handleSelect(p._id)}
              className="text-left p-5 rounded-xl bg-white border border-gray-200 shadow hover:shadow-lg hover:-translate-y-0.5 transition"
            >
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={p.name || p.externalId} />
                <div>
                  <div className="font-semibold text-gray-900 truncate">
                    {p.name || p.externalId || p._id}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {p.email || "No email"}
                  </div>
                </div>
              </div>

              {p.phone && (
                <div className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                  📞 {p.phone}
                </div>
              )}
              {p.createdAt && (
                <div className="text-xs text-gray-500">
                  Joined {new Date(p.createdAt).toLocaleDateString()}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

    {!loading && sorted.length > pageSize && (
        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="rounded border border-gray-300 px-3 py-1 disabled:opacity-50"
            disabled={safePage === 1}
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {safePage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="rounded border border-gray-300 px-3 py-1 disabled:opacity-50"
            disabled={safePage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowNew(false)} />
          <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900">New Participant</h2>
            <p className="text-sm text-gray-500 mt-1">Create a new participant record.</p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setSubmitting(true);
                try {
                  const payload = {
                    name: form.name || null,
                    email: form.email || null,
                    phone: form.phone || null,
                    notes: form.notes || null,
                  };
                  await apiJson("/participants", "POST", payload);
                  await reload();
                  setShowNew(false);
                  setForm({ name: "", email: "", phone: "", notes: "" });
                } catch (err) {
                  console.error(err);
                  setError(err.message || "Failed to create participant");
                } finally {
                  setSubmitting(false);
                }
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="block text-xs text-gray-600">Full name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
                  placeholder="Jane Doe" required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600">Email</label>
                  <input
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
                    placeholder="jane@example.com" required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Phone</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
                    placeholder="(555) 012-3456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
                  rows={3}
                />
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="rounded-md px-3 py-2 text-sm border border-gray-300"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700"
                  disabled={submitting}
                >
                  {submitting ? "Saving…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

ParticipantsList.propTypes = {
  navigate: PropTypes.func,
};
