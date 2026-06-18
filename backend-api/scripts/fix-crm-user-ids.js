/**
 * One-time dev helper: link CRM user id for users that have FCM but missing crmUserId.
 * Usage: node scripts/fix-crm-user-ids.js 1
 */
require("dotenv").config();
const prisma = require("../src/config/prisma");

const crmUserId = parseInt(process.argv[2], 10);

async function main() {
  if (!Number.isInteger(crmUserId) || crmUserId <= 0) {
    console.error("Usage: node scripts/fix-crm-user-ids.js <crm_user_id>");
    process.exit(1);
  }

  const result = await prisma.user.updateMany({
    where: {
      fcmToken: { not: null },
      crmUserId: null,
    },
    data: { crmUserId },
  });

  console.log(`Updated ${result.count} user(s) with crmUserId=${crmUserId}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
