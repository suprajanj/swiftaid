// Emergency.jsx
import React from "react";
import { DownloadIcon, AlertCircleIcon, MapPinIcon } from "lucide-react";
import { Sidebar } from "../components/Sidebar"; // Adjust path if needed

// Mock data
const mockEmergencyRequests = [
  {
    id: "req-001",
    name: "John Smith",
    age: 35,
    emergency: "Medical emergency - chest pain",
    number: "+1-555-0123",
    status: "critical",
    createdAt: "2024-01-15T10:30:00Z",
    location: {
      mapLink: "https://maps.google.com/?q=40.7128,-74.0060",
    },
  },
  {
    id: "req-002",
    name: "Sarah Johnson",
    age: 28,
    emergency: "Car accident on highway",
    number: "+1-555-0124",
    status: "in progress",
    createdAt: "2024-01-15T09:15:00Z",
    location: {
      mapLink: "https://maps.google.com/?q=40.7589,-73.9851",
    },
  },
  {
    id: "req-003",
    name: "Mike Davis",
    age: 42,
    emergency: "Fire in apartment building",
    number: "+1-555-0125",
    status: "pending",
    createdAt: "2024-01-15T08:45:00Z",
    location: {
      mapLink: "https://maps.google.com/?q=40.7505,-73.9934",
    },
  },
  {
    id: "req-004",
    name: "Emily Wilson",
    age: 31,
    emergency: "Flooding in basement",
    number: "+1-555-0126",
    status: "completed",
    createdAt: "2024-01-14T22:20:00Z",
    location: {
      mapLink: "https://maps.google.com/?q=40.7794,-73.9632",
    },
  },
];

// Header Component
const Header = ({ onDownloadAll }) => (
  <header className="bg-white shadow">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center">
        <AlertCircleIcon className="h-8 w-8 text-red-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">
          Emergency SOS Request Dashboard
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
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    "in progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    critical: "bg-red-100 text-red-800",
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const openMapLink = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (request.location.mapLink)
      window.open(request.location.mapLink, "_blank");
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        #{request.id.substring(0, 8)}...
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {request.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {request.age}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
        <div className="truncate" title={request.emergency}>
          {request.emergency}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {request.number}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[request.status.toLowerCase()] || "bg-gray-100 text-gray-800"}`}
        >
          {request.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(request.createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex space-x-2">
          {request.location.mapLink && (
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
              Status
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
              key={request.id}
              request={request}
              onDownload={() => onDownloadSingle(request.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Main Emergency Page
const Emergency = () => {
  const handleDownloadAll = () =>
    alert("Downloading all emergency requests...");
  const handleDownloadSingle = (id) => alert(`Downloading request: ${id}`);

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col">
        <Header onDownloadAll={handleDownloadAll} />

        <main className="mt-6 flex-1">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Total Requests
              </h3>
              <div className="text-3xl font-bold text-blue-600">
                {mockEmergencyRequests.length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Critical
              </h3>
              <div className="text-3xl font-bold text-red-600">
                {
                  mockEmergencyRequests.filter(
                    (req) => req.status === "critical"
                  ).length
                }
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                In Progress
              </h3>
              <div className="text-3xl font-bold text-yellow-600">
                {
                  mockEmergencyRequests.filter(
                    (req) => req.status === "in progress"
                  ).length
                }
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Completed
              </h3>
              <div className="text-3xl font-bold text-green-600">
                {
                  mockEmergencyRequests.filter(
                    (req) => req.status === "completed"
                  ).length
                }
              </div>
            </div>
          </div>

          {/* Emergency Requests Table */}
          <EmergencyRequestList
            requests={mockEmergencyRequests}
            onDownloadSingle={handleDownloadSingle}
          />
        </main>
      </div>
    </div>
  );
};

export default Emergency;
