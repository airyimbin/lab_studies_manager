import React from "react";
import PropTypes from "prop-types";
import { apiJson } from "../utils/api";

const initialForm = {
  title: "",
  tags: "",
  description: "",
  status: "draft",
};

export default function EditStudyModal({ open, study, onClose, onSaved }) {
  const [form, setForm] = React.useState(initialForm);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (open && study) {
      setForm({
        title: study.title || "",
        tags: study.tags?.join(", ") || "",
        description: study.description || "",
        status: study.status || "draft",
      });
      setError(null);
      setSaving(false);
    }
    if (!open) {
      setError(null);
      setSaving(false);
    }
  }, [open, study]);

  if (!open || !study) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      await apiJson(`/studies/${study._id}`, "PUT", payload);
      let updated;
      try {
        updated = await apiJson(`/studies/${study._id}`, "GET");
      } catch {
        updated = { ...study, ...payload };
      }
      if (typeof onSaved === "function") {
        onSaved(updated);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save study");
    } finally {
      setSaving(false);
    }
  };

  const closeDisabled = saving;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ marginTop: "unset" }}
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !closeDisabled && onClose()}
      />
      <div className="relative z-10 w-full max-w-lg mx-auto rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">Edit Study</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs uppercase mb-1">
              Title
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
            </label>
          </div>

          <div>
            <label className="block text-xs uppercase mb-1">
              Tags
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={form.tags}
              onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
              placeholder="vision, perception"
            />
            </label>
          </div>

          <div>
            <label className="block text-xs uppercase mb-1">
              Status
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            </label>
          </div>

          <div>
            <label className="block text-xs uppercase mb-1">
              Description
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              rows={4}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="A short paragraph about the protocol..."
            />
            </label>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => !closeDisabled && onClose()}
              className="px-4 py-2 rounded-md bg-red-600 text-sm font-medium text-white shadow hover:bg-red-700 disabled:opacity-60"
              disabled={closeDisabled}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-cyan-700 text-white text-sm font-medium shadow hover:bg-cyan-900 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditStudyModal.propTypes = {
  open: PropTypes.bool.isRequired,
  study: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string,
    status: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func,
};
