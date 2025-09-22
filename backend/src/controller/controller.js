import Alert from "../model/alertModel.js";
import AcceptedAlert from "../model/acceptedAlertModel.js"; // correct relative path

const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllAcceptedAlerts = async (req, res) => {
  try {
    const acceptedAlerts = await AcceptedAlert.find().sort({ acceptedAt: -1 });
    res.json(acceptedAlerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

const acceptAlert = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the alert to move it to accepted collection
    const alert = await Alert.findById(id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    // Save to acceptedAlerts collection
    const accepted = new AcceptedAlert({ ...alert.toObject(), status: "Accepted" });
    await accepted.save();

    // Optionally update the status in original alert
    alert.status = "Accepted";
    await alert.save();

    res.json({ message: "Alert accepted successfully", accepted });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const displayAlertDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addAlert = async (req, res) => {
  try {
    const newAlert = new Alert(req.body);
    await newAlert.save();
    res.status(201).json(newAlert);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Export all functions
export { getAllAlerts, acceptAlert, displayAlertDetails, addAlert, getAllAcceptedAlerts };
