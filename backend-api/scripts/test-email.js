/**
 * Test SMTP: node scripts/test-email.js your@email.com
 */
require("dotenv").config();
const {
  isEmailConfigured,
  sendWelcomeEmail,
  sendOtpEmail,
} = require("../src/services/email.service");

const to = process.argv[2];

async function main() {
  if (!to) {
    console.error("Usage: node scripts/test-email.js <email>");
    process.exit(1);
  }
  console.log("configured:", isEmailConfigured());
  const welcome = await sendWelcomeEmail({ to, name: "Test User" });
  console.log("welcome:", welcome);
  const otp = await sendOtpEmail({ to, otp: "1234" });
  console.log("otp:", otp);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
