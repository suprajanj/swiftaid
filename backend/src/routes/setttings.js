import express from "express";
import { getAutoAssign, updateAutoAssign } from "../controllers/settingController.js";
const router = express.Router();

router.get("/auto-assign", getAutoAssign);
router.post("/auto-assign", updateAutoAssign);

export default router;