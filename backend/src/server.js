// src/server.js

// 1. Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

// 2. Imports
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import Stripe from "stripe";
import connectDB from "./config/db.js";

// Routes
import sosRoute from "./routes/sosRoute.js";
import userRoute from "./routes/userRoute.js";
import responderRoutes from "./routes/responderRoutes.js";
import settings from "./routes/setttings.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";

// Controllers
import { sendThankYouEmail } from "./controllers/donationController.js";

// Environment Debug
console.log("\n=== ENV CHECK ===");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "***LOADED***" : "MISSING");
console.log("STRIPE_KEY:", process.env.STRIPE_SECRET_KEY ? "***LOADED***" : "MISSING");
console.log("=================\n");

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Missing STRIPE_SECRET_KEY in .env");
  process.exit(1);
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Express + Socket Server
const app = express();
const httpServer = createServer(app);

// CORS
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "my-custom-header", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Connect Database
connectDB();

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: corsOptions,
  path: "/socket.io/",
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// Middleware
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/donations/webhook")) {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

// Test Email Route
app.get("/api/test-email", async (req, res) => {
  try {
    const to = req.query.to || process.env.EMAIL_USER;
    console.log("Triggering test email to:", to);
    const result = await sendThankYouEmail(to, "Test User", "SwiftAid");
    res.json({
      success: true,
      message: `Test email attempted to ${to}`,
      result,
    });
  } catch (err) {
    console.error("Test email failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Routes
app.use("/api/sos", sosRoute);
app.use("/api/user", userRoute);
app.use("/api/responders", responderRoutes);
app.use("/api/settings", settings);
app.use("/api/resources", resourceRoutes);
app.use("/api/donations", donationRoutes);

// Stripe Webhook
app.post(
  "/api/donations/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === "checkout.session.completed") {
      console.log("✅ Payment successful:", event.data.object.id);
    }
    res.json({ received: true });
  }
);

// Root Endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🚀 SwiftAid Emergency Resource Management API",
    status: "Running",
    version: "2.0.0",
    endpoints: {
      health: "/api/health",
      donations: "/api/donations",
      resources: "/api/resources",
      sos: "/api/sos",
      users: "/api/user",
      responders: "/api/responders",
      settings: "/api/settings",
      testEmail: "/api/test-email?to=email@example.com",
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    requestedUrl: req.originalUrl,
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error("Global error:", error);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/`);
  console.log(`📬 Test Email: http://localhost:${PORT}/api/test-email?to=you@example.com`);
  console.log(`🧩 WebSocket: ws://localhost:${PORT}/socket.io/`);
});

export { app, io };
