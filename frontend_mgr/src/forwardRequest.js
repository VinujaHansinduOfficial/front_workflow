import { useState } from "react";
import "./Route/NewRequests.css"; // Import the CSS for blurred background and transparency

export default function ForwardRequests() {
  const [search, setSearch] = useState("");

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Blurred background image */}
      <div className="blurred-bg"></div>
      {/* Main content */}
      <div className="transparent-white p-6 max-w-4xl mx-auto shadow-lg rounded-lg relative" style={{ zIndex: 1 }}>
        <h2 className="text-xl font-semibold mb-4">My Forward List</h2>
        <input
          type="text"
          placeholder="Search..."
          className="w-full p-2 border rounded mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Assignee</th>
                <th className="border border-gray-300 px-4 py-2">Comment</th>
                <th className="border border-gray-300 px-4 py-2">Created Date</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center">
                <td className="border border-gray-300 px-4 py-2">Mr. Supervisor</td>
                <td className="border border-gray-300 px-4 py-2">Needs approval</td>
                <td className="border border-gray-300 px-4 py-2">2023-07-13 15:14:49</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button className="border border-gray-400 px-4 py-1 rounded mr-2">View</button>
                  <button className="bg-blue-500 text-white px-4 py-1 rounded">Approve</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
