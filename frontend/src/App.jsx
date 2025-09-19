import React from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Emergencyform from "./pages/Emergencyform";
import Userprofile from "./pages/Userprofile";
import UserEmergencyRequest from "./pages/UserEmergencyRequest";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/form/:type" element={<Emergencyform />} />
        <Route path="/profile" element={<Userprofile />} />
        <Route path="/userRequests" element={<UserEmergencyRequest />} />
      </Routes>
    </div>
  );
}

export default App;
