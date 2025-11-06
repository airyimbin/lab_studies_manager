import React from "react";
import PropTypes from "prop-types";
import { apiJson } from "../utils/api";

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
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    externalId: "",
  });
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(null);

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

  React.useEffect(() => {
    if (!participant) return;
    setForm({
      name: participant.name || "",
      email: participant.email || "",
      phone: participant.phone || "",
      notes: participant.notes || "",
      externalId: participant.externalId || "",
    });
  }, [participant]);

  const handleBack = React.useCallback(() => {
    if (typeof navigate === "function") {
      navigate("/participants");
      return;
    }
    if (typeof window !== "undefined") {
      window.location.hash = "/participants";
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!id) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name: form.name || null,
        email: form.email || null,
        phone: form.phone || null,
        notes: form.notes || null,
        externalId: form.externalId || null,
      };
      const updated = await apiJson(`/participants/${id}`, "PUT", payload);
      setParticipant(updated);
      setShowEdit(false);
    } catch (err) {
      setSaveError(err.message || "Failed to update participant");
    } finally {
      setSaving(false);
    }
  };

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
              <button
                onClick={() => setShowEdit(true)}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700"
              >
                Update info
              </button>
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

      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowEdit(false)} />
          <div className="relative z-10 w-full max-w-xl mx-4 rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900">Update participant</h2>
            <p className="text-sm text-gray-500 mt-1">Edit the participant&apos;s information and save changes.</p>

            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs text-gray-600">Full name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-gray-600">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="(555) 012-3456"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600">External ID</label>
                <input
                  value={form.externalId}
                  onChange={(e) => setForm((prev) => ({ ...prev, externalId: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="P-00001"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  rows={4}
                />
              </div>

              {saveError && <div className="text-sm text-red-600">{saveError}</div>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

ParticipantDetail.propTypes = {
  id: PropTypes.string,
  navigate: PropTypes.func,
};