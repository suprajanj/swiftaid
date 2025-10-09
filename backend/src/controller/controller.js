import mongoose from "mongoose";
import ResponderModel from "../model/responderModel.js";
import SOSModel from "../model/alertModel.js";
import AcceptedAlertModel from "../model/acceptedAlertModel.js";
import CompletedAlertModel from "../model/completedAlertModel.js";
import CanceledAlertModel from "../model/canceledAlerts.js";

// =================== HELPERS ===================

// Validate ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Safe model getter for responders
const getResponderModel = (respondersDB) => {
  try {
    return respondersDB.model("Responder");
  } catch {
    return respondersDB.model("Responder", responderSchema);
  }
};

// Get all models safely
const getModels = (req) => {
  const db = req.app.locals.db;
  if (!db) throw new Error("❌ DB not initialized");

  return {
    ResponderModel: db.ResponderModel,
    AlertModel: db.AlertModel,
    AcceptedAlertModel: db.AcceptedAlertModel,
    CompletedAlertModel: db.CompletedAlertModel,
    CanceledAlertModel: db.CanceledAlertModel,
  };
};

// Calculate distance between two coordinates (Haversine formula)
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const deg2rad = (deg) => deg * (Math.PI / 180);
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// =================== ALERT RETRIEVAL ===================
const getAllAlerts = async (req, res) => {
  try {
    const { AlertModel } = getModels(req);
    const alerts = await AlertModel.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    console.error("getAllAlerts error:", err);
    res.status(500).json({ message: err.message });
  }
};

const getAlertsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { AlertModel } = getModels(req);
    const alerts = await AlertModel.find({ status }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    console.error("getAlertsByStatus error:", err);
    res.status(500).json({ message: err.message });
  }
};

const getAcceptedAlertsByResponder = async (req, res) => {
  try {
    const { responderId } = req.params;
    const db = req.app.locals.db; // get DB connections and models

    if (!mongoose.Types.ObjectId.isValid(responderId)) {
      return res.status(400).json({ message: "Invalid Responder ID" });
    }

    const tasks = await db.AcceptedAlertModel.find({
      acceptedBy: responderId
    }).populate({
      path: "acceptedBy",
      model: db.ResponderModel,  // <-- important: use the ResponderModel from respondersDB
      select: "name NIC contactNumber position",
    });

    res.status(200).json(tasks);
  } catch (err) {
    console.error("getAcceptedAlertsByResponder error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



const getAllCompletedAlerts = async (req, res) => {
  try {
    const { CompletedAlertModel } = getModels(req);
    const alerts = await CompletedAlertModel.find().sort({ completedAt: -1 });
    res.json(alerts);
  } catch (err) {
    console.error("getAllCompletedAlerts error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getCanceledAlerts = async (req, res) => {
  try {
    const { CanceledAlertModel } = getModels(req);
    const alerts = await CanceledAlertModel.find().sort({ cancelledAt: -1 });
    res.json(alerts);
  } catch (err) {
    console.error("getCanceledAlerts error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =================== ALERT CREATION ===================
const addAlert = async (req, res) => {
  try {
    const { AlertModel } = getModels(req);
    const { user, name, age, number, emergency, location, assignedResponder, comment } = req.body;

    if (!name || !age || !number || !emergency || !location?.latitude || !location?.longitude || !assignedResponder) {
      return res.status(400).json({ message: "All required fields are mandatory!" });
    }

    const newAlert = new AlertModel({
      user,
      name,
      age,
      number,
      emergency,
      location,
      assignedResponder,
      comment: comment || "",
      status: "Pending",
    });

    await newAlert.save();
    res.status(201).json({ message: "🚨 SOS alert added successfully", alert: newAlert });
  } catch (err) {
    console.error("addAlert error:", err);
    res.status(500).json({ message: err.message });
  }
};

// =================== ALERT DETAILS ===================
const displayAlertDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

    const { AlertModel, AcceptedAlertModel, CompletedAlertModel } = getModels(req);
    const alert =
      (await AlertModel.findById(id)) ||
      (await AcceptedAlertModel.findById(id)) ||
      (await CompletedAlertModel.findById(id));

    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  } catch (err) {
    console.error("displayAlertDetails error:", err);
    res.status(500).json({ error: err.message });
  }
};



// =================== CANCEL / REACH / COMPLETE ===================
const cancelAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { reasons = [] } = req.body;
    const { AcceptedAlertModel, CanceledAlertModel, AlertModel } = getModels(req);

    const alert = await AcceptedAlertModel.findById(id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    const canceled = new CanceledAlertModel({
      reportId: alert.reportId || alert._id,
      acceptedBy: Array.isArray(alert.acceptedBy) ? alert.acceptedBy : [alert.acceptedBy],
      userId: alert.user || "",
      NIC: alert.NIC || "",
      contactNumber: alert.number || "",
      emergencyType: alert.emergency || "",
      address: alert.location?.mapLink || "",
      status: "Cancelled",
      reasonToReject: Array.isArray(reasons) ? reasons.join(", ") : String(reasons),
      cancelledAt: new Date(),
    });

    await canceled.save();

    await AcceptedAlertModel.findByIdAndDelete(id);
    await AlertModel.findOneAndUpdate(
      { _id: alert.reportId || alert._id },
      { status: "Cancelled", reasonToReject: canceled.reasonToReject }
    );

    res.json({ message: "🚫 Alert cancelled successfully", canceled });
  } catch (err) {
    console.error("cancelAlert error:", err);
    res.status(500).json({ error: err.message });
  }
};


const markAsReached = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

    const { AlertModel, AcceptedAlertModel } = getModels(req);
    const update = { status: "Reached" };

    const alert =
      (await AcceptedAlertModel.findByIdAndUpdate(id, update, { new: true })) ||
      (await AlertModel.findByIdAndUpdate(id, update, { new: true }));

    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json({ message: "🚶 Responder reached", alert });
  } catch (err) {
    console.error("markAsReached error:", err);
    res.status(500).json({ error: err.message });
  }
};

const completeAlertWithDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

    const { CompletedAlertModel, AcceptedAlertModel, AlertModel } = getModels(req);
    const alert = (await AcceptedAlertModel.findById(id)) || (await AlertModel.findById(id));
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    const data = { ...req.body };
    const files = req.files ? req.files.map((f) => f.path) : [];

    const completed = new CompletedAlertModel({
      ...alert.toObject(),
      ...data,
      files,
      status: "Completed",
      completedAt: new Date(),
    });

    delete completed._id;
    await completed.save();

    await AcceptedAlertModel.findByIdAndDelete(id);
    await AlertModel.findByIdAndDelete(id);

    res.json({ message: "✅ Task completed!", completed });
  } catch (err) {
    console.error("completeAlertWithDetails error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =================== LOCATION UPDATES ===================
const updateResponderLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

    const { AlertModel, AcceptedAlertModel } = getModels(req);
    const update = { responderLocation: { latitude: lat, longitude: lng } };

    const alert =
      (await AcceptedAlertModel.findByIdAndUpdate(id, update, { new: true })) ||
      (await AlertModel.findByIdAndUpdate(id, update, { new: true }));

    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json({ message: "📍 Responder location updated", alert });
  } catch (err) {
    console.error("updateResponderLocation error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =================== RESPONDER MANAGEMENT ===================
const getAssignedAlerts = async (req, res) => {
  try {
    const { responderId } = req.params;
    if (!responderId || !isValidId(responderId))
      return res.status(400).json({ message: "Valid responderId required" });

    const { AlertModel, AcceptedAlertModel } = getModels(req);

    const mainAlerts = await AlertModel.find({ assignedResponder: responderId }).sort({ createdAt: -1 });
    const acceptedAlerts = await AcceptedAlertModel.find({ assignedResponder: responderId }).sort({ acceptedAt: -1 });

    const allAlerts = [...mainAlerts, ...acceptedAlerts];
    const uniqueAlerts = [];
    const seenIds = new Set();

    for (const alert of allAlerts) {
      const id = alert.reportId || alert._id.toString();
      if (!seenIds.has(id)) {
        seenIds.add(id);
        uniqueAlerts.push(alert);
      }
    }

    res.json(uniqueAlerts);
  } catch (err) {
    console.error("getAssignedAlerts error:", err);
    res.status(500).json({ message: err.message });
  }
};

const searchResponders = async (req, res) => {
  try {
    const { ResponderModel } = getModels(req);
    const searchValue = req.query.type || req.query.query || "";
    const regex = new RegExp(searchValue, "i");

    const responders = await ResponderModel.find({
      $or: [{ name: regex }, { NIC: regex }, { email: regex }, { responderType: regex }],
    }).limit(25);

    res.json(responders);
  } catch (err) {
    console.error("searchResponders error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get nearby active responders for reassignment
const getNearbyResponders = async (req, res) => {
  try {
    const { alertId } = req.params;
    if (!isValidId(alertId)) return res.status(400).json({ message: "Invalid alert ID" });

    const { AlertModel, AcceptedAlertModel, ResponderModel } = getModels(req);

    let alert = await AlertModel.findById(alertId) || await AcceptedAlertModel.findById(alertId);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    let alertLat, alertLng;
    if (alert.location?.latitude && alert.location?.longitude) {
      alertLat = alert.location.latitude;
      alertLng = alert.location.longitude;
    } else if (alert.location?.coordinates && Array.isArray(alert.location.coordinates)) {
      alertLng = alert.location.coordinates[0];
      alertLat = alert.location.coordinates[1];
    } else {
      return res.status(400).json({ message: "Alert location not available" });
    }

    const activeResponders = await ResponderModel.find({ status: "active", _id: { $ne: alert.assignedResponder } });
    const nearbyResponders = [];

    for (const responder of activeResponders) {
      const respLat = responder.lastLocation?.latitude || responder.location?.latitude || responder.location?.coordinates?.[1];
      const respLng = responder.lastLocation?.longitude || responder.location?.longitude || responder.location?.coordinates?.[0];
      if (respLat == null || respLng == null) continue;

      const distance = getDistanceFromLatLonInKm(alertLat, alertLng, respLat, respLng);
      if (distance <= 10) nearbyResponders.push({ ...responder.toObject(), distance: distance.toFixed(2) });
    }

    nearbyResponders.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    res.json(nearbyResponders);
  } catch (err) {
    console.error("getNearbyResponders error:", err);
    res.status(500).json({ message: err.message });
  }
};

const assignNewResponder = async (req, res) => {
  try {
    const { id } = req.params;
    const { responderId } = req.body;
    if (!isValidId(id) || !responderId || !isValidId(responderId)) {
      return res.status(400).json({ message: "Valid IDs required" });
    }

    const { AlertModel, AcceptedAlertModel, ResponderModel } = getModels(req);
    const newResponder = await ResponderModel.findById(responderId);
    if (!newResponder) return res.status(404).json({ message: "Responder not found" });

    let alert = await AlertModel.findById(id);
    let isAccepted = false;
    if (!alert) {
      alert = await AcceptedAlertModel.findById(id);
      isAccepted = true;
    }
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    alert.assignedResponder = responderId;
    await alert.save();

    if (isAccepted) await AcceptedAlertModel.findByIdAndUpdate(id, { assignedResponder: responderId });
    else await AlertModel.findByIdAndUpdate(id, { assignedResponder: responderId });

    res.json({ message: "✅ Responder assigned successfully", alert });
  } catch (err) {
    console.error("assignNewResponder error:", err);
    res.status(500).json({ message: err.message });
  }
};

const deleteAllAlerts = async (req, res) => {
  try {
    const { AlertModel } = getModels(req);
    await AlertModel.deleteMany({});
    res.json({ message: "🗑️ All alerts deleted" });
  } catch (err) {
    console.error("deleteAllAlerts error:", err);
    res.status(500).json({ message: err.message });
  }
};

const acceptAlert = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { responderId } = req.body;

    const db = req.app.locals.db;
    if (!db) return res.status(500).json({ message: "DB not initialized" });

    const { AlertModel, AcceptedAlertModel } = db;

    // Fetch the task using the connected AlertModel
    const task = await AlertModel.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Update the SOS task
    task.assignedResponder = responderId;
    task.status = "Accepted";
    task.acceptedAt = new Date();
    await task.save();

    // Map emergency type
    const allowedEmergencies = ["Fire", "Medical", "Robbery", "Accident", "Other"];
    let emergencyType = allowedEmergencies.includes(task.emergency) ? task.emergency : "Other";

    const acceptedAlert = new AcceptedAlertModel({
      acceptedBy: [responderId],
      userId: task.user ? task.user.toString() : "N/A",
      NIC: task.NIC || "N/A",
      contactNumber: task.number || "",
      emergencyType,
      address: task.location?.mapLink || "",
    });

    await acceptedAlert.save();

    res.status(200).json({ message: "Task accepted successfully", acceptedAlert });
  } catch (err) {
    console.error("acceptTask error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export {
  getAllAlerts,
  getAlertsByStatus,
  getAcceptedAlertsByResponder, // ✅ included only once
  getAllCompletedAlerts,
  getCanceledAlerts,
  addAlert,
  displayAlertDetails,
  acceptAlert,
  cancelAlert,
  markAsReached,
  completeAlertWithDetails,
  updateResponderLocation,
  getAssignedAlerts,
  searchResponders,
  getNearbyResponders,
  assignNewResponder,
  deleteAllAlerts,
};