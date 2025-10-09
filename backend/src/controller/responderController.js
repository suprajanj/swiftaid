import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import responderSchema from "../model/responderModel.js";
import sosSchema from "../model/alertModel.js";
import acceptedSchema from "../model/acceptedAlertModel.js";
import completedSchema from "../model/completedAlertModel.js";
import canceledSchema from "../model/canceledAlerts.js";

// =================== HELPERS ===================
export const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getModels = (req) => {
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

// =================== RESPONDER CONTROLLERS ===================

// Create new responder
export const createNewResponder = async (req, res) => {
  try {
    const { NIC, name, contactNumber, password, address, position, responderType, email, lastLocation } = req.body;
    const { ResponderModel } = getModels(req);

    if (!NIC || !name || !contactNumber || !email || !address || !password || !position || !responderType)
      return res.status(400).json({ message: "Missing required fields" });

    const existing = await ResponderModel.findOne({ $or: [{ email }, { NIC }] });
    if (existing) return res.status(400).json({ message: "Responder already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newResponder = new ResponderModel({
      NIC,
      name,
      contactNumber,
      email,
      password: hashedPassword,
      address,
      position,
      responderType,
      status: "inactive",
      lastLocation: {
        latitude: lastLocation?.latitude || 0,
        longitude: lastLocation?.longitude || 0,
        mapLink: lastLocation?.mapLink || "",
      },
    });

    await newResponder.save();
    res.status(201).json({ message: "Responder created successfully", responder: newResponder });
  } catch (err) {
    console.error("❌ Error creating responder:", err);
    res.status(500).json({ error: err.message });
  }
};

// Login responder
export const loginResponder = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { ResponderModel } = getModels(req);

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const responder = await ResponderModel.findOne({ email });
    if (!responder) return res.status(404).json({ message: "Responder not found" });

    const isMatch = await bcrypt.compare(password, responder.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    responder.status = "active";
    await responder.save();

    res.status(200).json({
      message: "Login successful",
      responder: {
        _id: responder._id,
        email: responder.email,
        NIC: responder.NIC,
        name: responder.name,
        responderType: responder.responderType,
        status: responder.status,
        lastLocation: responder.lastLocation,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Logout responder
export const logoutResponder = async (req, res) => {
  try {
    const { id } = req.body;
    const { ResponderModel } = getModels(req);

    const responder = await ResponderModel.findById(id);
    if (!responder) return res.status(404).json({ message: "Responder not found" });

    responder.status = "inactive";
    await responder.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update responder info
export const updateResponder = async (req, res) => {
  try {
    const { ResponderModel } = getModels(req);
    const updated = await ResponderModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Responder not found" });
    res.status(200).json({ message: "Responder updated successfully", responder: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update responder status
export const updateResponderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { ResponderModel } = getModels(req);

    const responder = await ResponderModel.findById(id);
    if (!responder) return res.status(404).json({ message: "Responder not found" });

    responder.status = status;
    await responder.save();

    res.status(200).json({ message: "Status updated successfully", responder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update responder last location
export const updateResponderLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, mapLink } = req.body;
    const { ResponderModel } = getModels(req);

    const responder = await ResponderModel.findById(id);
    if (!responder) return res.status(404).json({ message: "Responder not found" });

    responder.lastLocation = { latitude, longitude, mapLink };
    await responder.save();

    res.status(200).json({ message: "Location updated successfully", lastLocation: responder.lastLocation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all responders
export const getAllResponders = async (req, res) => {
  try {
    const { ResponderModel } = getModels(req);
    const responders = await ResponderModel.find();
    res.status(200).json(responders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get responder by ID
export const getResponderById = async (req, res) => {
  try {
    const { ResponderModel } = getModels(req);
    const responder = await ResponderModel.findById(req.params.id);
    if (!responder) return res.status(404).json({ message: "Responder not found" });
    res.status(200).json(responder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete responder
export const deleteResponder = async (req, res) => {
  try {
    const { ResponderModel } = getModels(req);
    const deleted = await ResponderModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Responder not found" });
    res.status(200).json({ message: "Responder deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
