import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import router from "./routes/route.js";

// Import schemas only
import ResponderSchema from "./model/responderModel.js";
import EmergencyReportSchema from "./model/alertModel.js";
import CanceledAlertSchema from "./model/canceledAlerts.js";
import CompletedAlertSchema from "./model/completedAlertModel.js";
import AcceptedAlertSchema from "./model/acceptedAlertModel.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";

const { 
  MONGO_URI_ALL, 
  MONGO_URI_ACCEPTED, 
  MONGO_URI_COMPLETED, 
  MONGO_URI_RESPONDERS, 
  MONGO_URI_CANCELLED 
} = process.env;

if (!MONGO_URI_ALL || !MONGO_URI_ACCEPTED || !MONGO_URI_COMPLETED || !MONGO_URI_RESPONDERS || !MONGO_URI_CANCELLED) {
  console.error("❌ Missing Mongo URIs in .env");
  process.exit(1);
}

app.use(cors({ origin: "http://localhost:5001" }));
app.use(express.json());

const connectDatabases = async () => {
  try {
    // Main Alerts DB
    const allAlertsDB = await mongoose.createConnection(MONGO_URI_ALL, { family: 4 });
    allAlertsDB.model("AlertModel", EmergencyReportSchema);

    // Accepted Alerts DB
    const acceptedAlertsDB = await mongoose.createConnection(MONGO_URI_ACCEPTED, { family: 4 });
    acceptedAlertsDB.model("AcceptedAlertModel", AcceptedAlertSchema);

    // Completed Alerts DB
    const completedAlertsDB = await mongoose.createConnection(MONGO_URI_COMPLETED, { family: 4 });
    completedAlertsDB.model("CompletedAlertModel", CompletedAlertSchema);

    // Canceled Alerts DB
    const canceledAlertsDB = await mongoose.createConnection(MONGO_URI_CANCELLED, { family: 4 });
    canceledAlertsDB.model("CanceledAlertModel", CanceledAlertSchema);

    // Responders DB
    const respondersDB = await mongoose.createConnection(MONGO_URI_RESPONDERS, { family: 4 });
    respondersDB.model("ResponderModel", ResponderSchema);

    // Save connections globally
    global.allAlertsDB = allAlertsDB;
    global.acceptedAlertsDB = acceptedAlertsDB;
    global.completedAlertsDB = completedAlertsDB;
    global.canceledAlertsDB = canceledAlertsDB;
    global.respondersDB = respondersDB;

    console.log("✅ All models registered on respective DBs");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

await connectDatabases();

app.get("/", (req, res) => res.json({ message: "Hello from SwiftAid Backend 👋" }));
app.use("/api", router);

app.listen(PORT, HOST, () => console.log(`🚀 Node server running at http://${HOST}:${PORT}`));

export default app;
