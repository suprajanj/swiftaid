import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { DownloadIcon, MapPinIcon } from "lucide-react";
import { Sidebar } from "../components/Sidebar";

// -------------------- PDF download helper --------------------
const downloadPDF = (filename, data) => {
  const doc = new jsPDF();
  let y = 15;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("SwiftAid - SOS Requests Report", 14, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, y);
  y += 10;

  data.forEach((item, index) => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(14, y, 182, 40, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(
      `ID: ${item._id ? item._id.substring(0, 8) : index + 1}`,
      18,
      y + 8
    );
    doc.text(`Name: ${item.name || "N/A"}`, 60, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Age: ${item.age || "N/A"}`, 18, y + 16);
    doc.text(`Contact: ${item.number || "N/A"}`, 60, y + 16);

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(`Emergency: ${item.emergency || "N/A"}`, 18, y + 24, {
      maxWidth: 170,
    });

    if (item.location?.mapLink) {
      doc.setTextColor(41, 128, 185);
      doc.text(`Map: ${item.location.mapLink}`, 18, y + 32, { maxWidth: 170 });
      doc.setTextColor(0, 0, 0);
    }

    y += 50;
    if (y > 270) {
      doc.addPage();
      y = 15;
    }
  });

  doc.save(filename);
};

// -------------------- Header Component --------------------
const Header = ({ onDownloadAll }) => (
  <header className="bg-white shadow">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">
        SwiftAid SOS Requests
      </h1>
      <button
        onClick={onDownloadAll}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        <DownloadIcon className="h-5 w-5 mr-2" />
        Download All
      </button>
    </div>
  </header>
);

// -------------------- Emergency Request Item --------------------
const EmergencyRequestItem = ({ request, onDownload }) => {
  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleString() : "N/A";

  const openMapLink = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (request?.location?.mapLink)
      window.open(request.location.mapLink, "_blank");
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        #{request?._id?.substring(0, 8) || "N/A"}...
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {request?.name || "Unknown"}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {request?.age ?? "N/A"}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
        <div className="truncate" title={request?.emergency || ""}>
          {request?.emergency || "No details"}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {request?.number || "N/A"}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {formatDate(request?.createdAt)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 flex space-x-2">
        {request?.location?.mapLink && (
          <button
            onClick={openMapLink}
            className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs"
            title="View on map"
          >
            <MapPinIcon className="h-4 w-4 mr-1" /> Map
          </button>
        )}
        <button
          onClick={onDownload}
          className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs"
        >
          <DownloadIcon className="h-4 w-4 mr-1" /> Download
        </button>
      </td>
    </tr>
  );
};

// -------------------- Emergency Request List --------------------
const EmergencyRequestList = ({ requests, onDownloadSingle }) => (
  <div className="bg-white shadow rounded-lg overflow-hidden">
    <div className="p-4 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800">
        Emergency SOS Requests
      </h2>
      <p className="text-gray-600">Showing {requests.length} requests</p>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Age
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Emergency
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <EmergencyRequestItem
              key={request?._id}
              request={request}
              onDownload={() => onDownloadSingle(request?._id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// -------------------- Emergency Page with Session Management --------------------
const Emergency = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // -------------------- Logout Function --------------------
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("sessionExpiry");
    sessionStorage.clear();
    window.location.href = "/login"; // redirect to login
  }, []);

  // -------------------- Fetch User & Session Validation --------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleLogout();
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Session error:", err);
        handleLogout();
      }
    };

    fetchUser();
  }, [handleLogout]);

  // -------------------- Auto-logout when token expires --------------------
  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = localStorage.getItem("token");
      const expiry = localStorage.getItem("sessionExpiry");

      if (token && expiry) {
        const now = new Date().getTime();
        if (now > parseInt(expiry)) handleLogout();
      } else if (token && !expiry) {
        const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000;
        localStorage.setItem("sessionExpiry", expiryTime.toString());
      }
    };

    const interval = setInterval(checkTokenExpiry, 60000);
    checkTokenExpiry();
    return () => clearInterval(interval);
  }, [handleLogout]);

  // -------------------- Fetch SOS Requests --------------------
  useEffect(() => {
    if (!user) return; // wait until user session is loaded

    const fetchSOS = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/sos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching SOS requests:", err);
        if (err.response?.status === 401) handleLogout();
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSOS();
  }, [user, handleLogout]);

  // -------------------- PDF Downloads --------------------
  const handleDownloadAll = () => {
    if (requests.length === 0) return alert("No requests to download");
    downloadPDF("all_sos_requests.pdf", requests);
  };

  const handleDownloadSingle = (id) => {
    const req = requests.find((r) => r._id === id);
    if (!req) return alert("Request not found");
    downloadPDF(`sos_${id}.pdf`, [req]);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex">
      <Sidebar />
      <div className="flex-1 p-6 flex flex-col">
        <Header onDownloadAll={handleDownloadAll} />
        <main className="mt-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Total Requests
              </h3>
              <div className="text-3xl font-bold text-blue-600">
                {requests.length}
              </div>
            </div>
          </div>
          {loading ? (
            <div className="text-center text-gray-600">Loading...</div>
          ) : (
            <EmergencyRequestList
              requests={requests}
              onDownloadSingle={handleDownloadSingle}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Emergency;
