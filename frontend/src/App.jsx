import React from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Emergencyform from "./pages/Emergencyform";
import Userprofile from "./pages/Userprofile";
import UserEmergencyRequest from "./pages/UserEmergencyRequest";
import LoginandSignup from "./pages/LoginandSignup";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/form/:type" element={<Emergencyform />} />
        <Route path="/profile" element={<Userprofile />} />
        <Route path="/userRequests" element={<UserEmergencyRequest />} />
        <Route path="/login" element={<LoginandSignup />} />
      </Routes>
    </div>
  );
}

export default App;
