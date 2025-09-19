import React from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "../pages/Homepage";
import Emergencyform from "../pages/Emergencyform";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/form/:type" element={<Emergencyform />} />
      </Routes>
    </div>
  );
}

export default App;
