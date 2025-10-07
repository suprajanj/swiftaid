import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { sendEmailWithAttachment } from "./emailService.js"; // your nodemailer email sender

// Ensure reports folder exists
const reportsDir = path.join(process.cwd(), "reports");
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

/**
 * Generate CSV report
 * @param {Array} sosList - List of SOS objects
 * @returns {string} - Path to the generated CSV file
 */
export const generateCSVReport = (sosList) => {
  const fields = [
    "_id",
    "name",
    "age",
    "number",
    "emergency",
    "location.latitude",
    "location.longitude",
    "location.mapLink",
    "assignedResponder.name",
    "assignedResponder.number",
    "status",
    "createdAt",
  ];
  const parser = new Parser({ fields });
  const csv = parser.parse(sosList);

  const filePath = path.join(reportsDir, `sos_report_${Date.now()}.csv`);
  fs.writeFileSync(filePath, csv);
  console.log(`✅ CSV report generated: ${filePath}`);
  return filePath;
};

/**
 * Generate PDF report
 * @param {Array} sosList - List of SOS objects
 * @returns {string} - Path to the generated PDF file
 */
export const generatePDFReport = (sosList) => {
  const filePath = path.join(reportsDir, `sos_report_${Date.now()}.pdf`);
  const doc = new PDFDocument({ margin: 30 });
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text("SwiftAid SOS Report", { align: "center" });
  doc.moveDown();

  sosList.forEach((sos, index) => {
    doc.fontSize(12).text(`${index + 1}. ${sos.emergency} — ${sos.name} (${sos.age})`);
    doc.text(`Contact: ${sos.number}`);
    doc.text(`Location: Lat ${sos.location.latitude}, Lng ${sos.location.longitude}`);
    doc.text(`Map: ${sos.location.mapLink}`);
    doc.text(`Responder: ${sos.assignedResponder?.name || "Not assigned"} (${sos.assignedResponder?.number || "-"})`);
    doc.text(`Status: ${sos.status || "Pending"}`);
    doc.text(`Created At: ${sos.createdAt}`);
    doc.moveDown();
  });

  doc.end();
  console.log(`✅ PDF report generated: ${filePath}`);
  return filePath;
};

/**
 * Generate reports (CSV + PDF) and optionally email
 * @param {Array} sosList - List of SOS objects
 * @param {string} [adminEmail] - Optional admin email to send reports
 */
export const generateReports = async (sosList) => {
  const csvPath = generateCSVReport(sosList);
  const pdfPath = generatePDFReport(sosList);


  return { csvPath, pdfPath };
};
