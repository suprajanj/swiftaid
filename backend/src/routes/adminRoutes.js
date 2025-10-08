import express from "express";
import { generateReports } from "../controllers/reportController.js";
import path from "path";

const router = express.Router();

router.get("/generate", generateReports);

// serve static reports
router.use("/reports", express.static(path.join(process.cwd(), "reports")));

export default router;
