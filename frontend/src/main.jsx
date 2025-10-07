import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

// Pages / Components
import NotificationDashboard from "./NotificationDashboard.jsx";
import AcceptedTasks from "./AcceptedTasks.jsx";
import CreatePoliceResponder from "./CreatePoliceResponder.jsx";
import CreateHospitalResponder from "./CreateHospitalResponder.jsx";
import CreateFirefighterResponder from "./CreateFirefighterResponder.jsx";
import LoginPage from "./LoginPage.jsx";

// Fonts
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

// Leaflet CSS for maps
import "leaflet/dist/leaflet.css";

// Toast notifications
import "react-toastify/dist/ReactToastify.css";

const root = createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/notifications" element={<NotificationDashboard />} />
      <Route path="/accepted-tasks" element={<AcceptedTasks />} />
      <Route path="/create-police-responder" element={<CreatePoliceResponder />} />
      <Route path="/create-hospital-responder" element={<CreateHospitalResponder />} />
      <Route path="/create-firefighter-responder" element={<CreateFirefighterResponder />} />
    </Routes>
  </BrowserRouter>
);
