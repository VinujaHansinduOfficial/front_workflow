import { useState } from "react";
import axios from 'axios';

export default function WorkflowTemplate() {
  const [formName, setFormName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [formNo, setFormNo] = useState("");
  const [file, setFile] = useState(null);
  const [action, setAction] = useState("");
  const [actionType, setActionType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newTemplate = {
        formName,
        groupName,
        formNo,
    };

    try {
      const response = await axios.post('https://slt-workbench-backend.up.railway.app/api/template', newTemplate);
      console.log('Template created successfully', response.data);
      // Reset form after successful submission
      setFormName('');
      setGroupName('');
      setFormNo('');
    } catch (error) {
      console.error('Error creating template', error);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-4">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Template Info</h2>
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
                className="w-full border rounded-md p-2"
                value={formNo}
                onChange={(e) => setFormNo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Upload Form</label>
              <input
                type="file"
                className="w-full border rounded-md p-2"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          </div>
          <button
            className="bg-red-500 text-white p-2 rounded-md"
            onClick={() => {
              setFormName('');
              setGroupName('');
              setFormNo('');
              setFile(null);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-4 mt-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Progression Path</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Stage</label>
              <input
                className="w-full border rounded-md p-2"
                type="number"
                value={1}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Action</label>
              <select
                className="w-full border rounded-md p-2"
                onChange={(e) => setAction(e.target.value)}
              >
                <option value="Approve">Approve</option>
                <option value="Reject">Reject</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Action Type</label>
              <select
                className="w-full border rounded-md p-2"
                onChange={(e) => setActionType(e.target.value)}
              >
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>
          </div>
          <button
            className="bg-blue-500 text-white p-2 rounded-md"
            onClick={handleSubmit}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
