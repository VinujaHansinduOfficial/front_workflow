import { useState, useEffect, useContext  } from "react";
import {
  FaPaperclip,
  FaEye,
  FaChartLine,
  FaRegSquareCheck,
} from "react-icons/fa6";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { jwtDecode } from "jwt-decode"; // Use named import for jwtDecode
import "./Route/NewRequests.css"; // <-- Import the CSS for blurred background and transparency
import { UserContext } from "./contexts/UserContext"; // Adjust the import path as necessary

export default function RequestHistory() {
  const { username, loading: userLoading } = useContext(UserContext);
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [openAnnexure, setOpenAnnexure] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedAnnexures, setSelectedAnnexures] = useState([]);


  useEffect(() => {
    if (!username || userLoading) return; // Wait for username to load

    // console.log("Fetching data for user:", username);
    fetch(`https://slt-workbench-backend.up.railway.app/api/attachments/${username}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched Data:", data);
        setRequests(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [username, userLoading]);

  // Open the main PDF file in a new tab
  const handleOpenPdf = (pdfUrl) => {
    window.open(pdfUrl, "_blank");
  };

  // Open the main PDF dialog
  const handleDialogOpen = (attachmentId) => {
    const pdfUrl = `https://slt-workbench-backend.up.railway.app/api/attachments/file/${attachmentId}`;
    setSelectedPdf(pdfUrl);
    setOpen(true);
  };

  // Open annexures in new tab
  const handleOpenAnnexure = (attachmentId, index) => {
    const annexureUrl = `https://slt-workbench-backend.up.railway.app/api/attachments/${attachmentId}/annexure/${index}`;
    window.open(annexureUrl, "_blank");
  };

  // Open the annexure dialog and convert annexure IDs to links
  const handleAnnexureDialogOpen = (attachmentId, annexures) => {
    if (Array.isArray(annexures) && annexures.length > 0) {
      setSelectedAnnexures(
        annexures.map((_, index) => ({ id: attachmentId, index }))
      );
    } else {
      setSelectedAnnexures([]);
    }
    setOpenAnnexure(true);
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Blurred background image */}
      <div className="blurred-bg"></div>
      {/* Main content */}
      <div className="transparent-white p-6 max-w-4xl mx-auto shadow-lg rounded-lg relative">
        {/* Header with Search Bar */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Welcome, {username}</h2>
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 rounded-lg px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Loading & Error Handling */}
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Request</th>
                  <th className="py-2 px-4 border-b text-left">Reference No.</th>
                  <th className="py-2 px-4 border-b text-left">Created Date</th>
                  <th className="py-2 px-4 border-b text-left">View</th>
                  <th className="py-2 px-4 border-b text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id} className="border-b">
                      <td className="py-2 px-4">Network Request</td>
                      <td className="py-2 px-4">{req.workflowId || "N/A"}</td>
                      <td className="py-2 px-4">
                        {new Date(req.createdTime).toLocaleString() || "N/A"}
                      </td>
                      <td className="py-2 px-4">
                        {/* Annexure Button */}
                        <button
                          className="p-2 rounded-full border border-gray-300 hover:bg-gray-200 mr-2"
                          onClick={() =>
                            handleAnnexureDialogOpen(req.id, req.fileAnnexes)
                          }
                        >
                          <FaPaperclip />
                        </button>
                        {/* Main File Button */}
                        <button
                          className="p-2 rounded-full border border-gray-300 hover:bg-gray-200 mr-2"
                          onClick={() => handleDialogOpen(req.id)}
                        >
                          <FaEye />
                        </button>
                      </td>
                      <td className="py-2 px-4">
                        <button
                          className="p-2 rounded-full border border-gray-300 hover:bg-gray-200 mr-2"
                          onClick={() => console.log("View Request")}
                        >
                          <FaChartLine />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500">
                      No matching results found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Main PDF Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Open PDF</DialogTitle>
          <DialogContent>
            Click the button below to open your PDF file in a new tab.
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => handleOpenPdf(selectedPdf)}
              startIcon={<OpenInNewIcon />}
              variant="contained"
            >
              Open PDF
            </Button>
            <Button onClick={() => setOpen(false)} variant="outlined">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Annexure PDF Dialog */}
        <Dialog open={openAnnexure} onClose={() => setOpenAnnexure(false)}>
          <DialogTitle>Annexures</DialogTitle>
          <DialogContent>
            {selectedAnnexures.length > 0 ? (
              <List>
                {selectedAnnexures.map(({ id, index }) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleOpenAnnexure(id, index)}
                  >
                    <ListItemText primary={`Annexure ${index + 1}`} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <p>No annexures available.</p>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAnnexure(false)} variant="outlined">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
