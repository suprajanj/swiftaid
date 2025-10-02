import mongoose from "mongoose";
import Alert from "../model/alertModel.js";
import AcceptedAlert from "../model/acceptedAlertModel.js";
import CompletedAlert from "../model/completedAlertModel.js";
import CanceledAlert from "../model/canceledAlerts.js";
import Responder from "../model/responderModel.js";


const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const createNewResponder = async (req, res) => {
  try {
    const { NIC, name, contactNumber, email, address, emergencyType, lastlocation } = req.body;

    const newResponder = new Responder({
      NIC,
      name,
      contactNumber,
      email,
      address,
      emergencyType,
      lastlocation,
    });
    await newResponder.save();
    res.status(201).json(newResponder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { createNewResponder };