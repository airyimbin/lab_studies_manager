import React, { useEffect, useState, useMemo } from "react";
import { apiJson } from "../utils/api";
import PickerModal from "./PickerModal";
import PropTypes from "prop-types";

const FILTERS = ["New", "This Week", "All"];
const PAGE_SIZE = 10;

export default function SessionsList({ navigate }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showNew, setShowNew] = useState(false);
  const [showPicker, setShowPicker] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [studies, setStudies] = useState([]);

  const [form, setForm] = useState({
    participantId: "",
    studyId: "",
    startedAt: "",
    notes: "",
  });

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await apiJson("/sessions", "GET");
      setSessions(
        data.map((s) => ({
          ...s,
          studyName: s.study?.title || "(deleted)",
          participantName: s.participant?.name || "(deleted)",
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchParticipantsAndStudies();
  }, []);

  const fetchParticipantsAndStudies = async () => {
    const [p, s] = await Promise.all([
      apiJson("/participants", "GET"),
      apiJson("/studies", "GET"),
    ]);
    setParticipants(p);
    setStudies(s);
  };

  const filtered = useMemo(() => {
    const now = new Date();
    return sessions.filter((s) => {
      const created = new Date(s.createdAt);
      if (filter === "New") return (now - created) / (1000 * 60 * 60 * 24) <= 7;
      if (filter === "This Week") {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return created >= start && created <= end;
      }
      return true;
    });
  }, [sessions, filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const currentPageData = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleCreate = async () => {
    try {
      await apiJson("/sessions", "POST", {
        ...form,
        startedAt: new Date(form.startedAt),
      });
      setShowNew(false);
      setForm({ participantId: "", studyId: "", startedAt: "", notes: "" });
      await fetchSessions();
    } catch (err) {
      console.error(err);
      alert("Could not create session");
    }
  };

  const markStatus = async (id, status) => {
    if (status === "Cancelled" && !window.confirm("Cancel this session?")) return;
    await apiJson(`/sessions/${id}`, "PUT", { status });
    fetchSessions();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Explore all scheduled sessions and manage their details.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium shadow hover:bg-indigo-700"
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
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* ✅ Loading */}
      {loading ? (
        <div className="p-6 text-gray-600">Loading sessions…</div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3">SID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Participant</th>
                  <th className="px-4 py-3">Study</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentPageData.map((s) => {
                  const date = s.startedAt ? new Date(s.startedAt) : null;
                  const dateStr = date ? date.toLocaleDateString() : "N/A";
                  const timeStr = date
                    ? date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A";
                  const sid = s.sid || (s._id ? s._id.slice(-4).toUpperCase() : "—");

                  return (
                    <tr key={s._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        S-{sid}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{dateStr}</td>
                      <td className="px-4 py-3 text-gray-700">{timeStr}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {s.participantName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{s.studyName}</td>
                      <td className="px-4 py-3 text-gray-700">{s.status}</td>
                      <td className="px-4 py-3 flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/sessions/${s._id}`)}
                          className="px-3 py-1 border border-indigo-600 text-indigo-600 rounded-md text-xs font-medium hover:bg-indigo-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => markStatus(s._id, "Completed")}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => markStatus(s._id, "Cancelled")}
                          className="px-3 py-1 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between text-sm gap-4">
            <div className="text-gray-700">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => changePage(page - 1)}
                className="px-3 py-1.5 border rounded-md text-gray-600 disabled:opacity-40 hover:bg-gray-50"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => changePage(p)}
                  className={`px-3 py-1.5 border rounded-md ${
                    page === p
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => changePage(page + 1)}
                className="px-3 py-1.5 border rounded-md text-gray-600 disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showNew && (
        <NewSessionModal
          form={form}
          setForm={setForm}
          participants={participants}
          studies={studies}
          onClose={() => setShowNew(false)}
          onCreate={handleCreate}
          openPicker={setShowPicker}
        />
      )}

      {showPicker && (
        <PickerModal
          type={showPicker}
          data={showPicker === "participant" ? participants : studies}
          onSelect={(id) => {
            setForm((f) => ({
              ...f,
              [showPicker + "Id"]: id,
            }));
            setShowPicker(null);
          }}
          onClose={() => setShowPicker(null)}
        />
      )}
    </div>
  );
}

/* ---------------------- NEW SESSION MODAL ---------------------- */
function NewSessionModal({
  form,
  setForm,
  onClose,
  onCreate,
  participants,
  studies,
  openPicker,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900">New Session</h2>
        <p className="text-sm text-gray-500 mb-4">
          Create a session and assign a participant to a study.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600">Participant</label>
            <button
              onClick={() => openPicker("participant")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm text-left hover:bg-gray-50"
            >
              {form.participantId
                ? participants.find((p) => p._id === form.participantId)?.name
                : "Select participant…"}
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-600">Study</label>
            <button
              onClick={() => openPicker("study")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm text-left hover:bg-gray-50"
            >
              {form.studyId
                ? studies.find((s) => s._id === form.studyId)?.title
                : "Select study…"}
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-600">Date & Time</label>
            <input
              type="datetime-local"
              value={form.startedAt}
              onChange={(e) => setForm({ ...form, startedAt: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
            >
              Create Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ✅ PropTypes */
SessionsList.propTypes = {
  navigate: PropTypes.func.isRequired,
};

NewSessionModal.propTypes = {
  form: PropTypes.shape({
    participantId: PropTypes.string,
    studyId: PropTypes.string,
    startedAt: PropTypes.string,
    notes: PropTypes.string,
  }).isRequired,
  setForm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  participants: PropTypes.array.isRequired,
  studies: PropTypes.array.isRequired,
  openPicker: PropTypes.func.isRequired,
};
