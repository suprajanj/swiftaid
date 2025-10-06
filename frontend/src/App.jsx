import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import NoteDetailPage from "./pages/NoteDetailPage";
import OrganizationDashboard from "./pages/OrganizationDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EmergencyCasesPage from "./pages/EmergencyCasesPage";
import CaseDetailPage from "./pages/CaseDetailPage";
import AdminPanel from "./pages/AdminPanel";
import ResourceManagementPage from "./pages/ResourceManagementPage";

const App = () => {
  return (
    <div className="relative h-full w-full min-h-screen">
      {/* Light radial gradient background */}
      <div
        className="absolute inset-0 -z-10 h-full w-full"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 10%, #ffffff 0%, #00FF9D40 100%)",
        }}
      />

      {/* Toaster for notifications */}
      <Toaster position="top-right" />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/create" element={<CreatePage />} /> */}
        {/* <Route path="/note/:id" element={<NoteDetailPage />} /> */}
        <Route
          path="/organization/dashboard"
          element={<OrganizationDashboard />}
        />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/emergency-cases" element={<EmergencyCasesPage />} />
        <Route path="/emergency-cases/:id" element={<CaseDetailPage />} />
        <Route path="/admin/panel" element={<AdminPanel />} />
        <Route path="/resources" element={<ResourceManagementPage />} />
      </Routes>
    </div>
  );
};

export default App;
