// server.js
import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { Server } from "socket.io";
import sosRoutes from "./routes/sosRoutes.js";
import responderRoutes from "./routes/responderRoutes.js";
import settingsRoutes from "./routes/settings.js";



dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173" })); // allow your frontend only
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/sos", sosRoutes);
app.use("/api/responders", responderRoutes);
app.use("/api/settings", settingsRoutes);


// Create HTTP server and Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

// Make io accessible in routes
app.set("io", io);

// MongoDB connection + server start
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

// Optional: handle uncaught exceptions
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});
