import React from "react";
import { Link } from "react-router-dom";
import Navigation from "../../components/orgcomponents/Navigation";
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
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
              <Shield className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Trusted Emergency Management Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Supportive Organizations
              <span className="block text-green-300">Portal</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-blue-100 leading-relaxed">
              Secure access to verified emergency case data for NGOs, Media, and
              Insurance companies
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/organization/dashboard"
                className="group inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Users className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Organization Dashboard
              </Link>
              <Link
                to="/admin/dashboard"
                className="group inline-flex items-center justify-center px-8 py-4 border-2 border-white text-base font-medium rounded-lg text-white hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-300 transform hover:-translate-y-1"
              >
                <Shield className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
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
            <div className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                  Organization Management
                </h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Manage access for NGOs, Media agencies, and Insurance companies
                with role-based permissions.
              </p>
              <Link
                to="/admin/panel"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center group-hover:gap-2 transition-all"
              >
                Manage Organizations
                <Settings className="h-4 w-4 ml-1 group-hover:rotate-90 transition-transform duration-300" />
              </Link>
            </div>

            <div className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-red-100 to-red-200 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                  Emergency Cases
                </h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                View, filter, and manage verified emergency case data with
                comprehensive reporting.
              </p>
              <Link
                to="/emergency-cases"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center group-hover:gap-2 transition-all"
              >
                View Cases
                <Eye className="h-4 w-4 ml-1 group-hover:scale-110 transition-transform duration-300" />
              </Link>
            </div>

            <div className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                  Analytics & Reports
                </h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Comprehensive dashboards with real-time statistics and export
                capabilities.
              </p>
              <Link
                to="/organization/dashboard"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center group-hover:gap-2 transition-all"
              >
                View Analytics
                <BarChart3 className="h-4 w-4 ml-1 group-hover:scale-110 transition-transform duration-300" />
              </Link>
            </div>

            <div className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                  Secure Access
                </h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Role-based access control with audit logging and secure data
                sharing.
              </p>
              <Link
                to="/admin/dashboard"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center group-hover:gap-2 transition-all"
              >
                Access Control
                <Shield className="h-4 w-4 ml-1 group-hover:scale-110 transition-transform duration-300" />
              </Link>
            </div>

            <div className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Download className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                  Data Export
                </h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Export verified emergency case data in CSV format for analysis
                and reporting.
              </p>
              <span className="text-gray-500 font-medium inline-flex items-center">
                Available in Dashboard
                <CheckCircle className="h-4 w-4 ml-1 group-hover:scale-110 transition-transform duration-300" />
              </span>
            </div>

            <div className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Settings className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                  Admin Panel
                </h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Complete administrative control over organizations, access
                levels, and system settings.
              </p>
              <Link
                to="/admin/panel"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center group-hover:gap-2 transition-all"
              >
                Admin Panel
                <Settings className="h-4 w-4 ml-1 group-hover:rotate-90 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
