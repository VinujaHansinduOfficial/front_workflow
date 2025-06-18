import { useState } from "react";

const DivPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-2">
          Execute (reference no. 0123501688616291)
        </h2>

        <label className="block text-sm font-medium">Description</label>
        <input
          type="text"
          value="Update Products with the details"
          readOnly
          className="w-full border rounded p-2 mb-3 bg-gray-100"
        />

        <label className="block text-sm font-medium">Comments</label>
        <textarea
          className="w-full border rounded p-2 mb-3"
          placeholder="Enter comments..."
        ></textarea>

        <label className="block text-sm font-medium">Upload Awareness (if any)</label>
        <input type="file" className="w-full mb-3" />

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded mr-2"
          >
            Cancel
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded">
            Execute
          </button>
        </div>
      </div>
    </div>
  );
};

export default DivPopup;
