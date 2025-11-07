import React, { useEffect, useState } from "react";
import { apiJson } from "../utils/api";

export default function StudiesDetail({ id, navigate }) {
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    tags: "",
    description: "",
  });

  useEffect(() => {
    async function fetchStudy() {
      setLoading(true);
      try {
        const data = await apiJson(`/studies/${id}`, "GET");
        setStudy(data);
        setEditForm({
          title: data.title || "",
          tags: data.tags?.join(", ") || "",
          description: data.description || "",
        });
        setError(null);
      } catch (err) {
        console.error("Failed to fetch study", err);
        setError(err?.message || "Failed to fetch study");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchStudy();
  }, [id]);

  // Save changes
  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...editForm,
      tags: editForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      await apiJson(`/studies/${id}`, "PUT", payload);
      setShowEditModal(false);
      const updated = await apiJson(`/studies/${id}`, "GET");
      setStudy(updated);
    } catch (err) {
      alert("Failed to save study");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-600">Loading study details…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!study) return <p className="p-6 text-gray-600">No study found.</p>;

  const createdAt = study.createdAt ? new Date(study.createdAt).toLocaleString() : "—";
  const updatedAt = study.updatedAt ? new Date(study.updatedAt).toLocaleString() : "—";

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/studies")}
        className="text-indigo-600 hover:underline"
      >
        ← Back to Studies
      </button>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {study.title || "Untitled Study"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Slug: <span className="font-mono">{study.slug || "—"}</span>
          </p>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          Edit Study
        </button>
      </div>

      {/* Overview card */}
      <div className="rounded-lg bg-white shadow border border-gray-200 p-6 space-y-4">
        <p>
          <span className="font-semibold">Status:</span>{" "}
          <span className="capitalize">{study.status || "draft"}</span>
        </p>
        <p>
          <span className="font-semibold">Created:</span> {createdAt}
        </p>
        {study.updatedAt && (
          <p>
            <span className="font-semibold">Updated:</span> {updatedAt}
          </p>
        )}
        {study.description && (
          <p className="text-gray-700 leading-relaxed">{study.description}</p>
        )}
        {study.tags?.length > 0 && (
          <p>
            <span className="font-semibold">Tags:</span> {study.tags.join(", ")}
          </p>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative z-10 bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Edit Study</h2>
            <form onSubmit={saveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Title
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Tags
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={editForm.tags}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, tags: e.target.value }))
                  }
                  placeholder="vision, perception"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  rows={4}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="A short paragraph about the protocol..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
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
