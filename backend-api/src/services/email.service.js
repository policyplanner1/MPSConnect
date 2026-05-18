const nodemailer = require("nodemailer");

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

async function sendOtpEmail({ to, otp }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@mpsconnect.com";
  const subject = "MPS Connect – Password reset code";
  const text = `Your password reset code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, ignore this email.`;
  const html = `
    <p>Your password reset code is:</p>
    <p style="font-size:28px;font-weight:bold;letter-spacing:6px;">${otp}</p>
    <p>This code expires in <strong>10 minutes</strong>.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  const transporter = createTransporter();

  if (!transporter) {
    console.log("[email] SMTP not configured. OTP for", to, "→", otp);
    return { sent: false, devLogged: true };
  }

  await transporter.sendMail({ from, to, subject, text, html });
  return { sent: true, devLogged: false };
}

module.exports = { sendOtpEmail };
