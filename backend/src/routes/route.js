import express from "express";
import * as controller from "../controller/controller.js";

const router = express.Router();

router.get("/alerts", controller.getAllAlerts);
router.post("/alerts", controller.addAlert);
router.get("/alerts/:id", controller.displayAlertDetails);
router.put("/alerts/:id/accept", controller.acceptAlert);
router.get("/alerts/accepted", controller.getAcceptedAlerts);
router.put("/alerts/accepted/complete", controller.updateAcceptedAlertAndMoveToCompleted);

export default router;
