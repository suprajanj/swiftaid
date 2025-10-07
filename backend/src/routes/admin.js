import express from "express";
import SOS from "../models/sos.js";
import { generateReports } from "../utils/reportGenerator.js";

const router = express.Router();

// Generate SOS reports manually
router.post("/generate-reports", async (req, res) => {
  try {
    const sosList = await SOS.find().populate("assignedResponder");

    // Optional: send to admin email if provided
    const adminEmail = req.body.adminEmail || null;

    const { csvPath, pdfPath } = await generateReports(sosList, adminEmail);
    res.json({
      message: "Reports generated successfully!",
      csvPath,
      pdfPath,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate reports" });
  }
});

export default router;
