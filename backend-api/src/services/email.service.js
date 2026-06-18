const nodemailer = require("nodemailer");

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  const from =
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    user ||
    "noreply@mpsconnect.com";

  return { host, port, user, pass, from };
}

function createTransporter() {
  const { host, port, user, pass } = getSmtpConfig();

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

function isEmailConfigured() {
  return createTransporter() != null;
}

async function sendMail({ to, subject, text, html }) {
  const { from } = getSmtpConfig();
  const transporter = createTransporter();

  if (!transporter) {
    return { sent: false, devLogged: true };
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return { sent: true, devLogged: false };
}

async function sendOtpEmail({ to, otp }) {
  const subject = "MPS Connect – Password reset code";
  const text = `Your password reset code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, ignore this email.`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#111827;margin:0 0 16px;">Password reset</h2>
      <p style="color:#374151;">Your verification code is:</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2563eb;margin:16px 0;">${otp}</p>
      <p style="color:#374151;">This code expires in <strong>10 minutes</strong>.</p>
      <p style="color:#6b7280;font-size:14px;">If you did not request a password reset, you can ignore this email.</p>
    </div>
  `;

  const result = await sendMail({ to, subject, text, html });

  if (!result.sent) {
    console.log("[email] SMTP not configured. OTP for", to, "→", otp);
  }

  return result;
}

async function sendWelcomeEmail({ to, name }) {
  const displayName = String(name || "").trim() || "there";
  const subject = "Welcome to MPS Connect";
  const text = `Hi ${displayName},\n\nWelcome to MPS Connect! Your account has been created successfully.\n\nYou can now sign in with your email and password.\n\nThank you,\nMPS Connect Team`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
      <h2 style="color:#111827;margin:0 0 12px;">Welcome to MPS Connect</h2>
      <p style="color:#374151;">Hi ${displayName},</p>
      <p style="color:#374151;">Your account has been created successfully. You can now sign in with your email and password.</p>
      <p style="color:#374151;">Explore services, track your requests, and manage your profile from the app.</p>
      <p style="color:#6b7280;font-size:14px;margin-top:24px;">Thank you,<br/>MPS Connect Team</p>
    </div>
  `;

  const result = await sendMail({ to, subject, text, html });

  if (!result.sent) {
    console.log("[email] SMTP not configured. Welcome email skipped for", to);
  }

  return result;
}

module.exports = {
  isEmailConfigured,
  sendMail,
  sendOtpEmail,
  sendWelcomeEmail,
};
