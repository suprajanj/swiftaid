// backend/server.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import router from "./routes/routes.js";

const app = express();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const { MONGO_URI_ALL, MONGO_URI_ACCEPTED, MONGO_URI_COMPLETED } = process.env;

app.use(cors({ origin: "http://localhost:5001" }));
app.use(express.json({ strict: true })); // Enforce strict JSON parsing

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`, req.body);
  next();
});

const connectDatabases = async () => {
  try {
    // Connect to All Alerts
    global.allAlertsDB = mongoose.createConnection(MONGO_URI_ALL, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    global.allAlertsDB.once("open", () => {
      console.log("✅ Connected to allAlerts database");
    });

    // Connect to Accepted Alerts
    global.acceptedAlertsDB = mongoose.createConnection(MONGO_URI_ACCEPTED, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    global.acceptedAlertsDB.once("open", () => {
      console.log("✅ Connected to acceptedAlerts database");
    });

    // Connect to Completed Tasks
    global.completedTasksDB = mongoose.createConnection(MONGO_URI_COMPLETED, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    global.completedTasksDB.once("open", () => {
      console.log("✅ Connected to completedTasks database");
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    setTimeout(connectDatabases, 5000); // Retry after 5 seconds
  }
};

connectDatabases();

app.get("/", (req, res) => {
  res.json({ message: "Hello from SwiftAid Backend 👋" });
});

app.use("/api", router);

app.listen(PORT, HOST, (err) => {
  if (err) {
    console.error("❌ Server failed to start:", err.message);
    process.exit(1);
  }
  console.log(`🚀 Node server running at http://${HOST}:${PORT}`);
});

export default app;