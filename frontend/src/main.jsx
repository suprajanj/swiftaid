import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import NotificationDashboard from "./NotificationDashboard.jsx";
import AcceptedTasks from "./AcceptedTasks.jsx";
import PrimaryLoginPage from "./primaryLoginPage.jsx";
import CreatePoliceResponder from "./createPoliceResponder.jsx";
import CreateHospitalResponder from "./createHospitalResponder.jsx";
import CreateFirefighterResponder from "./CreateFirefighterResponder.jsx";
import LoginPage from "./LoginPage.jsx";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<PrimaryLoginPage />} />
      <Route path="/create-police-responder" element={<CreatePoliceResponder />} />
      <Route path="/create-hospital-responder" element={<CreateHospitalResponder />} />
      <Route path="/create-firefighter-responder" element={<CreateFirefighterResponder />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/notifications" element={<NotificationDashboard />} />
      <Route path="/accepted-tasks" element={<AcceptedTasks />} />
    </Routes>
  </BrowserRouter>
);
