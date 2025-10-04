import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import router from "./routes/route.js";

// Import schema only
import ResponderSchema from "./model/responderModel.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";

const {
  MONGO_URI_ALL,
  MONGO_URI_ACCEPTED,
  MONGO_URI_COMPLETED,
  MONGO_URI_RESPONDERS,
} = process.env;

app.use(cors({ origin: "http://localhost:5001" }));
app.use(express.json());

if (!MONGO_URI_ALL || !MONGO_URI_ACCEPTED || !MONGO_URI_COMPLETED || !MONGO_URI_RESPONDERS) {
  console.error("❌ Missing Mongo URIs in .env");
  process.exit(1);
}

const connectDatabases = async () => {
  try {
    const allAlertsDB = await mongoose.connect(MONGO_URI_ALL, { family: 4 });
    console.log("✅ Connected to allAlerts");

    const acceptedAlertsDB = mongoose.createConnection(MONGO_URI_ACCEPTED, { family: 4 });
    acceptedAlertsDB.once("open", () => console.log("✅ Connected to acceptedAlerts"));

    const completedAlertsDB = mongoose.createConnection(MONGO_URI_COMPLETED, { family: 4 });
    completedAlertsDB.once("open", () => console.log("✅ Connected to completedAlerts"));

    const respondersDB = mongoose.createConnection(MONGO_URI_RESPONDERS, { family: 4 });
    respondersDB.once("open", () => console.log("✅ Connected to responders"));

    // Register Responder model on respondersDB
    respondersDB.model("Responder", ResponderSchema);

    // Save connections globally
    global.allAlertsDB = allAlertsDB.connection;
    global.acceptedAlertsDB = acceptedAlertsDB;
    global.completedAlertsDB = completedAlertsDB;
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
