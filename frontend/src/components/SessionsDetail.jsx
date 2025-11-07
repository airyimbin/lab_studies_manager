import React, { useEffect, useState } from "react";
import { apiJson } from "../utils/api";

// Colored-dot status badge
function StatusBadge({ status }) {
  const map = {
    Sch: { text: "Scheduled", dot: "bg-blue-500" },
    Scheduled: { text: "Scheduled", dot: "bg-blue-500" },
    Completed: { text: "Completed", dot: "bg-green-600" },
    Cancelled: { text: "Cancelled", dot: "bg-red-600" },
    Canceled: { text: "Cancelled", dot: "bg-red-600" },
  };
  const s = map[status] || { text: status || "Scheduled", dot: "bg-gray-400" };
  return (
    <span className="inline-flex items-center gap-2 text-sm text-gray-700">
      <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
      <span className="text-gray-700">{s.text}</span>
    </span>
  );
}

export default function SessionsDetail({ id, navigate }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notes, setNotes] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiJson(`/sessions/${id}`, "GET");
      setSession(data);
      setNotes(data.notes || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  // Save notes
  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await apiJson(`/sessions/${id}`, "PUT", { notes });
      await load();
    } finally {
      setSavingNotes(false);
    }
  };

  // Mark completed
  const markCompleted = async () => {
    await apiJson(`/sessions/${id}`, "PUT", {
      status: "Completed",
      endedAt: new Date().toISOString(),
    });
    await load();
  };

  // Cancel
  const cancelSession = async () => {
    await apiJson(`/sessions/${id}`, "PUT", { status: "Cancelled" });
    await load();
  };

  if (loading) return <div className="p-6">Loading session…</div>;
  if (!session) return <div className="p-6">Not found.</div>;

  const createdAt = session.createdAt
    ? new Date(session.createdAt).toLocaleString()
    : "—";
  const updatedAt = session.updatedAt
    ? new Date(session.updatedAt).toLocaleString()
    : "—";

  // ✅ FIX: use startedAt instead of old "date"
  const baseDate = session.startedAt ? new Date(session.startedAt) : null;
  const dateStr = baseDate ? baseDate.toLocaleDateString() : "—";
  const timeStr = baseDate
    ? baseDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <button
        onClick={() => navigate("/sessions")}
        className="text-sm text-indigo-600 hover:text-indigo-700"
      >
        ← Back to sessions
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-black tracking-wider">SESSION</h1>
            <div className="mt-2 text-sm text-gray-500">
              Created: {createdAt} • Last updated: {updatedAt}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
            <div className="text-xs text-gray-500 uppercase">Participant</div>
            <div className="mt-1 text-gray-900">{session.participant?.name || "(deleted)"}</div>
          </div>
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
            <div className="text-xs text-gray-500 uppercase">Study</div>
            <div className="mt-1 text-gray-900">{session.study?.title || "(deleted)"}</div>
          </div>
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
            <div className="text-xs text-gray-500 uppercase">Status</div>
            <div className="mt-1">
              <StatusBadge status={session.status || "Scheduled"} />
            </div>
          </div>
        </div>
      </div>

      {/* Details & Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900">Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div>
            <div className="text-xs text-gray-500 uppercase">Date</div>
            <div className="mt-1 text-gray-900">{dateStr}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase">Time</div>
            <div className="mt-1 text-gray-900">{timeStr}</div>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={markCompleted}
              className="px-4 py-2 rounded-md border border-indigo-600 text-indigo-600 text-sm font-medium hover:bg-indigo-50"
            >
              Mark completed
            </button>
            <button
              onClick={cancelSession}
              className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this session..."
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={saveNotes}
              disabled={savingNotes}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {savingNotes ? "Saving…" : "Save notes"}
            </button>
          </div>
        </div>
      </div>

      {/* History (placeholder until backend logs implemented) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900">History</h2>
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          <li>• Created</li>
          <li>• Status changed</li>
        </ul>
      </div>
    </div>
  );
}
