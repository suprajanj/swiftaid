import Alert from "../model/alertModel.js";
import AcceptedAlert from "../model/acceptedAlertModel.js";
import CompletedAlert from "../model/completedAlertModel.js";

// Get all alerts
const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all accepted alerts
const getAllAcceptedAlerts = async (req, res) => {
  try {
    const alerts = await AcceptedAlert.find();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get alerts by status
const getAlertsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const alerts = await Alert.find({ status });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new alert
const addAlert = async (req, res) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Display single alert details
const displayAlertDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const alert =
      (await Alert.findById(id)) ||
      (await AcceptedAlert.findById(id)) ||
      (await CompletedAlert.findById(id));

    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Accept an alert
const acceptAlert = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove from completed (if exists)
    await CompletedAlert.findByIdAndDelete(id);

    const alert = await Alert.findById(id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    const accepted = new AcceptedAlert(alert.toObject());
    await accepted.save();

    await Alert.findByIdAndDelete(id); // remove from main
    res.json({ message: "Alert accepted", accepted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel an alert (remove from accepted)
const cancelAlert = async (req, res) => {
  try {
    const { id } = req.params;

    await AcceptedAlert.findByIdAndDelete(id);
    await CompletedAlert.findByIdAndDelete(id);
    await Alert.findByIdAndDelete(id);

    res.json({ message: "Alert canceled from all databases" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark as reached
const markAsReached = async (req, res) => {
  try {
    const { id } = req.params;

    const update = { status: "reached" };
    const alert =
      (await AcceptedAlert.findByIdAndUpdate(id, update, { new: true })) ||
      (await Alert.findByIdAndUpdate(id, update, { new: true }));

    if (!alert) return res.status(404).json({ message: "Alert not found" });

    res.json({ message: "Responder reached", alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complete alert
const completeAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const files = req.files || [];

    // Find in accepted or main alerts
    const alert =
      (await AcceptedAlert.findById(id)) || (await Alert.findById(id));
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    const completed = new CompletedAlert({
      ...alert.toObject(),
      comment,
      files: files.map((f) => f.filename),
      completedAt: new Date(),
    });

    await completed.save();

    // Remove from other databases
    await AcceptedAlert.findByIdAndDelete(id);
    await Alert.findByIdAndDelete(id);

    res.json({ message: "Alert completed successfully", completed });
  } catch (error) {
    console.error("❌ completeAlert error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update responder location
const updateResponderLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;
    const update = { responderLocation: { lat, lng } };

    const alert =
      (await AcceptedAlert.findByIdAndUpdate(id, update, { new: true })) ||
      (await Alert.findByIdAndUpdate(id, update, { new: true }));

    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json({ message: "Responder location updated", alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get responders for an alert
const getRespondersForAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert =
      (await AcceptedAlert.findById(id)) ||
      (await Alert.findById(id)) ||
      (await CompletedAlert.findById(id));

    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert.responders || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// In controller.js
// controller/controller.js
const deleteAllAlerts = async (req, res) => {
  try {
    await Alert.deleteMany({});
    await AcceptedAlert.deleteMany({});
    await CompletedAlert.deleteMany({});
    res.json({ message: "All alerts deleted from all databases" });
  } catch (error) {
    console.error("❌ deleteAllAlerts error:", error);
    res.status(500).json({ error: error.message });
  }
};

export {
  getAllAlerts,
  getAllAcceptedAlerts,
  getAlertsByStatus,
  addAlert,
  displayAlertDetails,
  acceptAlert,
  cancelAlert,
  markAsReached,
  completeAlert,
  updateResponderLocation,
  getRespondersForAlert,
  deleteAllAlerts,
};