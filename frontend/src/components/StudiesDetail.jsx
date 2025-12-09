import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { apiJson } from "../utils/api";
import EditStudyModal from "./EditStudyModal";

export default function StudiesDetail({ id, navigate }) {
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!showEditModal) return undefined;
    const handler = (event) => {
      if (event.key === "Escape") {
        setShowEditModal(false);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
    return undefined;
  }, [showEditModal]);

  useEffect(() => {
    async function fetchStudy() {
      setLoading(true);
      try {
        const data = await apiJson(`/studies/${id}`, "GET");
        setStudy(data);
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

  const handleStudySaved = React.useCallback((updated) => {
    if (updated) {
      setStudy(updated);
    }
  }, []);

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
        <div className="flex gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            <span aria-hidden="true" className="text-base leading-none">{"\u270F"}</span>
            <span>Edit study</span>
          </button>
          <button
            onClick={async () => {
              if (!confirm("Delete this study? This cannot be undone.")) return;
              try {
                await apiJson(`/studies/${id}`, "DELETE");
                if (typeof navigate === "function") {
                  navigate("/studies");
                } else if (typeof window !== "undefined") {
                  window.location.hash = "/studies";
                }
              } catch (err) {
                alert(err.message || "Failed to delete study");
              }
            }}
            className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700"
          >
            Delete
          </button>
        </div>
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

      <EditStudyModal
        open={showEditModal}
        study={study}
        onClose={() => setShowEditModal(false)}
        onSaved={handleStudySaved}
      />
    </div>
  );
}

StudiesDetail.propTypes = {
  id: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
};
