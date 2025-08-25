import { useState, useEffect } from "react";

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [newDonation, setNewDonation] = useState("");

  // Load donations
  useEffect(() => {
    fetch("http://localhost:3000/api/donations")
      .then((res) => res.json())
      .then((data) => setDonations(data));
  }, []);

  // Add donation
  const addDonation = async () => {
    if (!newDonation) return;
    const res = await fetch("http://localhost:3000/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDonation }),
    });
    const data = await res.json();
    setDonations([...donations, data]);
    setNewDonation("");
  };

  // Delete donation
  const deleteDonation = async (id) => {
    await fetch(`http://localhost:3000/api/donations/${id}`, { method: "DELETE" });
    setDonations(donations.filter((d) => d._id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Donations</h1>

      {/* Add new donation */}
      <div className="mb-4 flex gap-2">
        <input
          className="p-2 rounded text-black"
          placeholder="New donation..."
          value={newDonation}
          onChange={(e) => setNewDonation(e.target.value)}
        />
        <button
          onClick={addDonation}
          className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
        >
          Add
        </button>
      </div>

      {/* Show list of donations */}
      <ul>
        {donations.map((don) => (
          <li
            key={don._id}
            className="flex justify-between items-center bg-gray-800 p-2 mb-2 rounded"
          >
            {don.name}
            <button
              onClick={() => deleteDonation(don._id)}
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
