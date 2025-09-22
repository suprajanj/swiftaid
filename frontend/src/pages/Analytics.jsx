import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Sidebar } from "../components/Sidebar";

export function Analytics() {
  // Sample data for charts
  const userActivityData = [
    { name: "Jan", users: 400, emergencies: 240 },
    { name: "Feb", users: 300, emergencies: 139 },
    { name: "Mar", users: 200, emergencies: 980 },
    { name: "Apr", users: 278, emergencies: 390 },
    { name: "May", users: 189, emergencies: 480 },
    { name: "Jun", users: 239, emergencies: 380 },
    { name: "Jul", users: 349, emergencies: 430 },
  ];

  const emergencyTypeData = [
    { name: "Medical", value: 65 },
    { name: "Fire", value: 15 },
    { name: "Accident", value: 45 },
    { name: "Natural", value: 20 },
    { name: "Other", value: 10 },
  ];

  const responseTimeData = [
    { name: "Mon", time: 4.2 },
    { name: "Tue", time: 3.8 },
    { name: "Wed", time: 5.1 },
    { name: "Thu", time: 4.5 },
    { name: "Fri", time: 3.9 },
    { name: "Sat", time: 4.8 },
    { name: "Sun", time: 5.2 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
          <p className="text-gray-600">
            Monitor key metrics and performance indicators
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Total Users
            </h2>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-red-600">3,457</span>
              <span className="text-sm text-green-600 pb-1">+12.5%</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Compared to previous month
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Active Emergencies
            </h2>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-red-600">24</span>
              <span className="text-sm text-red-600 pb-1">+8.2%</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Compared to previous month
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Completed Requests
            </h2>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-red-600">1,284</span>
              <span className="text-sm text-green-600 pb-1">+23.7%</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Compared to previous month
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              User & Emergency Activity
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#3b82f6" name="Users" />
                  <Bar
                    dataKey="emergencies"
                    fill="#ef4444"
                    name="Emergencies"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Average Response Time (minutes)
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="#ef4444"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Extra section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Emergency Types
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emergencyTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ef4444" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              User Distribution
            </h2>
            <div className="flex items-center justify-center h-72">
              <div className="grid grid-cols-3 gap-6 w-full">
                <div className="flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-red-100 border-8 border-red-500 flex items-center justify-center">
                    <span className="text-xl font-bold text-red-700">65%</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-700">
                    Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">2,247</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-blue-100 border-8 border-blue-500 flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-700">25%</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-700">
                    Responders
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">864</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-purple-100 border-8 border-purple-500 flex items-center justify-center">
                    <span className="text-xl font-bold text-purple-700">
                      10%
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-700">
                    Admins
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">346</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
