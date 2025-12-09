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

  if (loading) {
    return (
      <div className="min-h-screen max-w-5xl mx-auto px-6 py-10">
        <p className="text-gray-600">Loading study details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen max-w-5xl mx-auto px-6 py-10">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="min-h-screen max-w-5xl mx-auto px-6 py-10">
        <p className="text-gray-600">No study found.</p>
      </div>
    );
  }

  const createdAt = study.createdAt
    ? new Date(study.createdAt).toLocaleString()
    : "—";
  const updatedAt = study.updatedAt
    ? new Date(study.updatedAt).toLocaleString()
    : "—";

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Back link */}
      <button
        type="button"
        onClick={() => navigate("/studies")}
        className="text-indigo-600 hover:underline text-sm"
      >
        ← Back to Studies
      </button>

      {/* Top card – matches participant detail style */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Study
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-gray-900">
              {study.title || "Untitled study"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Slug:{" "}
              <span className="font-mono text-gray-700">
                {study.slug || "—"}
              </span>
            </p>
          </div>

          <div className="flex gap-2 self-start">
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              <span aria-hidden="true" className="text-base leading-none">
                {"\u270F"}
              </span>
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
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold shadow hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Stat cards row – similar to Created / Last Updated / Database ID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Status
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900 capitalize">
              {study.status || "draft"}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Created
            </p>
            <p className="mt-1 text-sm text-gray-900">{createdAt}</p>
          </div>
          <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Last updated
            </p>
            <p className="mt-1 text-sm text-gray-900">{updatedAt}</p>
          </div>
        </div>
      </section>

      {/* Details card – similar to "Contact details" / "Notes" layout */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Study details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Title
            </p>
            <p className="mt-1 text-gray-900">
              {study.title || "Untitled study"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Slug
            </p>
            <p className="mt-1 font-mono text-gray-900">
              {study.slug || "—"}
            </p>
          </div>

          {study.tags?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Tags
              </p>
              <p className="mt-1 text-gray-900">
                {study.tags.join(", ")}
              </p>
            </div>
          )}

          {study.externalId && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                External ID
              </p>
              <p className="mt-1 text-gray-900">{study.externalId}</p>
            </div>
          )}
        </div>

        {study.description && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Description
            </p>
            <p className="text-sm text-gray-800 leading-relaxed">
              {study.description}
            </p>
          </div>
        )}
      </section>

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
