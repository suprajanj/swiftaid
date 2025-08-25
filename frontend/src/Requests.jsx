import { useState, useEffect } from "react";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [newRequest, setNewRequest] = useState("");

  // Load requests from backend
  useEffect(() => {
    fetch("http://localhost:3000/api/requests")
      .then((res) => res.json())
      .then((data) => setRequests(data));
  }, []);

  // Add request
  const addRequest = async () => {
    if (!newRequest) return;
    const res = await fetch("http://localhost:3000/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRequest }),
    });
    const data = await res.json();
    setRequests([...requests, data]); // update state
    setNewRequest("");
  };

  // Delete request
  const deleteRequest = async (id) => {
    await fetch(`http://localhost:3000/api/requests/${id}`, { method: "DELETE" });
    setRequests(requests.filter((r) => r._id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Resource Requests</h1>

      {/* Input box to add new request */}
      <div className="mb-4 flex gap-2">
        <input
          className="p-2 rounded text-black"
          placeholder="New request..."
          value={newRequest}
          onChange={(e) => setNewRequest(e.target.value)}
        />
        <button
          onClick={addRequest}
          className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      {/* Show list of requests */}
      <ul>
        {requests.map((req) => (
          <li
            key={req._id}
            className="flex justify-between items-center bg-gray-800 p-2 mb-2 rounded"
          >
            {req.name}
            <button
              onClick={() => deleteRequest(req._id)}
              className="text-red-400 hover:text-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
