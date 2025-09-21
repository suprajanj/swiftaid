import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import router from "./routes/route.js";

dotenv.config();

const app = express();

// 🌍 Environment variables
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const { MONGO_URI_ALL, MONGO_URI_ACCEPTED, MONGO_URI_COMPLETED } = process.env;

// 🛡 Middleware
app.use(cors({ origin: "http://localhost:5001" })); // Adjust if needed
app.use(express.json());

// 🛠 Debugging logs
console.log("Loaded ENV:", {
  PORT,
  HOST,
  MONGO_URI_ALL: MONGO_URI_ALL ? "[HIDDEN]" : "❌ NOT FOUND",
  MONGO_URI_ACCEPTED: MONGO_URI_ACCEPTED ? "[HIDDEN]" : "❌ NOT FOUND",
  MONGO_URI_COMPLETED: MONGO_URI_COMPLETED ? "[HIDDEN]" : "❌ NOT FOUND",
});

// ❌ Exit if environment variables are missing
if (!MONGO_URI_ALL || !MONGO_URI_ACCEPTED || !MONGO_URI_COMPLETED) {
  console.error("❌ Missing Mongo URIs. Check your .env file.");
  process.exit(1);
}

// ✅ MongoDB Connections
const connectDatabases = async () => {
  try {
    // Main DB (all alerts)
    await mongoose.connect(MONGO_URI_ALL, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Connected to allAlerts database");

    // Accepted Alerts DB
    const acceptedAlertsDB = mongoose.createConnection(MONGO_URI_ACCEPTED, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    acceptedAlertsDB.on("connected", () => {
      console.log("✅ Connected to acceptedAlerts database");
    });

    // Completed Alerts DB
    const completedAlertsDB = mongoose.createConnection(MONGO_URI_COMPLETED, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    completedAlertsDB.on("connected", () => {
      console.log("✅ Connected to completedAlerts database");
    });

    // Export connections globally (or via modules)
    global.acceptedAlertsDB = acceptedAlertsDB;
    global.completedAlertsDB = completedAlertsDB;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Connect to all DBs first, then start server
await connectDatabases();

// ✅ Root route
app.get("/", (req, res) => {
  res.json({ message: "Hello from SwiftAid Backend 👋" });
});

// ✅ API routes
app.use("/api", router);

// 🚀 Start server
app.listen(PORT, HOST, (err) => {
  if (err) {
    console.error("❌ Server failed to start:", err.message);
    process.exit(1);
  }
  console.log(`🚀 Node server running at http://${HOST}:${PORT}`);
});

export default app;
