import { useState } from "react";
import { Switch } from "@headlessui/react";

export default function WorkflowManager() {
  const [useTemplateName, setUseTemplateName] = useState(true);
  const [useApprovalsList, setUseApprovalsList] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold">Template Info (ID: 015751250306054921)</h2>
      <div className="bg-yellow-100 p-3 rounded-md mt-3">
        <p>
          <strong>Current Form name:</strong> <span className="text-blue-600">Cd/VF 32</span>
        </p>
        <p>
          <strong>Current File name:</strong>{" "}
          <span className="text-blue-600 underline cursor-pointer">test.doc.docx</span>
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <input type="text" placeholder="Form Name" className="mt-1 w-full border p-2 rounded" />
        <input type="text" placeholder="Group Name" className="mt-1 w-full border p-2 rounded" />
        <input type="text" placeholder="Form No" className="mt-1 w-full border p-2 rounded" />
      </div>
      
      <div className="mt-4">
        <label className="text-gray-700 text-sm">Template Name</label>
        <input
          type="file"
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="mt-1 w-full border p-2 rounded"
        />
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Switch
          checked={useTemplateName}
          onChange={setUseTemplateName}
          className={`${useTemplateName ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span className="sr-only">Use current template name</span>
          <span
            className={`${useTemplateName ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform bg-white rounded-full transition`}
          />
        </Switch>
        <span>Use current template name</span>
      </div>
      
      <div className="mt-2 flex items-center gap-4">
        <Switch
          checked={useApprovalsList}
          onChange={setUseApprovalsList}
          className={`${useApprovalsList ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span className="sr-only">Use current approvals list</span>
          <span
            className={`${useApprovalsList ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform bg-white rounded-full transition`}
          />
        </Switch>
        <span>Use current approvals list</span>
      </div>
      
      <div className="mt-4">
        <label className="text-gray-700 text-sm">Upload Form (upload a .docx file)</label>
        <input type="file" className="mt-1 w-full border p-2 rounded" />
      </div>
      
      <div className="mt-4 flex gap-4">
        <button className="bg-red-500 text-white px-4 py-2 rounded">Reset</button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Update Template</button>
      </div>
      
      <table className="mt-6 w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Stage</th>
            <th className="border p-2">Action Type</th>
            <th className="border p-2">Action</th>
            <th className="border p-2">Action Description</th>
            <th className="border p-2">Assignee</th>
            <th className="border p-2">Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">-</td>
            <td className="border p-2">-</td>
            <td className="border p-2">-</td>
            <td className="border p-2">-</td>
            <td className="border p-2">-</td>
            <td className="border p-2">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
