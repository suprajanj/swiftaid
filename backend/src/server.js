import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const host = process.env.HOST || "127.0.0.1";

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
console.log("MongoDB URI:", uri);

const connectDB = async () => {
  try {
    if (!uri) {
      throw new Error("MONGO_URI is undefined. Check your .env file.");
    }
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

await connectDB();

app.get("/", (req, res) => {
  res.json({ message: "Hello from SwiftAid Backend" });
});

// Use routes
import apiRoutes from "./route/index.js";
app.use("/api", apiRoutes);

app.listen(port, host, (err) => {
  if (err) {
    console.error("Server failed to start:", err.message);
    process.exit(1);
  }
  console.log(`🚀 Node server is listening at http://${host}:${port}`);
});

export default app;
