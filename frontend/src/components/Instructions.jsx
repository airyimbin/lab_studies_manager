import React from "react";
import PropTypes from "prop-types";

export default function Instructions({ navigate }) {
  return (
    <div className="min-h-screen max-w-4xl mx-auto px-6 py-10 space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Instructions</h1>
        <p className="text-sm text-gray-600 mt-1">Quick guide to using the app.</p>
      </div>

      <section className="rounded-lg bg-white border border-gray-200 p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        <p className="mt-2 text-sm text-gray-700">
          The Dashboard gives a snapshot of participants, sessions, and studies. Use the action buttons inside each card or table row to view details, open sessions, or mark them complete.
        </p>
      </section>

      <section className="rounded-lg bg-white border border-gray-200 p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900">Participants</h2>
        <p className="mt-2 text-sm text-gray-700">
          The Participants page lists all enrolled participants. Use the search and sort controls to find people quickly. Click any participant to view their detail page where you can update or delete the record. The New Participant button opens a modal to create a participant.
        </p>
      </section>

      <section className="rounded-lg bg-white border border-gray-200 p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900">Studies</h2>
        <p className="mt-2 text-sm text-gray-700">
          Studies contain the protocols and metadata for experiments. From the Studies list you can create, edit, or delete studies. Open a study to see its details, manage tags, change status, or remove it entirely.
        </p>
      </section>

      <section className="rounded-lg bg-white border border-gray-200 p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900">Sessions</h2>
        <p className="mt-2 text-sm text-gray-700">
          Sessions are scheduled participant visits for a study. Use the Sessions list to create new sessions, filter by date or state, and update session status (e.g. Completed, Cancelled). Click a session to view or edit details.
        </p>
      </section>

      <section className="rounded-lg bg-white border border-gray-200 p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900">Sign In / Sign Up</h2>
        <p className="mt-2 text-sm text-gray-700">
          Use the Sign Up page to create an account. After registration you will be logged in automatically. Use Sign In to access an existing account. If you experience network or authentication errors, make sure the backend is running and cookies are enabled in your browser.
        </p>
      </section>

      <div className="pt-4">
        <button
          onClick={() => (typeof navigate === "function" ? navigate("/") : (window.location.hash = "/"))}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

Instructions.propTypes = {
  navigate: PropTypes.func,
};
