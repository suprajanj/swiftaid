import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div style={container}>
      <div style={overlay}>
        <h1 style={{ fontSize: "3rem", marginBottom: "10px" }}>
          🌍 SwiftAid Resource Management
        </h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "50px" }}>
          Manage donations and emergency resource requests in one place
        </p>

        <div style={cardContainer}>
          <Link 
            to="/donations" 
            style={card("green")}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-8px) scale(1.02)";
              e.target.style.boxShadow = "0 15px 40px rgba(0,0,0,0.5)";
              e.target.style.background = "#34ce57";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";
              e.target.style.background = "#28a745";
            }}
          >
            ❤️ Donations
          </Link>
          <Link 
            to="/resources" 
            style={card("blue")}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-8px) scale(1.02)";
              e.target.style.boxShadow = "0 15px 40px rgba(0,0,0,0.5)";
              e.target.style.background = "#0d8bff";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";
              e.target.style.background = "#007bff";
            }}
          >
            📋 Resource Requests
          </Link>
        </div>
      </div>
    </div>
  );
}

const container = {
  height: "100vh",             // 🔹 fills entire viewport
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
  color: "#fff",
  textAlign: "center",
  overflow: "hidden",
};

const overlay = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100%",
  padding: "20px",
};

const cardContainer = {
  display: "flex",
  gap: "60px",
  flexWrap: "wrap",
  justifyContent: "center",
  width: "100%",
};

const card = (color) => ({
  flex: "1 1 250px",          // 🔹 cards expand but shrink on small screens
  maxWidth: "320px",
  background: color === "green" ? "#28a745" : "#007bff",
  padding: "50px 40px",
  borderRadius: "20px",
  color: "white",
  fontSize: "1.8rem",
  fontWeight: "bold",
  textDecoration: "none",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  transition: "transform 0.25s, box-shadow 0.25s, background 0.25s",
  cursor: "pointer",
  textAlign: "center",
});