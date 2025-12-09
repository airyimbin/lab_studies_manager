import React from "react";
import PropTypes from "prop-types";
import NewParticipantModal from "./NewParticipantModal";

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

        <div className="flex flex-col gap-2 md:items-end">
          <div className="flex flex-wrap items-end gap-3 md:flex-nowrap">
            <input
              className="flex-1 min-w-[220px] border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 outline-none md:max-w-xs"
              placeholder="Search participants..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />

            <label
              htmlFor="participants-sort"
              className="flex flex-col text-xs font-semibold text-gray-600"
            >
              Sort
              <select
                id="participants-sort"
                className="mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 outline-none"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm font-medium shadow hover:bg-indigo-700"
              style={{ paddingTop: "10px", paddingBottom: "8px", borderBottomWidth: "1px" }}
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

      <NewParticipantModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreated={reload}
      />
    </div>
  );
}

ParticipantsList.propTypes = {
  navigate: PropTypes.func,
};
