import mongoose from "mongoose";

// ✅ Helper to validate ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ✅ Helper to get models from app.locals
const getModels = (req) => {
  const db = req.app.locals.db;
  if (!db) throw new Error("Models not initialized in DB connections");
  return db;
};

/* ============================================================
   ALERT MANAGEMENT
============================================================ */

// GET all alerts (pending + accepted + completed)
const getAllAlerts = async (req, res) => {
  try {
    const { AlertModel } = getModels(req);
    const alerts = await AlertModel.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    console.error("getAllAlerts error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET alerts by status
const getAlertsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { AlertModel } = getModels(req);
    const alerts = await AlertModel.find({ status }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    console.error("getAlertsByStatus error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET all accepted alerts
const getAllAcceptedAlerts = async (req, res) => {
  try {
    const { AcceptedAlertModel } = getModels(req);
    const alerts = await AcceptedAlertModel.find().sort({ acceptedAt: -1 });
    res.json(alerts);
  } catch (err) {
    console.error("getAllAcceptedAlerts error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET all completed alerts
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

// ADD new alert
const addAlert = async (req, res) => {
  try {
    const { AlertModel } = getModels(req);
    const { NIC, contactNumber, emergencyType, liveLocation, address } = req.body;

    if (!NIC || !contactNumber || !emergencyType || !liveLocation || !address) {
      return res.status(400).json({ message: "All required fields are mandatory!" });
    }

    const newAlert = new AlertModel({ ...req.body, status: "pending" });
    await newAlert.save();

    res.status(201).json({ message: "Alert added successfully", alert: newAlert });
  } catch (err) {
    console.error("addAlert error:", err);
    res.status(500).json({ message: err.message });
  }
};

// DISPLAY single alert details
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

/* ============================================================
   ALERT STATE MANAGEMENT
============================================================ */

// ACCEPT alert
const acceptAlert = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

    const { AlertModel, AcceptedAlertModel } = getModels(req);

    const alert = await AlertModel.findById(id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    alert.status = "accepted";
    await alert.save();

    const acceptedAlert = new AcceptedAlertModel({
      ...alert.toObject(),
      status: "accepted",
      acceptedAt: new Date(),
      reportId: alert.reportId || alert._id, // ensure reportId exists
    });
    delete acceptedAlert._id;
    await acceptedAlert.save();

    res.json({ message: "Alert accepted successfully", alert, acceptedAlert });
  } catch (err) {
    console.error("acceptAlert error:", err);
    res.status(500).json({ error: err.message });
  }
};

// CANCEL alert
const cancelAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { reasons = [] } = req.body;

    const { AcceptedAlertModel, CanceledAlertModel, AlertModel } = getModels(req);

    const alert = await AcceptedAlertModel.findById(id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    const canceled = new CanceledAlertModel({
      ...alert.toObject(),
      status: "cancelled",
      reasonToReject: Array.isArray(reasons) ? reasons.join(", ") : String(reasons),
      cancelledAt: new Date(),
      reportId: alert.reportId || alert._id, // ensure reportId exists
    });
    delete canceled._id;
    await canceled.save();

    await AcceptedAlertModel.findByIdAndDelete(id);
    await AlertModel.findOneAndUpdate(
      { reportId: alert.reportId || alert._id },
      { status: "cancelled", reasonToReject: canceled.reasonToReject }
    );

    res.json({ message: "Alert cancelled successfully", canceled });
  } catch (err) {
    console.error("cancelAlert error:", err);
    res.status(500).json({ error: err.message });
  }
};

// MARK alert as reached
const markAsReached = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

    const { AlertModel, AcceptedAlertModel } = getModels(req);
    const update = { status: "reached" };

    const alert =
      (await AcceptedAlertModel.findByIdAndUpdate(id, update, { new: true })) ||
      (await AlertModel.findByIdAndUpdate(id, update, { new: true }));

    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json({ message: "Responder reached", alert });
  } catch (err) {
    console.error("markAsReached error:", err);
    res.status(500).json({ error: err.message });
  }
};

// COMPLETE alert
const completeAlertWithDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ID" });

    const { CompletedAlertModel, AcceptedAlertModel, AlertModel } = getModels(req);

    const alert = (await AcceptedAlertModel.findById(id)) || (await AlertModel.findById(id));
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    const {
      completedBy,
      position,
      NIC,
      contactNumber,
      emergencyType,
      location,
      senderNIC,
      senderName,
      senderContactNumber,
      senderAddress,
      otherParticipants,
      otherResponders,
      casualties,
      criticalInjuries,
      fatalities,
      totalVictims,
      comment,
    } = req.body;

    const files = req.files ? req.files.map((f) => f.path) : [];

    const completed = new CompletedAlertModel({
      ...alert.toObject(),
      reportId: alert.reportId || alert._id, // fixed: ensure reportId exists
      completedBy,
      position,
      NIC,
      contactNumber,
      emergencyType,
      location,
      senderNIC,
      senderName,
      senderContactNumber,
      senderAddress,
      otherParticipants,
      otherResponders: otherResponders ? JSON.parse(otherResponders) : [],
      casualties: Number(casualties) || 0,
      criticalInjuries: Number(criticalInjuries) || 0,
      fatalities: Number(fatalities) || 0,
      totalVictims: Number(totalVictims) || 0,
      comment,
      files,
      status: "completed",
      completedAt: new Date(),
    });

    delete completed._id;
    await completed.save();

    if (await AcceptedAlertModel.exists({ _id: id })) await AcceptedAlertModel.findByIdAndDelete(id);
    if (await AlertModel.exists({ _id: id })) await AlertModel.findByIdAndDelete(id);

    res.json({ message: "Task completed with all details!", completed });
  } catch (err) {
    console.error("completeAlertWithDetails error:", err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE responder location
const updateResponderLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

    const { AlertModel, AcceptedAlertModel } = getModels(req);
    const update = { responderLocation: { lat, lng } };

    const alert =
      (await AcceptedAlertModel.findByIdAndUpdate(id, update, { new: true })) ||
      (await AlertModel.findByIdAndUpdate(id, update, { new: true }));

    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json({ message: "Responder location updated", alert });
  } catch (err) {
    console.error("updateResponderLocation error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET assigned alerts by responder NIC
const getAssignedAlerts = async (req, res) => {
  try {
    const { NIC } = req.params;
    if (!NIC) return res.status(400).json({ message: "NIC required" });

    const { AlertModel } = getModels(req);
    const alerts = await AlertModel.find({ "assignedResponders.NIC": NIC });
    res.json(alerts);
  } catch (err) {
    console.error("getAssignedAlerts error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   RESPONDER MANAGEMENT
============================================================ */

// SEARCH responders
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
    res.status(500).json({ error: "Failed to fetch responders" });
  }
};

// ASSIGN extra responder
const assignNewResponder = async (req, res) => {
  try {
    const { id } = req.params;
    const { responderId } = req.body;
    if (!isValidId(id) || !isValidId(responderId))
      return res.status(400).json({ error: "Invalid ID" });

    const { AlertModel, AcceptedAlertModel, ResponderModel } = getModels(req);

    const alert = (await AlertModel.findById(id)) || (await AcceptedAlertModel.findById(id));
    if (!alert) return res.status(404).json({ error: "Alert not found" });

    const responder = await ResponderModel.findById(responderId);
    if (!responder) return res.status(404).json({ error: "Responder not found" });

    const alreadyAssigned = (alert.assignedResponders || []).some(
      (r) => r._id.toString() === responder._id.toString()
    );
    if (alreadyAssigned)
      return res.status(400).json({ error: "Responder already assigned" });

    alert.assignedResponders = [...(alert.assignedResponders || []), responder];
    if (alert.status === "pending") alert.status = "accepted";
    await alert.save();

    res.json({ message: "Responder assigned successfully", alert });
  } catch (err) {
    console.error("assignNewResponder error:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE all alerts
const deleteAllAlerts = async (req, res) => {
  try {
    const { AlertModel, AcceptedAlertModel, CompletedAlertModel, CanceledAlertModel } =
      getModels(req);
    await AlertModel.deleteMany({});
    await AcceptedAlertModel.deleteMany({});
    await CompletedAlertModel.deleteMany({});
    await CanceledAlertModel.deleteMany({});
    res.json({ message: "All alerts deleted successfully" });
  } catch (err) {
    console.error("deleteAllAlerts error:", err);
    res.status(500).json({ error: err.message });
  }
};

export {
  getAllAlerts,
  getAllAcceptedAlerts,
  getAllCompletedAlerts,
  getAlertsByStatus,
  addAlert,
  displayAlertDetails,
  acceptAlert,
  cancelAlert,
  markAsReached,
  completeAlertWithDetails,
  updateResponderLocation,
  getAssignedAlerts,
  searchResponders,
  assignNewResponder,
  deleteAllAlerts,
};
