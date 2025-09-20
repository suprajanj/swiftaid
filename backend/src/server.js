// src/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import Stripe from "stripe";

// 1. Load environment variables early
dotenv.config();

// 2. Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Missing STRIPE_SECRET_KEY in .env");
  process.exit(1);
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 3. Initialize Express app
const app = express();

// 4. Database connection
connectDB();

// Debug Stripe Key Load
console.log("Stripe key loaded:", process.env.STRIPE_SECRET_KEY ? "✅" : "❌");

// 5. Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "http://localhost:5175",
      "http://127.0.0.1:5175",
      "http://localhost:5176",
      "http://127.0.0.1:5176",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// Stripe webhook needs raw body parsing
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/donations/webhook")) {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

// 6. Routes
app.use("/api", routes);

// Stripe Webhook Endpoint
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
      console.error("⚠️ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle Stripe events
    if (event.type === "checkout.session.completed") {
      console.log("💰 Payment successful:", event.data.object.id);
      // TODO: call donationController.handleStripeWebhook()
    }

    res.json({ received: true });
  }
);

// 7. Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "SwiftAid Emergency Resource Management API",
    status: "Running",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      resourceRequests: "/api/resources/requests",
      donations: "/api/donations",
    },
  });
});

// 8. 404 handler
// 404 handler (must be last before error handler)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'GET /api/resources/requests',
      'POST /api/resources/requests',
      'GET /api/donations',
      'POST /api/donations',
    ],
  });
});


// 9. Global error handler
app.use((error, req, res, next) => {
  console.error("🔥 Global error:", error);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// 10. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 API: http://localhost:${PORT}/`);
});
