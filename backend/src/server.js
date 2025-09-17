import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import router from "./routes/route.js";

const app = express();

// Environment variables
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "127.0.0.1";
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors({ origin: "http://localhost:5001" })); // Allow frontend port
app.use(express.json());

// Debug: Show loaded environment variables
console.log("Loaded ENV:", {
  PORT,
  HOST,
  MONGO_URI: MONGO_URI ? "[HIDDEN]" : "❌ NOT FOUND",
});

// Exit if Mongo URI is missing
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is undefined. Check your .env file.");
  process.exit(1);
}

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Connect to DB
await connectDB();

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Hello from SwiftAid Backend" });
});

// API routes
app.use("/api", router);

// Start server
app.listen(PORT, HOST, (err) => {
  if (err) {
    console.error("❌ Server failed to start:", err.message);
    process.exit(1);
  }
  console.log(`🚀 Node server running at http://${HOST}:${PORT}`);
});

export default app;
