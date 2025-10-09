// src/routes/testEmail.js
import express from "express";
import { sendThankYouEmail } from "../controllers/donationController.js";

const router = express.Router();

// GET /api/test-email?to=someone@gmail.com
router.get("/test-email", async (req, res) => {
  try {
    const to = req.query.to || process.env.EMAIL_USER;
    console.log("📩 Triggering test email to:", to);
    await sendThankYouEmail(to, "Test User", "SwiftAid");
    res.json({ success: true, message: `Test email attempted to ${to}` });
  } catch (err) {
    console.error("❌ Test email failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
