import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import sosRoute from "./routes/sosRoute.js";
import userRoute from "./routes/userRoute.js";
import responderRoutes from "./routes/responderRoutes.js";
import settings from "./routes/setttings.js";


dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure CORS for both Express and Socket.IO
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: corsOptions,
  path: "/socket.io/",
});

// Make io accessible to routes
app.set("io", io);

// Validate important environment variables
if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️  Warning: JWT_SECRET is not set. Set it in your .env before using JWT for authentication."
  );
}

const PORT = process.env.PORT || 3000;

connectDB();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/sos", sosRoute);
app.use("/api/user", userRoute);
app.use("/api/responders", responderRoutes);
app.use("/api/settings", settings);

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(
    `WebSocket server is running on ws://localhost:${PORT}/socket.io/`
  );
});

export { app, io };
