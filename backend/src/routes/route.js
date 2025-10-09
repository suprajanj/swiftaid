import express from "express";
import multer from "multer";

import * as alertController from "../controller/controller.js";
import * as responderController from "../controller/responderController.js";

const router = express.Router();

/* ================= MULTER CONFIG ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`)
});
const upload = multer({ storage });

/* ================= ALERT ROUTES ================= */

// Fetch all alerts
router.get("/alerts", alertController.getAllAlerts);

// Fetch alerts by status (Pending, accepted, Completed, Cancelled)
router.get("/alerts/status/:status", alertController.getAlertsByStatus);

// Fetch accepted, completed, and cancelled alerts
router.get("/alerts/accepted", alertController.getAcceptedAlertsByResponder); // could be modified if you want all accepted
router.get("/alerts/completed", alertController.getAllCompletedAlerts);
router.get("/alerts/cancelled", alertController.getCanceledAlerts);

// Add a new alert
router.post("/alerts", alertController.addAlert);

// Get details of a single alert
router.get("/alerts/:id", alertController.displayAlertDetails);

// Get nearby active responders for an alert (for reassignment)
router.get("/alerts/:alertId/nearby-responders", alertController.getNearbyResponders);

// Alert state management
router.put("/alerts/:taskId/accept", alertController.acceptAlert);
router.put("/alerts/:id/cancel", alertController.cancelAlert);
router.put("/alerts/:id/reached", alertController.markAsReached);

// Complete alert with details (supports multiple files)
router.post(
  "/alerts/:id/complete",
  upload.array("files"),
  alertController.completeAlertWithDetails
);

// Update responder location
router.patch("/alerts/:id/location", alertController.updateResponderLocation);

// Get alerts assigned to a specific responder
router.get("/alerts/assigned/:responderId", alertController.getAssignedAlerts);

// Get accepted alerts for a specific responder (for accepted tasks page)
router.get("/accepted-alerts/:responderId", alertController.getAcceptedAlertsByResponder);

// Assign a new responder to an alert
router.put("/alerts/:id/assign", alertController.assignNewResponder);

// Delete all alerts (Admin/Test only)
router.delete("/alerts", alertController.deleteAllAlerts);


/* ================= RESPONDER ROUTES ================= */

// Create a new responder
router.post("/responders", responderController.createNewResponder);

// Login / Logout
router.post("/responders/login", responderController.loginResponder);
router.post("/responders/logout", responderController.logoutResponder);

// Fetch all responders or single responder by ID
router.get("/responders", responderController.getAllResponders);
router.get("/responders/:id", responderController.getResponderById);

// Update responder info or status
router.put("/responders/:id", responderController.updateResponder);
router.patch("/responders/:id/status", responderController.updateResponderStatus);

// Delete responder
router.delete("/responders/:id", responderController.deleteResponder);

// Search responders (by name, NIC, email, type)
router.get("/responders/search", alertController.searchResponders);

export default router;
