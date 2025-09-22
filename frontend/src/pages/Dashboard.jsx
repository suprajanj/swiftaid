import React from "react";
import { Sidebar } from "../components/Sidebar";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 font-inter flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Welcome to SwiftAid Admin Panel</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Active Emergencies
            </h2>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-red-600">24</span>
              <span className="text-sm text-green-600 pb-1">
                +12% from last week
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Total Responders
            </h2>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-red-600">156</span>
              <span className="text-sm text-green-600 pb-1">
                +5% from last month
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Response Time
            </h2>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-red-600">4.2</span>
              <span className="text-sm text-gray-600 pb-1">minutes (avg)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
