import React from "react";
import PropTypes from "prop-types";
import { apiJson } from "../utils/api";
import EditParticipantModal from "./EditParticipantModal";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

export default function ParticipantDetail({ id, navigate }) {
  const [participant, setParticipant] = React.useState(null);
  const [loading, setLoading] = React.useState(Boolean(id));
  const [error, setError] = React.useState(null);
  const [showEdit, setShowEdit] = React.useState(false);

  React.useEffect(() => {
    if (!showEdit) return undefined;
    const handler = (event) => {
      if (event.key === "Escape") {
        setShowEdit(false);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
    return undefined;
  }, [showEdit]);

  const loadParticipant = React.useCallback(async () => {
    if (!id) {
      setError(new Error("Missing participant id"));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/participants/${id}`);
      if (res.status === 404) {
        throw new Error("Participant not found");
      }
      if (!res.ok) {
        throw new Error(`Unable to load participant (HTTP ${res.status})`);
      }
      const data = await res.json();
      setParticipant(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadParticipant();
  }, [loadParticipant]);

  const handleBack = React.useCallback(() => {
    if (typeof navigate === "function") {
      navigate("/participants");
      return;
    }
    if (typeof window !== "undefined") {
      window.location.hash = "/participants";
    }
  }, [navigate]);

  const handleParticipantSaved = React.useCallback((updated) => {
    if (updated) {
      setParticipant(updated);
    }
  }, []);

  return (
    <div className="min-h-screen w-full px-6 py-8 mx-auto max-w-4xl">
      <div className="flex items-center gap-3 text-sm text-indigo-600 hover:text-indigo-700 cursor-pointer w-fit" onClick={handleBack}>
        <span aria-hidden="true">←</span>
        <span>Back to participants</span>
      </div>

      {loading && (
        <div className="mt-10 space-y-6">
          <div className="h-28 rounded-2xl bg-white border border-gray-200 shadow animate-pulse" />
          <div className="h-40 rounded-2xl bg-white border border-gray-200 shadow animate-pulse" />
        </div>
      )}

      {!loading && error && (
        <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error.message || "Unable to load participant"}
        </div>
      )}

      {!loading && !error && participant && (
        <div className="mt-10 space-y-8">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-500">Participant</p>
                <h1 className="mt-1 text-3xl font-semibold text-gray-900">
                  {participant.name || "Unnamed participant"}
                </h1>
                <p className="text-sm text-gray-500 mt-2">External ID: {participant.externalId || "—"}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEdit(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                  <span aria-hidden="true" className="text-base leading-none">{"\u270F"}</span>
                  <span>Edit details</span>
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("Delete this participant? This action cannot be undone.")) return;
                    try {
                      await apiJson(`/participants/${id}`, "DELETE");
                      if (typeof navigate === "function") {
                        navigate("/participants");
                      } else if (typeof window !== "undefined") {
                        window.location.hash = "/participants";
                      }
                    } catch (err) {
                      alert(err.message || "Failed to delete participant");
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-gray-50 p-4">
                <dt className="text-xs uppercase text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(participant.createdAt)}</dd>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <dt className="text-xs uppercase text-gray-500">Last updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(participant.updatedAt)}</dd>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <dt className="text-xs uppercase text-gray-500">Database ID</dt>
                <dd className="mt-1 break-all text-sm text-gray-900">{participant._id}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">Contact details</h2>
            <dl className="mt-4 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900">{participant.name || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{participant.email || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{participant.phone || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-gray-500">External ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{participant.externalId || "Not provided"}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
              {participant.notes ? participant.notes : "No notes yet."}
            </p>
          </section>
        </div>
      )}

      <EditParticipantModal
        open={showEdit}
        participant={participant}
        onClose={() => setShowEdit(false)}
        onSaved={handleParticipantSaved}
      />
    </div>
  );
}

ParticipantDetail.propTypes = {
  id: PropTypes.string,
  navigate: PropTypes.func,
};