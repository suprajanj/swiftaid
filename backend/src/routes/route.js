import express from "express";
import multer from "multer";
import * as controller from "../controller/controller.js";
import * as responderController from "../controller/responderController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/create-responders", responderController.createNewResponder);

router.get("/alerts", controller.getAllAlerts);
router.get("/alerts/accepted", controller.getAllAcceptedAlerts);
router.get("/alerts/status/:status", controller.getAlertsByStatus);
router.get("/alerts/completed", controller.getAllCompletedAlerts);

router.post("/alerts", controller.addAlert);
router.get("/alerts/:id", controller.displayAlertDetails);
router.put("/alerts/:id/accept", controller.acceptAlert);
router.put("/alerts/:id/cancel", controller.cancelAlert); // ✅ updated
router.put("/alerts/:id/reached", controller.markAsReached);
router.put("/alerts/:id/complete", upload.array("files"), controller.completeAlert);
router.put("/alerts/:id/location", controller.updateResponderLocation);
router.get("/alerts/:id/responders", controller.getRespondersForAlert);
router.delete("/alerts", controller.deleteAllAlerts);

export default router;
