import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-left"
        toastOptions={{
          duration: 3000,
          success: {
            style: {
              background: "#4ade80",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#16a34a",
            },
          },
          error: {
            style: {
              background: "#f87171",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#b91c1c",
            },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
