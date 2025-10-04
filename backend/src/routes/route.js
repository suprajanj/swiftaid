import express from "express";
import * as controller from "../controller/controller.js"; // Alerts controller
import * as responderController from "../controller/responderController.js";

const router = express.Router();

// Alerts routes
router.get("/alerts", controller.getAllAlerts);
router.post("/alerts", controller.addAlert);
router.get("/alerts/status/:status", controller.getAlertsByStatus);
router.get("/alerts/:id", controller.displayAlertDetails);
router.post("/alerts/:id/accept", controller.acceptAlert);
router.post("/alerts/:id/cancel", controller.cancelAlert);
router.post("/alerts/:id/reached", controller.markAsReached);
router.post("/alerts/:id/complete", controller.completeAlert);
router.post("/alerts/:id/location", controller.updateResponderLocation);
router.delete("/alerts", controller.deleteAllAlerts);

// Accepted/completed
router.get("/accepted", controller.getAllAcceptedAlerts);
router.get("/completed", controller.getAllCompletedAlerts);

// Responder routes
router.post("/create-responder", responderController.createNewResponder);
router.get("/responders", responderController.getAllResponders);
router.post("/login", responderController.loginResponder);

export default router;
