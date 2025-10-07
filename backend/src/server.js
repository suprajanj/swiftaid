import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/route.js"; // Make sure this exists

// Import schemas
import AlertSchema from "./model/alertModel.js";
import AcceptedAlertSchema from "./model/acceptedAlertModel.js";
import CompletedAlertSchema from "./model/completedAlertModel.js";
import CanceledAlertSchema from "./model/canceledAlerts.js";
import ResponderSchema from "./model/responderModel.js";

dotenv.config();
const app = express();

// ---------------- MIDDLEWARE ----------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------- MONGO CONNECTION ----------------
const connectDBs = async () => {
  try {
    // Connect to multiple MongoDB databases
    app.locals.respondersDB = await mongoose.createConnection(process.env.MONGO_URI_RESPONDERS, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ respondersDB connected");

    app.locals.allAlertsDB = await mongoose.createConnection(process.env.MONGO_URI_ALL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ allAlertsDB connected");

    app.locals.acceptedAlertsDB = await mongoose.createConnection(process.env.MONGO_URI_ACCEPTED, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ acceptedAlertsDB connected");

    app.locals.completedAlertsDB = await mongoose.createConnection(process.env.MONGO_URI_COMPLETED, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ completedAlertsDB connected");

    app.locals.canceledAlertsDB = await mongoose.createConnection(process.env.MONGO_URI_CANCELLED, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ canceledAlertsDB connected");

    // Register models in app.locals.db for controllers
    app.locals.db = {
      ResponderModel: app.locals.respondersDB.model("Responder", ResponderSchema),
      AlertModel: app.locals.allAlertsDB.model("Alert", AlertSchema),
      AcceptedAlertModel: app.locals.acceptedAlertsDB.model("AcceptedAlert", AcceptedAlertSchema),
      CompletedAlertModel: app.locals.completedAlertsDB.model("CompletedAlert", CompletedAlertSchema),
      CanceledAlertModel: app.locals.canceledAlertsDB.model("CanceledAlert", CanceledAlertSchema),
    };

  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

// Connect databases
connectDBs();

// ---------------- ROUTES ----------------
app.use("/api", router);

// Health check
app.get("/", (req, res) => res.send("🚀 Backend is running"));

// ---------------- GLOBAL ERROR HANDLER ----------------
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
