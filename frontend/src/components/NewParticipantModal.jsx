import React from "react";
import PropTypes from "prop-types";
import { apiJson } from "../utils/api";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  notes: "",
};

export default function NewParticipantModal({ open, onClose, onCreated }) {
  const [form, setForm] = React.useState(initialForm);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: form.name || null,
        email: form.email || null,
        phone: form.phone || null,
        notes: form.notes || null,
      };
      await apiJson("/participants", "POST", payload);
      if (typeof onCreated === "function") {
        await onCreated();
      }
      setForm(initialForm);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create participant");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => !submitting && onClose()} />
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900">New Participant</h2>
        <p className="text-sm text-gray-500 mt-1">Create a new participant record.</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs text-gray-600">Full name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
              placeholder="Jane Doe"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600">Email</label>
              <input
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
                placeholder="jane@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
                placeholder="(555) 012-3456"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 text-sm"
              rows={3}
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => !submitting && onClose()}
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
  );
}

NewParticipantModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func,
};
