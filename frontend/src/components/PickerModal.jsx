import React, { useState } from "react";
import PropTypes from "prop-types";

export default function PickerModal({ type, data, onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const filtered = data.filter(
    (item) =>
      item.name?.toLowerCase().includes(query.toLowerCase()) ||
      item.title?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Select {type === "participant" ? "Participant" : "Study"}
        </h3>

        <input
          type="text"
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
        />

        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left font-medium">
                  {type === "participant" ? "Name" : "Title"}
                </th>
                <th className="px-3 py-2 text-left font-medium">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr
                  key={item._id}
                  onClick={() => onSelect(item._id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-3 py-2">
                    {item.name || item.title || "(deleted)"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{item._id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

PickerModal.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
