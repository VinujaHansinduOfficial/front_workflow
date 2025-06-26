import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "./services/authService";
import { jwtDecode } from "jwt-decode";
import "./Route/NewRequests.css"; // Import the CSS for blurred background and transparency
import { UserContext } from "./contexts/UserContext"; // Adjust the import path as necessary
import { useContext } from "react";

export default function WorkflowTemplate() {
  const [formName, setFormName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [formNo, setFormNo] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [action, setAction] = useState("");
  const [actionType, setActionType] = useState("Standard"); // Default to "Standard"
  const [employeeName, setEmployeeName] = useState("");
  const { username, loading: userLoading } = useContext(UserContext);
  const [upTo, setUpTo] = useState(""); // <-- Add this line
  const [steps, setSteps] = useState([]); // To store step numbers for each supervisor

  const [supervisors, setSupervisors] = useState([]);
  const [names, setNames] = useState([]);
  const [actionTypes, setActionTypes] = useState([]);
  const [employees, setEmployees] = useState([]); // Holds all employees

  useEffect(() => {

    setActionTypes([
      "Approve",
      "Recommend/Approve",
      "Review",
      "Execute",
      "Reject",
      "Escalate",
    ]);

    // Fetch all employees
    axios
      .get("https://sltworkbenchbackend-production.up.railway.app/api/employee") // Update this URL as needed
      .then((res) => {
        setEmployees(res.data); // Store the list of employees
      })
      .catch((err) => console.error("Error fetching employees:", err));
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validFileType =
        selectedFile.type === "application/msword" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if (validFileType) {
        setFile(selectedFile);
        setFileError("");
      } else {
        setFile(null);
        setFileError("Please upload a Word (.doc or .docx) file only.");
        e.target.value = "";
      }
    }
  };

  const handleAddClick = () => {
    if (supervisors.length >= 6) {
      alert("You can only add up to six workflow actions.");
      return;
    }

    if (!action) {
      alert("Please select an action.");
      return;
    }

    // Only allow specific "Up to" values
    const allowedUpto = [
      "Upto General Manager",
      "Upto CEO",
      "Upto Marketing Manager",
    ];
    let normalizedUpto = upTo;
    if (actionType === "Standard") {
      if (!allowedUpto.includes(upTo)) {
        alert("Please select a valid 'Up to' value.");
        return;
      }
      // Normalize value to allowed set
      normalizedUpto = allowedUpto.find((val) => val === upTo) || "";
    } else {
      normalizedUpto = "";
    }

    const name = actionType === "Custom" ? employeeName : "Standard";
    // Use the next available step number (or 1 if none)
    const step = steps.length > 0 ? steps[steps.length - 1] + 1 : 1;
    setSupervisors((prev) => [
      ...prev,
      [action, actionType, normalizedUpto, step.toString(), normalizedUpto],
    ]);
    setNames((prev) => [...prev, name]);
    setSteps((prev) => [...prev, step]);
  };

  const handleStepChange = (index, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = value;
    setSteps(updatedSteps);

    // Update step in supervisors array as well
    setSupervisors((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = [
          updated[index][0],
          updated[index][1],
          updated[index][2],
          value.toString(),
          updated[index][4],
        ];
      }
      return updated;
    });
  };

  const resetForm = () => {
    setFormName("");
    setGroupName("");
    setFormNo("");
    setFile(null);
    setFileError("");
    setAction("");
    setActionType("Standard"); // Reset to "Standard"
    setEmployeeName("");
    setSupervisors([]);
    setNames([]);
    setUpTo(""); // Reset upTo field
    setSteps([]); // Reset steps
  };

  const handleCombinedSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setFileError("Please upload a valid Word file before submitting.");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("You are not authenticated. Please log in.");
      return;
    }

    const newTemplate = {
      formName,
      groupName,
      formNo,
    };

    try {
      const templateResponse = await axios.post(
        "https://sltworkbenchbackend-production.up.railway.app/api/template",
        newTemplate,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Template created:", templateResponse.data);

      const templateId = templateResponse.data.templateId;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("templateId", templateId);

      const fileResponse = await axios.post(
        `https://sltworkbenchbackend-production.up.railway.app/api/templatefile/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("File uploaded:", fileResponse.data);

      if (supervisors.length === 0) {
        alert("Please add at least one workflow action before submitting.");
        return;
      }

      // Build workflow JSON object using supervisors array for step and upto
      const workflowData = {
        formId: formNo,
        // Save upto as the last non-empty allowed "Up to" string, or null if none
        upto:
          (() => {
            const allowedUpto = [
              "Upto General Manager",
              "Upto CEO",
              "Upto Marketing Manager",
            ];
            for (let i = supervisors.length - 1; i >= 0; i--) {
              if (allowedUpto.includes(supervisors[i]?.[2])) {
                return supervisors[i][2];
              }
            }
            return null;
          })(),
      };
      for (let i = 0; i < 6; i++) {
        workflowData[`level${i + 1}`] = names[i] || null;
        workflowData[`step${i + 1}`] = supervisors[i]?.[3] || null;
        workflowData[`level${i + 1}Action`] = supervisors[i]?.[0] || null;
        workflowData[`level${i + 1}ActionType`] = supervisors[i]?.[1] || null;
        // Save only allowed "Up to" string or null
        const allowedUpto = [
          "Upto General Manager",
          "Upto CEO",
          "Upto Marketing Manager",
        ];
        workflowData[`level${i + 1}Upto`] = allowedUpto.includes(supervisors[i]?.[2])
          ? supervisors[i]?.[2]
          : null;
        // Add uptoX fields as per your sample JSON
        workflowData[`upto${i + 1}`] = allowedUpto.includes(supervisors[i]?.[2])
          ? supervisors[i]?.[2]
          : null;
      }

      const workflowResponse = await axios.post(
        "https://sltworkbenchbackend-production.up.railway.app/api/workflows",
        workflowData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Workflow submitted:", workflowResponse.data);
      alert("Form and Workflow submitted successfully");
      resetForm();
    } catch (error) {
      console.error("Error submitting form or workflow", error);
      alert("Error submitting form or workflow. Check console for details.");
    }
  };

  // Add this handler to remove a workflow action row
  const handleDeleteSupervisor = (index) => {
    setSupervisors((prev) => prev.filter((_, i) => i !== index));
    setNames((prev) => prev.filter((_, i) => i !== index));
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Blurred background image */}
      <div className="blurred-bg"></div>
      {/* Main content */}
      <div className="transparent-white p-6 max-w-2xl mx-auto relative" style={{ zIndex: 1 }}>
        <div className="bg-white shadow-lg rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Template Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Form Name</label>
              <input
                className="w-full border rounded-md p-2"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Group Name</label>
              <input
                className="w-full border rounded-md p-2"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Form No.</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full border rounded-md p-2"
                value={formNo}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setFormNo(value);
                  }
                }}
                placeholder="Enter a form number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Upload Form</label>
              <input
                type="file"
                className="w-full border rounded-md p-2"
                accept=".doc,.docx"
                onChange={handleFileChange}
              />
              {fileError && (
                <p className="text-red-500 text-sm mt-1">{fileError}</p>
              )}
            </div>
          </div>
          <button
            className="mt-4 bg-red-500 text-white p-2 rounded-md"
            onClick={resetForm}
          >
            Reset
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-4 mt-6">
          <h2 className="text-lg font-semibold mb-4">Progression Path</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Action</label>
              <select
                className="w-full border rounded-md p-2"
                onChange={(e) => setAction(e.target.value)}
              >
                <option value="">Select Action</option>
                {actionTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Action Type</label>
              <select
                className="w-full border rounded-md p-2"
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
              >
                <option value="Standard">Standard</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            {actionType === "Custom" && (
              <div className="col-span-2">
                <label className="block text-sm font-medium">Employee Name</label>
                <select
                  className="w-full border rounded-md p-2"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                >
                  <option value="">Select an employee</option>
                  {employees.map((emp) => (
                    <option key={emp.employeeNumber} value={emp.employeename}>
                      {emp.employeename}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {actionType === "Standard" && (
              <div className="col-span-2">
                <label className="block text-sm font-medium">Up to</label>
                <select
                  className="w-full border rounded-md p-2"
                  value={upTo}
                  onChange={(e) => setUpTo(e.target.value)}
                >
                  <option value="">Select Up to...</option>
                  <option value="Upto General Manager">Upto General Manager</option>
                  <option value="Upto CEO">Upto CEO</option>
                  <option value="Upto Marketing Manager">Upto Marketing Manager</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              className="bg-blue-500 text-white p-2 rounded-md"
              onClick={handleAddClick}
            >
              Add
            </button>
            <button
              className="bg-blue-500 text-white p-2 rounded-md"
              onClick={handleCombinedSubmit}
            >
              Submit Form & Workflow
            </button>
          </div>

          {supervisors.length > 0 && (
            <div className="mt-6 p-4 border rounded-md bg-gray-100">
              <h3 className="text-md font-semibold mb-2">Workflow Actions</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 rounded">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 border-b">Step</th>
                      <th className="px-3 py-2 border-b">Name</th>
                      <th className="px-3 py-2 border-b">Action</th>
                      <th className="px-3 py-2 border-b">Action Type</th>
                      <th className="px-3 py-2 border-b">Up to</th>
                      <th className="px-3 py-2 border-b">Delete</th> {/* New column */}
                    </tr>
                  </thead>
                  <tbody>
                    {supervisors.map((supervisor, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 border-b text-center">
                          <select
                            className="border rounded-md p-1"
                            value={supervisor[3] || steps[index] || index + 1}
                            onChange={(e) => handleStepChange(index, Number(e.target.value))}
                          >
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 border-b">{names[index]}</td>
                        <td className="px-3 py-2 border-b">{supervisor[0]}</td>
                        <td className="px-3 py-2 border-b">{supervisor[1]}</td>
                        <td className="px-3 py-2 border-b">
                          {/* Use supervisor[2] for upTo */}
                          {supervisor[1] === "Standard" ? supervisor[2] : "-"}
                        </td>
                        <td className="px-3 py-2 border-b text-center">
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded"
                            onClick={() => handleDeleteSupervisor(index)}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
