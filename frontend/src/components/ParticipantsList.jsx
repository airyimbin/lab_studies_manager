import React from "react";
import PropTypes from "prop-types";

function useParticipants() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    fetch("/api/participants")
      .then(r => r.json())
      .then(d => { if (active) { setData(d); setLoading(false); }});
    return () => { active = false };
  }, []);

  return { data, loading };
}

function initials(name) {
  if (!name) return "P";
  const n = name.split(" ").slice(0, 2).map(w => w[0]).join("");
  return n.toUpperCase();
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
  const { data, loading } = useParticipants();
  const [q, setQ] = React.useState("");

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

  return (
    <div className="p-6 mx-auto max-w-7xl">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Participants</h1>
          <p className="text-sm text-gray-600 mt-1">View all study participants</p>
        </div>

        <div className="mt-4 sm:mt-0">
          <input
            className="w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 outline-none"
            placeholder="Search participants..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* loading skeleton */}
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

      {/* no results */}
      {!loading && filtered.length === 0 && (
        <div className="text-center p-10 rounded-xl bg-white border border-gray-200 shadow">
          <p className="text-lg font-medium text-gray-700">No participants found</p>
          <p className="text-sm text-gray-500 mt-1">Try a different search term.</p>
        </div>
      )}

      {/* list */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(p => (
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
    </div>
  );
}

ParticipantsList.propTypes = {
  navigate: PropTypes.func,
};
