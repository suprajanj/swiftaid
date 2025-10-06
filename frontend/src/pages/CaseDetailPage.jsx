import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import api from "../services/api";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  AlertTriangle,
  Shield,
  Clock,
  FileText,
  Download,
  Send,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const CaseDetailPage = () => {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportForm, setReportForm] = useState({
    reportType: "Support Request",
    content: "",
  });
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      const response = await api.getCaseById(id);
      setCaseData(response.data);
      toast.success("Case details loaded successfully");
    } catch (error) {
      console.error("Error fetching case details:", error);
      toast.error(error.message || "Failed to load case details");
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportForm.content.trim()) {
      toast.error("Please enter report content");
      return;
    }

    try {
      setSubmittingReport(true);
      const response = await api.submitReport(id, reportForm);

      if (response.success) {
        toast.success(response.message || "Report submitted successfully");
        setReportForm({ reportType: "Support Request", content: "" });
        fetchCaseDetails(); // Refresh case data
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error(error.message || "Failed to submit report");
    } finally {
      setSubmittingReport(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Under Investigation":
        return "bg-yellow-100 text-yellow-800";
      case "Verified":
        return "bg-blue-100 text-blue-800";
      case "Reported":
        return "bg-gray-100 text-gray-800";
      case "Closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReportStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "text-green-600";
      case "Rejected":
        return "text-red-600";
      case "Under Review":
        return "text-yellow-600";
      case "Pending":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Case not found
            </h3>
            <p className="text-gray-500">
              The requested emergency case could not be found.
            </p>
            <Link
              to="/emergency-cases"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cases
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link
              to="/emergency-cases"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Cases
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {caseData.title}
              </h1>
              <p className="text-gray-600 mt-1">Case ID: {caseData.caseId}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Overview */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Case Overview
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-center space-x-4 mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(caseData.severity)}`}
                  >
                    {caseData.severity}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {caseData.incidentType}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(caseData.status)}`}
                  >
                    {caseData.status}
                  </span>
                  {caseData.verificationStatus?.isVerified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Shield className="h-4 w-4 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-4">{caseData.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>
                      {caseData.location?.address},{" "}
                      {caseData.location?.district}, {caseData.location?.state}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(caseData.dateTime).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Affected People */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Affected People
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {caseData.affectedPeople?.injured || 0}
                    </div>
                    <div className="text-sm text-gray-600">Injured</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {caseData.affectedPeople?.deceased || 0}
                    </div>
                    <div className="text-sm text-gray-600">Deceased</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {caseData.affectedPeople?.evacuated || 0}
                    </div>
                    <div className="text-sm text-gray-600">Evacuated</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Agencies */}
            {caseData.assignedAgencies &&
              caseData.assignedAgencies.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">
                      Assigned Agencies
                    </h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-3">
                      {caseData.assignedAgencies.map((agency, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-gray-900">
                              {agency.agency}
                            </div>
                            {agency.contactPerson && (
                              <div className="text-sm text-gray-600">
                                Contact: {agency.contactPerson}
                              </div>
                            )}
                            {agency.phone && (
                              <div className="text-sm text-gray-600">
                                Phone: {agency.phone}
                              </div>
                            )}
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              agency.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : agency.status === "Responding"
                                  ? "bg-blue-100 text-blue-800"
                                  : agency.status === "Assigned"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {agency.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            {/* Reports */}
            {caseData.reports && caseData.reports.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Reports</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {caseData.reports.map((report, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {report.reportType}
                          </span>
                          <span
                            className={`text-sm font-medium ${getReportStatusColor(report.status)}`}
                          >
                            {report.status}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{report.content}</p>
                        <div className="text-xs text-gray-500">
                          Submitted:{" "}
                          {new Date(report.submittedAt).toLocaleString()}
                        </div>
                        {report.adminResponse && (
                          <div className="mt-2 p-3 bg-gray-50 rounded">
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              Admin Response:
                            </div>
                            <div className="text-sm text-gray-700">
                              {report.adminResponse}
                            </div>
                            {report.respondedAt && (
                              <div className="text-xs text-gray-500 mt-1">
                                Responded:{" "}
                                {new Date(report.respondedAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submit Report */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Submit Report
                </h2>
              </div>
              <div className="px-6 py-4">
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Type
                    </label>
                    <select
                      value={reportForm.reportType}
                      onChange={(e) =>
                        setReportForm((prev) => ({
                          ...prev,
                          reportType: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Support Request">Support Request</option>
                      <option value="Data Flag">Data Flag</option>
                      <option value="Update Request">Update Request</option>
                      <option value="Follow-up">Follow-up</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={reportForm.content}
                      onChange={(e) =>
                        setReportForm((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      rows={4}
                      placeholder="Enter your report details..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {submittingReport ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Report
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Case Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Case Information
                </h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Case ID:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {caseData.caseId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(caseData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Updated:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(caseData.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {caseData.verificationStatus?.verifiedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Verified:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(
                        caseData.verificationStatus.verifiedAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {caseData.tags && caseData.tags.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-2">
                      Tags:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {caseData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailPage;
