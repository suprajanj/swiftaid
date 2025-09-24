// server.js
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
const MONGO_URI_ALL = process.env.MONGO_URI_ALL;
const MONGO_URI_ACCEPTED = process.env.MONGO_URI_ACCEPTED;
const MONGO_URI_COMPLETED = process.env.MONGO_URI_COMPLETED;

// Middleware
app.use(cors({ origin: "http://localhost:5001" })); // frontend dev server
app.use(express.json());

// Debug env check
console.log("Loaded ENV:", {
  PORT,
  HOST,
  MONGO_URI_ALL: MONGO_URI_ALL ? "[HIDDEN]" : "❌ NOT FOUND",
  MONGO_URI_ACCEPTED: MONGO_URI_ACCEPTED ? "[HIDDEN]" : "❌ NOT FOUND",
  MONGO_URI_COMPLETED: MONGO_URI_COMPLETED ? "[HIDDEN]" : "❌ NOT FOUND",
});

// 🚨 Fail fast if no DB URIs
if (!MONGO_URI_ALL || !MONGO_URI_ACCEPTED || !MONGO_URI_COMPLETED) {
  console.error("❌ Missing Mongo URIs. Check your .env file.");
  process.exit(1);
}

// 🔗 Connect to MongoDBs
const connectDatabases = async () => {
  try {
    // Primary connection (allAlerts)
    await mongoose.connect(MONGO_URI_ALL, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Connected to allAlerts database");

    // Secondary connection (acceptedAlerts)
    const acceptedAlertsDB = mongoose.createConnection(MONGO_URI_ACCEPTED, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    acceptedAlertsDB.once("open", () => {
      console.log("✅ Connected to acceptedAlerts database");
    });
    acceptedAlertsDB.on("error", (err) => {
      console.error("❌ acceptedAlerts DB error:", err);
    });

    // Tertiary connection (completedAlerts)
    const completedAlertsDB = mongoose.createConnection(MONGO_URI_COMPLETED, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    completedAlertsDB.once("open", () => {
      console.log("✅ Connected to completedAlerts database");
    });
    completedAlertsDB.on("error", (err) => {
      console.error("❌ completedAlerts DB error:", err);
    });

    // Store in global for controllers
    global.allAlertsDB = mongoose.connection;
    global.acceptedAlertsDB = acceptedAlertsDB;
    global.completedAlertsDB = completedAlertsDB;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

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
