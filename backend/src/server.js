// src/server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/route.js";

import ResponderModel from "./model/responderModel.js";
import SOSModel from "./model/alertModel.js";
import AcceptedAlertModel from "./model/acceptedAlertModel.js";
import CompletedAlertModel from "./model/completedAlertModel.js";
import CanceledAlertModel from "./model/canceledAlerts.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------- MULTI-DB CONNECTION ----------------
const connectDBs = async () => {
  try {
    const respondersDB = await mongoose.createConnection(process.env.MONGO_URI_RESPONDERS, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).asPromise();

    const allAlertsDB = await mongoose.createConnection(process.env.MONGO_URI_ALL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).asPromise();

    const acceptedAlertsDB = await mongoose.createConnection(process.env.MONGO_URI_ACCEPTED, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).asPromise();

    const completedAlertsDB = await mongoose.createConnection(process.env.MONGO_URI_COMPLETED, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).asPromise();

    const canceledAlertsDB = await mongoose.createConnection(process.env.MONGO_URI_CANCELLED, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).asPromise();

    app.locals.db = {
      respondersDB,
      allAlertsDB,
      acceptedAlertsDB,
      completedAlertsDB,
      canceledAlertsDB,
      ResponderModel: respondersDB.model("Responder", ResponderModel.schema),
      AlertModel: allAlertsDB.model("Alert", SOSModel.schema),
      AcceptedAlertModel: acceptedAlertsDB.model("AcceptedAlert", AcceptedAlertModel.schema),
      CompletedAlertModel: completedAlertsDB.model("CompletedAlert", CompletedAlertModel.schema),
      CanceledAlertModel: canceledAlertsDB.model("CanceledAlert", CanceledAlertModel.schema),
    };

    console.log("✅ All databases connected and models registered");

    // Only start server after DB connections are ready
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

// Connect DBs
connectDBs();

// ---------------- ROUTES ----------------
// Mount routes **after** DB connection is established
app.use("/api", router);

app.get("/", (req, res) => res.send("🚀 Backend running"));
