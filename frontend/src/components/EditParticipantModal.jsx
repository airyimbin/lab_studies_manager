import React from "react";
import PropTypes from "prop-types";
import { apiJson } from "../utils/api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  notes: "",
  externalId: "",
};

export default function EditParticipantModal({ open, participant, onClose, onSaved }) {
  const [form, setForm] = React.useState(emptyForm);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (open && participant) {
      setForm({
        name: participant.name || "",
        email: participant.email || "",
        phone: participant.phone || "",
        notes: participant.notes || "",
        externalId: participant.externalId || "",
      });
      setError(null);
      setSaving(false);
    }
    if (!open) {
      setError(null);
      setSaving(false);
    }
  }, [open, participant]);

  if (!open || !participant) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name || null,
        email: form.email || null,
        phone: form.phone || null,
        notes: form.notes || null,
        externalId: form.externalId || null,
      };
      const updated = await apiJson(`/participants/${participant._id}`, "PUT", payload);
      if (typeof onSaved === "function") {
        onSaved(updated);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update participant");
    } finally {
      setSaving(false);
    }
  };

  const closeDisabled = saving;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !closeDisabled && onClose()}
      />
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
              readOnly
              aria-readonly="true"
              className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
              placeholder="P-00001"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">
              Notes
              <textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                rows={4}
              />
            </label>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => !closeDisabled && onClose()}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-red-700 disabled:opacity-60"
              disabled={closeDisabled}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-medium text-white shadow hover:bg-cyan-900 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditParticipantModal.propTypes = {
  open: PropTypes.bool.isRequired,
  participant: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    notes: PropTypes.string,
    externalId: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func,
};
