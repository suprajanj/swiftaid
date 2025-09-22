import React from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Emergencyform from "./pages/Emergencyform";
import Userprofile from "./pages/Userprofile";
import UserEmergencyRequest from "./pages/UserEmergencyRequest";
import LoginandSignup from "./pages/LoginandSignup";
import LandingPage from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { RoleManagement } from "./pages/RoleManagement";
import { Analytics } from "./pages/Analytics";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginandSignup />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/form/:type" element={<Emergencyform />} />
        <Route path="/profile" element={<Userprofile />} />
        <Route path="/userRequests" element={<UserEmergencyRequest />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/roles" element={<RoleManagement />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </div>
  );
}

export default App;
