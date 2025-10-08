// controllers/sosController.js
import SOS from "../models/sos.js";
import Responder from "../models/Responder.js";
import SystemSetting from "../models/SystemSetting.js";
import { sendEmail } from "../services/notificationService.js";

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get all SOS records
export const getAllSOS = async (req, res) => {
  try {
    const sosList = await SOS.find()
      .populate("assignedResponder", "name contactNumber responderType status");
    res.status(200).json(sosList);
  } catch (err) {
    console.error("Error fetching SOS records:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get SOS by ID
export const getSOSByID = async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.id)
      .populate("assignedResponder", "name contactNumber responderType status");
    if (!sos) return res.status(404).json({ message: "SOS not found" });
    res.status(200).json(sos);
  } catch (err) {
    console.error("Error fetching SOS by ID:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create a new SOS
export const createSOS = async (req, res) => {
  try {
    const { name, age, number, emergency, location } = req.body;

    // 🔄 Check global auto-assign setting
    const setting = await SystemSetting.findOne({ key: "autoAssign" });
    const autoAssign = setting?.value === true;

    let assignedResponder = null;

    if (autoAssign) {
      const responders = await Responder.find({
        responderType: emergency,
        status: "available",
      });

      // find nearest responder (using your getDistance helper)
      let minDist = Infinity;
      for (const r of responders) {
        if (r.lastLocation?.latitude && r.lastLocation?.longitude) {
          const d = getDistance(
            location.latitude,
            location.longitude,
            r.lastLocation.latitude,
            r.lastLocation.longitude
          );
          if (d < minDist) {
            minDist = d;
            assignedResponder = r;
          }
        }
      }

      if (assignedResponder) {
        assignedResponder.status = "busy";
        await assignedResponder.save();
      }
    }

    const sos = new SOS({
      name,
      age,
      number,
      emergency,
      location,
      assignedResponder: assignedResponder?._id || null,
      status: assignedResponder ? "Assigned" : "Pending",
    });

    await sos.save();
    const message = `🚨 New SOS Assigned: ${sos.emergency} for ${sos.name}. Please respond immediately.`;

    if (assignedResponder && assignedResponder.email) {
      await sendEmail(assignedResponder.email, sos);
    } else {
      console.warn("⚠️ No responder assigned — skipping email notification.");
    }

    res.status(201).json({
      message: autoAssign
        ? assignedResponder
          ? `Auto-assigned to ${assignedResponder.name}`
          : "No available responder"
        : "Manual mode — SOS created",
      sos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating SOS" });
  }
};
// Update SOS
export const updateSOS = async (req, res) => {
  try {
    const { name, age, number, emergency, location, status, comment } = req.body;

    const sos = await SOS.findById(req.params.id);
    if (!sos) return res.status(404).json({ message: "SOS not found" });

    // If emergency changes, unassign responder
    if (emergency && sos.emergency !== emergency && sos.assignedResponder) {
      const prevResponder = await Responder.findById(sos.assignedResponder);
      if (prevResponder) {
        prevResponder.status = "available";
        await prevResponder.save();
      }
      sos.assignedResponder = null;
      sos.status = "Pending";
    }

    sos.name = name || sos.name;
    sos.age = age || sos.age;
    sos.number = number || sos.number;
    sos.emergency = emergency || sos.emergency;

    if (location?.latitude && location?.longitude) {
      sos.location = {
        latitude: location.latitude,
        longitude: location.longitude,
        mapLink: `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
      };
    }

    if (status) sos.status = status;
    if (comment) sos.comment = comment;

    const updatedSOS = await sos.save();
    const populatedSOS = await updatedSOS.populate(
      "assignedResponder",
      "name contactNumber responderType status"
    );
    res.status(200).json(populatedSOS);
  } catch (err) {
    console.error("Error updating SOS:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete SOS
export const deleteSOS = async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.id);
    if (!sos) return res.status(404).json({ message: "SOS not found" });

    if (sos.assignedResponder) {
      const responder = await Responder.findById(sos.assignedResponder);
      if (responder) {
        responder.status = "available";
        await responder.save();
      }
    }

    await SOS.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "SOS deleted successfully" });
  } catch (err) {
    console.error("Error deleting SOS:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Assign a responder to SOS
export const assignResponder = async (req, res) => {
  try {
    const { sosId, responderId } = req.body;

    const sos = await SOS.findById(sosId);
    if (!sos) return res.status(404).json({ message: "SOS not found" });

    const responder = await Responder.findById(responderId);
    if (!responder) return res.status(404).json({ message: "Responder not found" });

    sos.assignedResponder = responder._id;
    sos.status = "Assigned";
    await sos.save();

    const message = `🚨 New SOS Assigned: ${sos.emergency} for ${sos.name}. Please respond immediately.`;

    if (responder.email) await sendEmail(responder.email, sos);

    responder.status = "busy";
    await responder.save();

    const populatedSOS = await sos.populate(
      "assignedResponder",
      "name contactNumber responderType status"
    );
    res.status(200).json({ sos: populatedSOS, responder });
  } catch (err) {
    console.error("Error assigning responder:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Mark SOS as completed
export const completeSOS = async (req, res) => {
  try {
    const sos = await SOS.findByIdAndUpdate(
      req.params.id,
      { status: "Completed", completedAt: new Date() },
      { new: true }
    ).populate("assignedResponder", "name contactNumber responderType status");

    const responder = await Responder.findById(sos.assignedResponder);
    responder.status = "available";
    responder.lastLocation = sos.location;
    await responder.save();

    if (!sos) return res.status(404).json({ message: "SOS not found" });
    res.status(200).json(sos);
  } catch (err) {
    console.error("Error completing SOS:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
