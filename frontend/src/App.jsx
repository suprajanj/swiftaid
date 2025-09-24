import React from 'react';
import './index.css';
import AdminDashboard from './pages/AdminDashboard';
import { Routes, Route } from "react-router-dom";


function App() {
  return(
    <Routes>
        <Route path="/" element={<AdminDashboard />} />
    </Routes>
  );
}


export default App;
