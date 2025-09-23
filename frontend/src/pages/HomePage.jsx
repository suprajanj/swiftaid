import React from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import {
  Users,
  AlertTriangle,
  Shield,
  Settings,
  BarChart3,
  Download,
  Eye,
  CheckCircle,
} from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Supportive Organizations Portal
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Secure access to verified emergency case data for NGOs, Media, and
              Insurance companies
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/organization/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                <Users className="h-5 w-5 mr-2" />
                Organization Dashboard
              </Link>
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                <Shield className="h-5 w-5 mr-2" />
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive emergency case management with role-based access
              control
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                  Organization Management
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Manage access for NGOs, Media agencies, and Insurance companies
                with role-based permissions.
              </p>
              <Link
                to="/admin/panel"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
              >
                Manage Organizations
                <Settings className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                  Emergency Cases
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                View, filter, and manage verified emergency case data with
                comprehensive reporting.
              </p>
              <Link
                to="/emergency-cases"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
              >
                View Cases
                <Eye className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                  Analytics & Reports
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Comprehensive dashboards with real-time statistics and export
                capabilities.
              </p>
              <Link
                to="/organization/dashboard"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
              >
                View Analytics
                <BarChart3 className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                  Secure Access
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Role-based access control with audit logging and secure data
                sharing.
              </p>
              <Link
                to="/admin/dashboard"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
              >
                Access Control
                <Shield className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Download className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                  Data Export
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Export verified emergency case data in CSV format for analysis
                and reporting.
              </p>
              <span className="text-gray-500 font-medium inline-flex items-center">
                Available in Dashboard
                <CheckCircle className="h-4 w-4 ml-1" />
              </span>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Settings className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                  Admin Panel
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Complete administrative control over organizations, access
                levels, and system settings.
              </p>
              <Link
                to="/admin/panel"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
              >
                Admin Panel
                <Settings className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
