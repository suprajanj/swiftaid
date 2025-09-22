import express from "express";
import * as controller from "../controller/controller.js"; // must be * as controller

const router = express.Router();

router.get("/alerts", controller.getAllAlerts);
router.put("/alerts/:id/accept", controller.acceptAlert);
router.get("/alerts/:id", controller.displayAlertDetails);
router.post("/alerts", controller.addAlert);
router.get("/alerts/accepted", controller.getAllAcceptedAlerts);

export default router;
