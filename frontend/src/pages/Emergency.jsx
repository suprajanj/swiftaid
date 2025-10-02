import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { DownloadIcon, AlertCircleIcon, MapPinIcon } from "lucide-react";
import { Sidebar } from "../components/Sidebar";

// Header Component
const Header = ({ onDownloadAll }) => (
  <header className="bg-white shadow">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          SwiftAid SOS Requests
        </h1>
      </div>
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

// Emergency Request Item
const EmergencyRequestItem = ({ request, onDownload }) => {
  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleString() : "N/A";

  const openMapLink = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (request?.location?.mapLink) {
      window.open(request.location.mapLink, "_blank");
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        #{request?._id ? request._id.substring(0, 8) : "N/A"}...
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {request?.name || "Unknown"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {request?.age ?? "N/A"}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
        <div className="truncate" title={request?.emergency || ""}>
          {request?.emergency || "No details"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {request?.number || "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(request?.createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex space-x-2">
          {request?.location?.mapLink && (
            <button
              onClick={openMapLink}
              className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs"
              title="View on map"
            >
              <MapPinIcon className="h-4 w-4 mr-1" />
              Map
            </button>
          )}
          <button
            onClick={onDownload}
            className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs"
          >
            <DownloadIcon className="h-4 w-4 mr-1" />
            Download
          </button>
        </div>
      </td>
    </tr>
  );
};

// Emergency Request List
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

// PDF download helper (nice with autotable)
// PDF download helper - modern card style
const downloadPDF = (filename, data) => {
  const doc = new jsPDF();
  let y = 15;

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("SwiftAid - SOS Requests Report", 14, y);
  y += 10;

  // Timestamp
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, y);
  y += 10;

  // Draw cards for each request
  data.forEach((item, index) => {
    // Card border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(14, y, 182, 40, "S"); // x, y, width, height, style=S=stroke

    // ID & Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(
      `ID: ${item._id ? item._id.substring(0, 8) : index + 1}`,
      18,
      y + 8
    );
    doc.text(`Name: ${item.name || "N/A"}`, 60, y + 8);

    // Age & Contact
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Age: ${item.age || "N/A"}`, 18, y + 16);
    doc.text(`Contact: ${item.number || "N/A"}`, 60, y + 16);

    // Emergency
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(`Emergency: ${item.emergency || "N/A"}`, 18, y + 24, {
      maxWidth: 170,
    });

    // Map Link
    if (item.location?.mapLink) {
      doc.setTextColor(41, 128, 185);
      doc.text(`Map: ${item.location.mapLink}`, 18, y + 32, { maxWidth: 170 });
      doc.setTextColor(0, 0, 0); // reset color
    }

    y += 50; // move down for next card

    if (y > 270) {
      doc.addPage();
      y = 15;
    }
  });

  doc.save(filename);
};

// Main Emergency Page
const Emergency = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSOS = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/sos");
        setRequests(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching SOS requests:", err);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSOS();
  }, []);

  const handleDownloadAll = () => {
    if (requests.length === 0) return alert("No requests to download");
    downloadPDF("all_sos_requests.pdf", requests);
  };

  const handleDownloadSingle = (id) => {
    const req = requests.find((r) => r._id === id);
    if (!req) return alert("Request not found");
    downloadPDF(`sos_${id}.pdf`, [req]);
  };

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
