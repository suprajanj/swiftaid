import express from "express";
import multer from "multer";
import {
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
} from "../controller/controller.js";

import {
  createNewResponder,
  loginResponder,
  getAllResponders,
  getResponderById,
  updateResponder,
  deleteResponder,
  logoutResponder,
  updateResponderStatus,
} from "../controller/responderController.js";

const router = express.Router();

// ---------------- MULTER CONFIG ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname
    ),
});
const upload = multer({ storage });

// ---------------- ALERT ROUTES ----------------
router.get("/alerts", getAllAlerts);
router.get("/alerts/status/:status", getAlertsByStatus);
router.get("/alerts/accepted", getAllAcceptedAlerts);
router.get("/alerts/completed", getAllCompletedAlerts);
router.post("/alerts", addAlert);
router.get("/alerts/:id", displayAlertDetails);

router.put("/alerts/:id/accept", acceptAlert);
router.put("/alerts/:id/cancel", cancelAlert);
router.put("/alerts/:id/reached", markAsReached);
router.post(
  "/alerts/:id/completeWithDetails",
  upload.array("files"),
  completeAlertWithDetails
);
router.put("/alerts/:id/location", updateResponderLocation);
router.get("/alerts/assigned/:NIC", getAssignedAlerts);
router.put("/alerts/:id/assign", assignNewResponder);
router.delete("/alerts", deleteAllAlerts);

// ---------------- RESPONDER ROUTES ----------------
router.post("/responders", createNewResponder);
router.post("/responders/login", loginResponder);
router.post("/responders/logout", logoutResponder);
router.get("/responders", getAllResponders);
router.get("/responders/:id", getResponderById);
router.put("/responders/:id", updateResponder);
router.put("/responders/:id/status", updateResponderStatus);
router.delete("/responders/:id", deleteResponder);
router.get("/responders/search", searchResponders);

export default router;
