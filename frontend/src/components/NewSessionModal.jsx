import React, { useEffect, useMemo, useState } from "react";
import { apiJson } from "../utils/api";

/** Simple centered modal shell */
function Shell({ title, subtitle, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative z-10 bg-white rounded-2xl shadow-xl w-full ${wide ? "max-w-3xl" : "max-w-lg"} mx-4 p-6`}>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

/** Reusable in-memory filtered picker modal (table list) */
function PickerModal({ title, rows, loading, columns, getKey, onClose, onSelect }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return rows || [];
    const s = q.toLowerCase();
    return (rows || []).filter((r) =>
      Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(s))
    );
  }, [q, rows]);

  return (
    <Shell title={title} onClose={onClose} wide>
      <div className="flex items-center gap-2 mb-3">
        <input
          autoFocus
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Type to filter…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3">{c.label}</th>
              ))}
              <th className="px-4 py-3 text-right">Select</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td className="px-4 py-4 text-gray-500" colSpan={columns.length + 1}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="px-4 py-4 text-gray-500" colSpan={columns.length + 1}>No results</td></tr>
            ) : (
              filtered.map((row) => (
                <tr key={getKey(row)} className="hover:bg-gray-50">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-gray-800">
                      {typeof c.render === "function" ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => onSelect(row)}
                        className="px-3 py-1 border border-indigo-600 text-indigo-600 rounded-md text-xs font-medium hover:bg-indigo-50"
                      >
                        Choose
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 text-sm">
          Close
        </button>
      </div>
    </Shell>
  );
}

/** New Session Modal (fetch-all + client filtering pickers) */
export default function NewSessionModal({ open, onClose, onCreated }) {
  const [participants, setParticipants] = useState([]);
  const [studies, setStudies] = useState([]);
  const [loadingP, setLoadingP] = useState(false);
  const [loadingS, setLoadingS] = useState(false);

  const [participant, setParticipant] = useState(null);
  const [study, setStudy] = useState(null);
  const [startedAt, setStartedAt] = useState(() => {
    // default now in local datetime-local format
    const iso = new Date().toISOString();
    return iso.slice(0, 16);
  });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showPickP, setShowPickP] = useState(false);
  const [showPickS, setShowPickS] = useState(false);

  // Load lists when modal opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoadingP(true);
        setLoadingS(true);
        const [pRes, sRes] = await Promise.all([
          apiJson("/participants", "GET"),
          apiJson("/studies", "GET"),
        ]);
        setParticipants(pRes || []);
        setStudies(sRes || []);
      } catch (e) {
        console.error("Failed to load lists", e);
      } finally {
        setLoadingP(false);
        setLoadingS(false);
      }
    })();
  }, [open]);

  const disabled = !participant || !study || !startedAt || submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    setSubmitting(true);
    try {
      await apiJson("/sessions", "POST", {
        participantId: participant._id,
        studyId: study._id,
        startedAt: new Date(startedAt).toISOString(),
        notes: notes || null,
      });
      onCreated?.(); // parent will refresh + close
    } catch (err) {
      console.error(err);
      alert("Failed to create session");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Shell
      title="New Session"
      subtitle="Schedule a participant for a study."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Participant */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Participant</label>
          <button
            type="button"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-left text-sm"
            onClick={() => setShowPickP(true)}
          >
            {participant ? participant.name : "Select participant…"}
          </button>
        </div>

        {/* Study */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Study</label>
          <button
            type="button"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-left text-sm"
            onClick={() => setShowPickS(true)}
          >
            {study ? study.title : "Select study…"}
          </button>
        </div>

        {/* Date & Time */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Date & Time</label>
          <input
            type="datetime-local"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            required
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Notes (optional)</label>
          <textarea
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any relevant context…"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={disabled}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create Session"}
          </button>
        </div>
      </form>

      {/* Participant Picker */}
      {showPickP && (
        <PickerModal
          title="Select Participant"
          rows={participants}
          loading={loadingP}
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
          ]}
          getKey={(r) => r._id}
          onClose={() => setShowPickP(false)}
          onSelect={(r) => {
            setParticipant(r);
            setShowPickP(false);
          }}
        />
      )}

      {/* Study Picker */}
      {showPickS && (
        <PickerModal
          title="Select Study"
          rows={studies}
          loading={loadingS}
          columns={[
            { key: "title", label: "Title" },
            { key: "status", label: "Status" },
          ]}
          getKey={(r) => r._id}
          onClose={() => setShowPickS(false)}
          onSelect={(r) => {
            setStudy(r);
            setShowPickS(false);
          }}
        />
      )}
    </Shell>
  );
}
