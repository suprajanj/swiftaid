import React from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Emergencyform from "./pages/Emergencyform";
import Userprofile from "./pages/Userprofile";
import LoginandSignup from "./pages/LoginandSignup";
import LandingPage from "./pages/LandingPage";
import { RoleManagement } from "./pages/RoleManagement";
import Emergency from "./pages/Emergency";
import { AdminDashboard } from "./pages/AdminDashboard";
import ResAdminDashboard from "./pages/ResAdminDashboard";
import ResourceRequests from "./pages/ResourceRequests.jsx";
import Donations from "./pages/Donations.jsx";
import ResourceDashboard from "./pages/ResourceDashboard.jsx";

import HomePage from "./pages/orgpages/HomePage";
import OrganizationDashboard from "./pages/orgpages/OrganizationDashboard";
import EmergencyCasesPage from "./pages/orgpages/EmergencyCasesPage";
import CaseDetailPage from "./pages/orgpages/CaseDetailPage";
import AdminPanel from "./pages/orgpages/AdminPanel";
import ResourceManagementPage from "./pages/orgpages/ResourceManagementPage";
import OrgAdminDashboard from "./pages/orgpages/OrgAdminDashboard.jsx";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginandSignup />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/form/:type" element={<Emergencyform />} />
        <Route path="/profile" element={<Userprofile />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/roles" element={<RoleManagement />} />
        <Route path="/requests" element={<Emergency />} />
        <Route path="/dispatcher" element={<ResAdminDashboard />} />
        <Route path="/funds" element={<ResourceDashboard />} />
        <Route path="/resources" element={<ResourceRequests />} />
        <Route path="/donations" element={<Donations />} />

        <Route path="/org" element={<HomePage />} />
        <Route
          path="/organization/dashboard"
          element={<OrganizationDashboard />}
        />
        <Route path="/admin/dashboard" element={<OrgAdminDashboard />} />
        <Route path="/emergency-cases" element={<EmergencyCasesPage />} />
        <Route path="/emergency-cases/:id" element={<CaseDetailPage />} />
        <Route path="/admin/panel" element={<AdminPanel />} />
        <Route path="/resource" element={<ResourceManagementPage />} />
      </Routes>
    </div>
  );
}

export default App;
