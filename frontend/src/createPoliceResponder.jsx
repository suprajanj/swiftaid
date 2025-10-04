import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CreatePoliceResponder = () => {
  const [name, setName] = useState("");
  const [NIC, setNIC] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [position, setPosition] = useState("Patrol Officer");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    if (!nicRegex.test(NIC)) {
      toast.error("Invalid NIC format. Must be 9 digits + V/v/X/x or 12 digits.");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:3000/api/create-responder", {
        NIC,
        name,
        email,
        contactNumber,
        password,
        address,
        position,
        responderType: "police", // ✅ matches backend
      });

      toast.success(res.data.message || "✅ Police responder created successfully!");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error("Error creating police responder:", err);
      toast.error(err.response?.data?.error || "❌ Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 p-6">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-center text-3xl font-extrabold text-blue-700 mb-6">
          🚓 Create Police Responder
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="text" placeholder="NIC (Old or New)" value={NIC} onChange={(e) => setNIC(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="text" placeholder="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="text" placeholder="Station / Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />

          <select value={position} onChange={(e) => setPosition(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Patrol Officer">Patrol Officer</option>
            <option value="Detective">Detective</option>
            <option value="Inspector">Inspector</option>
            <option value="SWAT">SWAT</option>
          </select>

          <button type="submit" className="w-full py-2 mt-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition">
            Create Police Account
          </button>
        </form>
        <div>
          <button className="mt-4 text-center bg-blue-600 py-2 rounded hover:bg-blue-950">
            <a href="/login" className="text-white hover:underline">Already have an account? Login</a>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePoliceResponder;
