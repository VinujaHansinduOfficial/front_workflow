import React, { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode"; // Use named import for jwtDecode
import "./NewRequests.css"; // Import the CSS file
import { UserContext } from "../contexts/UserContext"; // Adjust the import path as necessary
import { useContext } from "react"; // Import useContext to access UserContext

const NewRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [annexFiles, setAnnexFiles] = useState([]);
  const [visibleInputs, setVisibleInputs] = useState(1);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State variable for loading screen
  const [formPaths, setFormPaths] = useState({}); // Updated to be dynamic
  const [formNames, setFormNames] = useState([]); // Store form names for the dropdown
  const [formIds, setFormIds] = useState({}); // Store form IDs for the dropdown
  const { username, loading: userLoading } = useContext(UserContext); // State for username
  const [workflowDetails, setWorkflowDetails] = useState(null); // State for workflow details
  const [flowNames, setFlowNames] = useState([]); // State to store flow names
  const [Hierarchy, setHierarchy] = useState([]); // State to store approval hierarchy
  const [uniqueworkflowId, setUniqueworkflowId] = useState(null); // System-generated unique workflow ID (long, not null)

  const createdBy = username; // Hardcoded creator name
  const workflowId = 1; // Hardcoded workflow ID

  useEffect(() => {
    // Fetch data from the API
    const fetchTemplates = async () => {
      try {
        const response = await fetch(
          "https://slt-workbench-backend.up.railway.app/api/template/getall"
        );
        if (!response.ok) throw new Error("Failed to fetch templates");
        const data = await response.json();

        // Process the data to extract formNames, formPaths, and formIds
        const paths = {};
        const names = [];
        const ids = {};
        data.forEach((item) => {
          const formUrl = `data:${item.templateFile.contentType};base64,${item.templateFile.form}`;
          paths[item.formName] = formUrl;
          names.push(item.formName);
          ids[item.formName] = item.formNo; // Use 'formNo' instead of 'id'
        });

        setFormPaths(paths);
        setFormNames(names);
        setFormIds(ids);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  

  const fetchWorkflowDetails = async (formId) => {
    try {
      const response = await fetch(`https://slt-workbench-backend.up.railway.app/api/workflows/${formId}`);
      if (!response.ok) throw new Error("Failed to fetch workflow details");
      const data = await response.json();
      setWorkflowDetails(data);
    } catch (error) {
      console.error("Error fetching workflow details:", error);
      setWorkflowDetails(null);
    }
  };

  useEffect(() => {
    if (selectedRequest && formIds[selectedRequest]) {
      fetchWorkflowDetails(formIds[selectedRequest]);
    } else {
      setWorkflowDetails(null);
    }
  }, [selectedRequest, formIds]);

  const getFlowNames = useCallback(async () => {
    if (!workflowDetails) {
      console.error("Workflow details are not available.");
      return;
    }

    // Fetch all supervisors for step 1 (multiple supervisors possible)
    let supervisors = [];
    try {
      const response = await fetch(
        `https://slt-workbench-backend.up.railway.app/api/employee/workflow/${createdBy}`
      );
      if (!response.ok) throw new Error("Failed to fetch supervisor data");
      supervisors = await response.json();

      // Extract all supervisor names from the array (removing duplicates)
      const step1Names = Array.from(
        new Set(
          supervisors
            .map((sup) => sup.supervisor_name)
            .filter((name) => !!name)
        )
      );

      // Fill all 5 steps with the same names as step 1
      const namesByStep = Array(5).fill(step1Names);

      setFlowNames(namesByStep);
      console.log("Flow Names By Step:", namesByStep);
    } catch (error) {
      console.error("Error determining flow names:", error);
    }
  }, [workflowDetails, createdBy]);

  useEffect(() => {
    if (workflowDetails) {
      getFlowNames();
    }
  }, [workflowDetails, getFlowNames]);

  useEffect(() => {
    if (workflowDetails && flowNames.length > 0) {
      const hierarchyData = [];
      // Count how many approvalStage (levelXAction) fields exist in workflowDetails
      let approvalStageCount = 0;
      for (let i = 1; i <= 5; i++) {
        if (workflowDetails[`level${i}Action`]) {
          approvalStageCount++;
        }
      }
      // Only display rows for the number of approvalStage in the database
      for (let i = 1; i <= approvalStageCount; i++) {
        const step = workflowDetails[`step${i}`] || "N/A";
        const approvalStage = workflowDetails[`level${i}Action`] || "N/A";
        const namesForStep = flowNames[i - 1] || [];
        for (let n = 0; n < namesForStep.length; n++) {
          hierarchyData.push({
            stage: step,
            approvalStage: approvalStage, // keep original value, do not map "Approve" to "Standard"
            assignee: namesForStep[n],
          });
        }
      }
      setHierarchy(hierarchyData);
    } else {
      setHierarchy([]); // Clear table if no data
    }
  }, [workflowDetails, flowNames]);

  const postWorkProgress = async (attachmentId, uniqueId) => {
    if (!Hierarchy.length) {
      alert("No hierarchy data available to post.");
      return;
    }

    try {
      for (const [index, item] of Hierarchy.entries()) {
        const payload = {
          workflowId: String(uniqueId), // Use the passed unique workflow ID
          stage: item.approvalStage,
          request: selectedRequest,
          assignee: item.assignee,
          assigner: createdBy,
          status: "In Progress",
          assignerComment: comment || "No comments provided",
          assignerUpdatedTime: new Date().toISOString(),
          attachmentId,
        };

        const response = await fetch("https://slt-workbench-backend.up.railway.app/api/workprogress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`Failed to post work progress for stage ${index + 1}`);
      }

      alert("Work progress posted successfully!");
    } catch (error) {
      console.error("Error posting work progress:", error);
      alert("Failed to post work progress.");
    }
  };

  const handleAuxFileChange = (index, file) => {
    setAnnexFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = file;
      return newFiles;
    });

    // Show the next input field if available
    if (index + 1 < 6) {
      setVisibleInputs(index + 2);
    }
  };

  const generateUniqueWorkflowId = () => {
    // Generate a unique long value using timestamp, random number, and numeric part of username
    let userNum = 0;
    if (createdBy && typeof createdBy === "string") {
      // Convert each char to char code and sum, or extract digits if username contains numbers
      userNum = createdBy
        .split("")
        .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    }
    return Date.now() * 100000 + Math.floor(Math.random() * 100000) + userNum;
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) {
      alert("Please select a file to upload.");
      return;
    }

    setIsLoading(true); // Show loading screen

    // Generate uniqueId before using it
    let uniqueId = generateUniqueWorkflowId();

    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("createdBy", createdBy);
    formData.append("workflowId", String(uniqueId));

    // Append each annex file individually
    annexFiles.forEach((file) => {
      if (file) {
        formData.append("auxFiles", file);
      }
    });

    try {
      const response = await fetch(
        "https://slt-workbench-backend.up.railway.app/api/attachments/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("File upload failed");

      const data = await response.json();
      alert("File uploaded successfully!");
      console.log(data);

      // If backend does not return a valid uniqueworkflowId, generate one on frontend
      if (
        data.uniqueworkflowId !== undefined &&
        data.uniqueworkflowId !== null &&
        !isNaN(data.uniqueworkflowId) &&
        typeof data.uniqueworkflowId === "number"
      ) {
        uniqueId = data.uniqueworkflowId;
      } else if (
        data.uniqueworkflowId !== undefined &&
        data.uniqueworkflowId !== null &&
        !isNaN(Number(data.uniqueworkflowId))
      ) {
        uniqueId = Number(data.uniqueworkflowId);
      }
      setUniqueworkflowId(uniqueId);

      // Pass attachmentId and uniqueId to postWorkProgress
      const attachmentId = data.id; // Assuming the response contains the new attachment ID
      postWorkProgress(attachmentId, uniqueId); // <-- pass uniqueId here

      // Reset state after successful upload
      setUploadedFile(null);
      setAnnexFiles([]);
      setVisibleInputs(1);
      setComment("");

      // Hide loading screen after 2 seconds
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed.");
      setIsLoading(false); // Hide loading screen on error
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Blurred background image */}
      <div className="blurred-bg"></div>
      {/* Main content */}
      <div
        className="p-10 max-w-4xl mx-auto shadow-lg rounded-lg relative transparent-white"
        style={{ zIndex: 1 }}
      >
        {isLoading && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex flex-col items-center justify-center z-50">
            <div className="spinner"></div>
            <div className="loading-text">Loading...</div>
          </div>
        )}
        {/* Step 1: Select Request Type */}
        <div className="mb-10 p-6 border rounded bg-gray-100">
          <h3 className="text-lg font-semibold">Step 1</h3>
          <p className="text-gray-600">Select the request type (Required)</p>
          <select
            className="w-full p-3 border mt-3 rounded focus:ring focus:ring-blue-300"
            value={selectedRequest}
            onChange={(e) => setSelectedRequest(e.target.value)}
          >
            <option value="">Select a request...</option>
            {formNames.map((name, idx) => (
              <option
                key={`${name}_${formIds[name] || idx}`} // Ensure unique key
                value={name}
              >
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Download the Form */}
        <div className="mb-10 p-6 border rounded bg-gray-100">
          <h3 className="text-lg font-semibold">Step 2</h3>
          <p className="text-gray-600">Download the blank form.</p>
          {selectedRequest && formPaths[selectedRequest] ? (
            <>
              <a
                href={formPaths[selectedRequest]}
                download
                className="bg-blue-500 text-white px-6 py-3 rounded mt-3 hover:bg-blue-600 transition inline-block"
              >
                Download Form
              </a>
              <p className="mt-3 text-gray-700">
                Form No: {formIds[selectedRequest]} {/* Display formNo */}
              </p>
            </>
          ) : (
            <p className="text-gray-500 mt-3">
              Please select a request to enable downloading.
            </p>
          )}
        </div>

        {/* Step 3: Upload Completed Form */}
        <div className="mb-10 p-6 border rounded bg-gray-100">
          <h3 className="text-lg font-semibold">Step 3</h3>
          <p className="text-gray-600">
            Upload the completed form as PDF. (Required)
          </p>
          <input
            type="file"
            accept=".pdf"
            className="mt-3 border rounded p-3 w-full"
            onChange={(e) => setUploadedFile(e.target.files[0])}
          />
          {uploadedFile && (
            <p className="mt-3 text-green-500">
              File selected: {uploadedFile.name}
            </p>
          )}
        </div>

        {/* Step 4: Upload Annexes */}
        <div className="mb-10 p-6 border rounded bg-gray-100">
          <h3 className="text-lg font-semibold">Step 4</h3>
          <p className="text-gray-600">
            Upload up to 6 auxiliary files (Optional).
          </p>
          {[...Array(6)].map((_, index) => (
            <div key={index} className="mt-3">
              {index < visibleInputs && (
                <input
                  type="file"
                  accept=".pdf,.jpg,.png,.jpeg"
                  className="border rounded p-3 w-full"
                  onChange={(e) => handleAuxFileChange(index, e.target.files[0])}
                />
              )}
              {annexFiles[index] && (
                <p className="text-green-500">{annexFiles[index].name}</p>
              )}
            </div>
          ))}
        </div>

        {/* Step 5: Additional Comments */}
        <div className="mb-10 p-6 border rounded bg-gray-100">
          <h3 className="text-lg font-semibold">Step 5 (Optional)</h3>
          <p className="text-gray-600">Description</p>
          <input
            type="text"
            className="mt-3 border rounded p-3 w-full focus:ring focus:ring-blue-300"
            placeholder="Enter details here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={() => {
            handleFileUpload();
          }}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition w-full"
        >
          Submit Request
        </button>

        {/* Approval Hierarchy Table */}
        <div className="mt-10 p-10 border rounded-lg bg-gray-50 shadow-lg">
          <h3 className="text-2xl font-bold text-center mb-6">Approval Hierarchy</h3>
          <table className="w-full mt-4 border text-lg">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="border px-6 py-3">Stage</th>
                <th className="border px-6 py-3">Approval Stage</th>
                <th className="border px-6 py-3">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {Hierarchy.map((item, index) => (
                <tr
                  key={index}
                  className="border bg-white hover:bg-gray-100 transition"
                >
                  <td className="border px-6 py-3">{item.stage}</td>
                  <td className="border px-6 py-3">{item.approvalStage}</td>
                  <td className="border px-6 py-3">{item.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NewRequests;
