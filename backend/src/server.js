import express from "express";
import organizationRoute from "./routes/organizationRoute.js";
import emergencyCaseRoute from "./routes/emergencyCaseRoute.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173" })); // allow frontend
app.use(express.json()); // parse JSON body

// Routes
app.use("/api/organizations", organizationRoute);
app.use("/api/emergency-cases", emergencyCaseRoute);

// Connect DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
  });
});
