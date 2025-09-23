import express from "express";
import * as controller from "../controller/controller.js";

const router = express.Router();

router.get("/alerts", controller.getAllAlerts);
router.get("/alerts/accepted", controller.getAllAcceptedAlerts);
router.get("/alerts/status/:status", controller.getAlertsByStatus);

router.put("/alerts/:id/accept", controller.acceptAlert); 
router.put("/alerts/:id/cancel", controller.cancelAlert); 
router.put("/alerts/:id/reached", controller.markAsReached); 
router.put("/alerts/:id/complete", controller.completeAlert); 

router.get("/alerts/:id/responders", controller.getRespondersForAlert);

router.get("/alerts/:id", controller.displayAlertDetails);

router.post("/alerts", controller.addAlert);

export default router;
