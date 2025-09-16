const alert = require('D:/2y2s/ITP/Emerjancy responder/swiftaid/backend/src/model/emergencymodel.js');

const getAllAlerts = async (req, res) => {
  try {
    const alerts = await alert.find().select('-__v').sort({ timestamp: -1 });
    if (!alerts || alerts.length === 0) {
      return res.status(404).json({ message: 'No alerts found' });
    }
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const acceptAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await alert.findById(id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    alert.status = 'Accepted';
    await alert.save();
    res.json({ message: 'Alert accepted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const displayAlertDetails = async (req, res) => {
  const { id } = req.params;
  const {status} = req.body;
  const validStatuses = ["pending", "Accepted", "resolved", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }
  try {
    const updatedAlert = await alert.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedAlert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.json(updatedAlert);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getAllAlerts,
  acceptAlert,
  displayAlertDetails
};