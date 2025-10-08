// backend/routes/adminReports.js
import express from "express";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import SOS from "../models/sos.js"; // adjust if path differs

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.get("/generate-reports", async (req, res) => {
  try {
    const sosData = await SOS.find().lean();
    if (!sosData.length)
      return res.status(404).json({ message: "No SOS records found" });

    const reportDir = path.join(__dirname, "../reports");
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);

    const csvPath = path.join(reportDir, "sos_report.csv");
    const pdfPath = path.join(reportDir, "sos_report.pdf");

    const headers = "Name,Emergency,Status,Latitude,Longitude,Date\n";
    const rows = sosData
      .map(
        (s) =>
          `${s.name},${s.emergency},${s.status || "Pending"},${s.location?.latitude || ""},${s.location?.longitude || ""},${new Date(
            s.createdAt
          ).toLocaleString()}`
      )
      .join("\n");

    fs.writeFileSync(csvPath, headers + rows, "utf8");

    const doc = new PDFDocument();
    const pdfStream = fs.createWriteStream(pdfPath);
    doc.pipe(pdfStream);
    doc.fontSize(18).text("🚨 SwiftAid SOS Report", { align: "center" });
    doc.moveDown();
    sosData.forEach((s, i) =>
      doc.text(
        `${i + 1}. ${s.name} | ${s.emergency} | ${s.status || "Pending"} | (${s.location?.latitude}, ${s.location?.longitude})`
      )
    );
    doc.end();

    pdfStream.on("finish", () => {
      res.json({
        csv: `http://localhost:4000/reports/sos_report.csv`,
        pdf: `http://localhost:4000/reports/sos_report.pdf`,
      });
    });
  } catch (err) {
    console.error("Report generation error:", err);
    res.status(500).json({ message: "Report generation failed" });
  }
});

export default router;
