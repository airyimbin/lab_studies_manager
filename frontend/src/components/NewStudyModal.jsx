import React from "react";
import PropTypes from "prop-types";
import { apiJson } from "../utils/api";

const initialForm = {
  title: "",
  slug: "",
  status: "draft",
  description: "",
};

function slugify(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewStudyModal({ open, onClose, onCreated }) {
  const [form, setForm] = React.useState(initialForm);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const slugTouchedRef = React.useRef(false);

  React.useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setSubmitting(false);
      setError(null);
      slugTouchedRef.current = false;
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: form.title || null,
        slug: form.slug || null,
        status: form.status || null,
        description: form.description || null,
      };
      await apiJson("/studies", "POST", payload);
      if (typeof onCreated === "function") {
        await onCreated();
      }
      setForm(initialForm);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create study");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTitleChange = (value) => {
    setForm((prev) => {
      const next = { ...prev, title: value };
      if (!slugTouchedRef.current) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const handleSlugChange = (value) => {
    slugTouchedRef.current = true;
    setForm((prev) => ({ ...prev, slug: slugify(value) }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => !submitting && onClose()} />
      <div className="relative z-10 w-full max-w-xl mx-4 rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">New Study</h2>
        <p className="mt-1 text-sm text-gray-500">Define a new study to track sessions and enrollment.</p>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs text-gray-600">Title</label>
            <input
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Peripheral Change Detection"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-gray-600">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="peripheral-change-detection"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              rows={4}
              placeholder="Short overview of the study goals."
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => !submitting && onClose()}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-red-700 disabled:opacity-60"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Create study"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

NewStudyModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func,
};
