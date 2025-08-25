// App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Requests from "./Requests";
import Donations from "./Donations";

function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-6 text-center">
        SwiftAid Emergency Resource Management
      </h1>

      {/* Resource Requests Section */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Resource Requests</h2>
        <p className="mb-2">
          Manage emergency resource requests from organizations and hospitals.
        </p>
        <Link
          to="/requests"
          className="text-blue-400 hover:underline font-medium"
        >
          View Requests
        </Link>
      </div>

      {/* Donations Section */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Donations</h2>
        <p className="mb-2">
          Track and manage donation offers from volunteers and donors.
        </p>
        <Link
          to="/donations"
          className="text-blue-400 hover:underline font-medium"
        >
          View Donations
        </Link>
      </div>

      {/* System Status */}
      <p className="text-sm text-gray-400 mt-10">
        <strong>System Status:</strong> Backend server running on port 3000. MongoDB connected
        successfully. Ready for emergency resource management.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/donations" element={<Donations />} />
      </Routes>
    </Router>
  );
}
