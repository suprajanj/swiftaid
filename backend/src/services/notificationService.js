import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_RES_USER,
    pass: process.env.EMAIL_RES_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) console.error("Email transporter error:", err);
  else console.log("Email transporter ready!");
});

export const sendEmail = async (responderEmail, sos) => {
  const { name, age, number, emergency, location } = sos;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: responderEmail,
    subject: `New Emergency Assigned: ${emergency}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #d32f2f;">🚨 New Emergency Assigned</h2>
        <p>Dear Responder,</p>
        <p>You have been assigned to a new emergency case. Details below:</p>
        <table style="border-collapse: collapse; width: 100%; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc;"><strong>Requester Name:</strong></td>
            <td style="padding: 8px; border: 1px solid #ccc;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc;"><strong>Age:</strong></td>
            <td style="padding: 8px; border: 1px solid #ccc;">${age}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc;"><strong>Contact Number:</strong></td>
            <td style="padding: 8px; border: 1px solid #ccc;">${number}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc;"><strong>Emergency Type:</strong></td>
            <td style="padding: 8px; border: 1px solid #ccc;">${emergency}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc;"><strong>Location:</strong></td>
            <td style="padding: 8px; border: 1px solid #ccc;">
              Latitude: ${location.latitude}, Longitude: ${location.longitude}<br/>
              <a href="${location.mapLink}" target="_blank">View on Google Maps</a>
            </td>
          </tr>
        </table>
        <p style="margin-top: 15px;">Please attend to this emergency promptly.</p>
        <p>Thank you,<br/>SwiftAid Dispatch Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${responderEmail} for SOS: ${emergency}`);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
};
