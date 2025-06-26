import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { IoIosPaper } from "react-icons/io";
import { FaPaperclip } from "react-icons/fa";
import { AiOutlineLineChart } from "react-icons/ai";
import { FaRegSquareCheck } from "react-icons/fa6";
import { BiShare } from "react-icons/bi";
import { UserContext } from "../contexts/UserContext";
import "./NewRequests.css"; // <-- Import the CSS for blurred background

const MyApprovals = () => {
  const { username } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupApprovalId, setPopupApprovalId] = useState(null);
  const [popupComment, setPopupComment] = useState("");

  // Workflow popup state
  const [workflowPopup, setWorkflowPopup] = useState({
    open: false,
    loading: false,
    error: null,
    data: [],
  });

  useEffect(() => {
    if (username) {
      axios
        .get(`http://localhost:8080/api/workprogress/assignee/${username}`)
        .then((response) => {
          const pendingApprovals = response.data.filter(
            (item) => item.status.toLowerCase() === "in progress"
          );
          const approvedApprovals = response.data.filter(
            (item) => item.status.toLowerCase() === "approved"
          );
          setPending(pendingApprovals);
          setApproved(approvedApprovals);
        })
        .catch((error) => {
          console.error("Error fetching approvals:", error);
        });
    }
  }, [username]);

  const filteredApprovals =
    activeTab === "pending"
      ? pending.filter((approval) =>
          approval.request?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : approved.filter((approval) =>
          approval.request?.toLowerCase().includes(searchTerm.toLowerCase())
        );

  // Find approval by id from pending or approved
  const getApprovalById = (id) => {
    return (
      pending.find((item) => item.id === id) ||
      approved.find((item) => item.id === id)
    );
  };

  // Update assigneeComment and (optionally) status for an approval using PUT /api/workprogress/{id}
  const updateWorkprogress = async (id, comment, status) => {
    const approval = getApprovalById(id);
    if (!approval) return;

    const now = new Date().toISOString();

    const payload = {
      ...approval,
      assigneeComment: comment,
      assigneeUpdatedTime: now,
      status: status || approval.status,
    };

    try {
      await axios.put(`http://localhost:8080/api/workprogress/${id}`, payload);
      setPending((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, assigneeComment: comment, assigneeUpdatedTime: now, status: status || item.status }
            : item
        )
      );
      setApproved((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, assigneeComment: comment, assigneeUpdatedTime: now, status: status || item.status }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating workprogress:", error);
    }
  };

  // Approve handler (status change)
  const handleApprove = async (id, comment) => {
    await updateWorkprogress(id, comment, "approved");
    setShowPopup(false);
    setPopupApprovalId(null);
    setPopupComment("");
    window.location.reload();
  };

  // Decline handler (just update comment and close)
  const handleDecline = async (id, comment) => {
    await updateWorkprogress(id, comment);
    setShowPopup(false);
    setPopupApprovalId(null);
    setPopupComment("");
  };

  // Open popup for a specific approval
  const openPopup = (id, currentComment) => {
    setPopupApprovalId(id);
    setPopupComment(currentComment || "");
    setShowPopup(true);
  };

  // Handler to open workflow popup and fetch data
  const handleOpenWorkflowPopup = async (workflowId) => {
    setWorkflowPopup({ open: true, loading: true, error: null, data: [] });
    try {
      const res = await axios.get(
        `http://localhost:8080/api/workprogress/workflow/${workflowId}`
      );
      setWorkflowPopup({
        open: true,
        loading: false,
        error: null,
        data: res.data,
      });
    } catch (err) {
      setWorkflowPopup({
        open: true,
        loading: false,
        error: "Failed to load workflow details.",
        data: [],
      });
    }
  };

  // Handler to close workflow popup
  const handleCloseWorkflowPopup = () => {
    setWorkflowPopup({ open: false, loading: false, error: null, data: [] });
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Blurred background image */}
      <div className="blurred-bg"></div>
      {/* Main content */}
      <div className="transparent-white p-6 max-w-6xl mx-auto shadow-lg rounded-lg relative" style={{ zIndex: 1 }}>
        <h2 className="text-xl font-semibold mb-4">My Approvals</h2>

        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "pending" ? "bg-yellow-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "approved" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("approved")}
          >
            Approved
          </button>
        </div>

        <input
          type="text"
          placeholder="Search"
          className="border p-2 w-full mb-4"
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Request</th>
              <th className="border p-2">Assigner</th>
              <th className="border p-2">
                {activeTab === "pending" ? "Assigner Updated At" : "Assignee Updated At"}
              </th>
              <th className="border p-2">
                {activeTab === "pending" ? "Assigner Comment" : "Assignee Comment"}
              </th>
              <th className="border p-2">View</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApprovals.length > 0 ? (
              filteredApprovals.map((approval) => (
                <tr key={approval.id} className="text-center">
                  <td className="border p-2">{approval.request}</td>
                  <td className="border p-2">{approval.assigner}</td>
                  <td className="border p-2">
                    {activeTab === "pending"
                      ? (approval.assignerUpdatedTime
                          ? approval.assignerUpdatedTime.slice(0, 10)
                          : "-")
                      : (approval.assigneeUpdatedTime
                          ? approval.assigneeUpdatedTime.slice(0, 10)
                          : "-")}
                  </td>
                  <td className="border p-2">
                    {activeTab === "pending"
                      ? (approval.assignerComment || "-")
                      : (approval.assigneeComment || "-")}
                  </td>
                  <td className="border p-2">
                    <div className="flex gap-4 justify-center">
                      <button className="text-blue-500 text-2xl">
                        <IoIosPaper />
                      </button>
                      <button className="text-blue-500 text-2xl">
                        <FaPaperclip />
                      </button>
                      <button
                        className="text-blue-500 text-2xl"
                        onClick={() => handleOpenWorkflowPopup(approval.workflowId)}
                      >
                        <AiOutlineLineChart />
                      </button>
                    </div>
                  </td>
                  <td className="border p-2">
                    <div className="flex gap-4 justify-center">
                      {approval.status.toLowerCase() !== "approved" && (
                        <button
                          className="text-blue-500 text-2xl"
                          onClick={() => openPopup(approval.id, approval.assigneeComment)}
                        >
                          <FaRegSquareCheck />
                        </button>
                      )}

                      <button className="text-blue-500 text-2xl">
                        <BiShare />
                      </button>
                      <button className="text-blue-500 text-2xl transform scale-x-[-1]">
                        <BiShare />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="border p-2 text-center">
                  No approvals found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Popup for comment and approve/decline */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4">Add Comment</h3>
              <textarea
                className="w-full border rounded p-2 mb-4"
                rows={4}
                value={popupComment}
                onChange={(e) => setPopupComment(e.target.value)}
                placeholder="Enter your comment"
              />
              <div className="flex justify-end gap-4">
                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                  onClick={() => handleDecline(popupApprovalId, popupComment)}
                >
                  Decline
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => handleApprove(popupApprovalId, popupComment)}
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Details Popup */}
        {workflowPopup.open && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div
              className="bg-white rounded-lg shadow-lg p-4 w-full max-w-2xl relative"
              style={{ minHeight: "500px", maxHeight: "80vh", overflowY: "auto" }}
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                onClick={handleCloseWorkflowPopup}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-lg font-semibold mb-4">Workflow Details</h3>
              {workflowPopup.loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : workflowPopup.error ? (
                <div className="text-red-500 text-center py-8">{workflowPopup.error}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Assignee</th>
                        <th className="border p-2">Action</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Assignee Comment</th>
                        <th className="border p-2">Assignee Update Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workflowPopup.data.length > 0 ? (
                        workflowPopup.data.map((item) => (
                          <tr key={item.id} className="text-center">
                            <td className="border p-2">{item.assignee}</td>
                            <td className="border p-2">{item.stage}</td>
                            <td className="border p-2">{item.status}</td>
                            <td className="border p-2">{item.assigneeComment || "-"}</td>
                            <td className="border p-2">
                              {item.assigneeUpdatedTime
                                ? item.assigneeUpdatedTime.slice(0, 10)
                                : "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="border p-2 text-center">
                            No workflow details found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="flex justify-end mt-4">
                    <button
                      className="bg-gray-400 text-white px-4 py-2 rounded"
                      onClick={handleCloseWorkflowPopup}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApprovals;
