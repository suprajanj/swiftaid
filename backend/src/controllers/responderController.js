import Responder from "../models/Responder.js";

// ✅ Create a new responder
export const createResponder = async (req, res) => {
  try {
    const responder = new Responder(req.body);
    const savedResponder = await responder.save();
    res.status(201).json(savedResponder);
  } catch (error) {
    console.error("Error creating responder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get all responders
export const getResponders = async (req, res) => {
  try {
    const responders = await Responder.find();

    // alias lastLocation → location for frontend consistency
    const formatted = responders.map(r => ({
      ...r.toObject(),
      location: r.lastLocation,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching responders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Update responder (full update)
export const updateResponder = async (req, res) => {
  try {
    const updated = await Responder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Responder not found" });

    res.status(200).json({
      ...updated.toObject(),
      location: updated.lastLocation,
    });
  } catch (error) {
    console.error("Error updating responder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Delete responder
export const deleteResponder = async (req, res) => {
  try {
    const deleted = await Responder.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Responder not found" });
    res.status(200).json({ message: "Responder deleted" });
  } catch (error) {
    console.error("Error deleting responder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Patch responder (update availability)
export const patchResponder = async (req, res) => {
  try {
    const { availability } = req.body;
    const responder = await Responder.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true }
    );

    if (!responder) return res.status(404).json({ message: "Responder not found" });

    res.json({
      ...responder.toObject(),
      location: responder.lastLocation,
    });
  } catch (err) {
    console.error("Error patching responder:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🔥 NEW: Get responders by emergency type (for map popup)
export const getRespondersByType = async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({ message: "Emergency type is required" });
    }

    const responders = await Responder.find({
      emergencyType: type,
      availability: true,
    });

    // Map lastLocation → location
    const formatted = responders.map(r => ({
      ...r.toObject(),
      location: r.lastLocation,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching responders by type:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
