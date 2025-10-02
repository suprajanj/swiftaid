// src/server.js

// 1. Load environment variables FIRST - before ANY imports
import dotenv from "dotenv";
dotenv.config();

// 2. NOW import everything else
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import Stripe from "stripe";
import { sendThankYouEmail } from "./controllers/donationController.js";

// === DEBUG ===
console.log('\n=== ENV CHECK ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***LOADED***' : 'MISSING');
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length);
console.log('=================\n');

// 3. Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("Missing STRIPE_SECRET_KEY in .env");
  process.exit(1);
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 4. Initialize Express app
const app = express();

// 5. Database connection
connectDB();

// Debug Stripe Key Load
console.log("Stripe key loaded:", process.env.STRIPE_SECRET_KEY ? "Done" : "Wrong");

// 6. Middleware
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

// 7. Test email route FIRST (before other routes)
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

// Routes (after test email)
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
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      console.log("Payment successful:", event.data.object.id);
    }

    res.json({ received: true });
  }
);

// 8. Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "SwiftAid Emergency Resource Management API",
    status: "Running",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      resourceRequests: "/api/resources/requests",
      donations: "/api/donations",
      testEmail: "/api/test-email?to=your@email.com",
    },
  });
});

// 9. 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    requestedUrl: req.originalUrl,
    availableRoutes: [
      "GET /",
      "GET /api/health",
      "GET /api/resources/requests",
      "POST /api/resources/requests",
      "GET /api/donations",
      "POST /api/donations",
      "GET /api/test-email?to=email",
    ],
  });
});

// 10. Global error handler
app.use((error, req, res, next) => {
  console.error("Global error:", error);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// 11. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/`);
  console.log(`Test Email: http://localhost:${PORT}/api/test-email?to=your@email.com`);
});