// backend/routes/responderRoutes.js
import express from "express";
import { createResponder, getResponders, updateResponder, deleteResponder, patchResponder} from "../controllers/responderController.js";

const router = express.Router();

router.post("/", createResponder);
router.get("/", getResponders);
router.put("/:id", updateResponder);
router.delete("/:id", deleteResponder);
router.patch("/:id", patchResponder); // Update availability status

export default router;
