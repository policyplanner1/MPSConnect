/**
 * One-off repair when support_chat_history was created with bigint user_id.
 * Safe to run multiple times (table is empty or user_id already varchar).
 */
require("dotenv").config();
const prisma = require("../src/config/prisma");

async function main() {
  const columns = await prisma.$queryRawUnsafe(
    "DESCRIBE support_chat_history",
  );
  const userCol = columns.find((col) => col.Field === "user_id");
  const intentCol = columns.find((col) => col.Field === "intent");

  if (userCol && String(userCol.Type).toLowerCase().includes("bigint")) {
    console.log("Converting user_id from BIGINT to VARCHAR(191)…");
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `support_chat_history` MODIFY `user_id` VARCHAR(191) NOT NULL",
    );
  }

  if (!intentCol) {
    console.log("Adding intent column…");
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `support_chat_history` ADD COLUMN `intent` VARCHAR(50) NULL AFTER `bot_response`",
    );
  }

  try {
    await prisma.$executeRawUnsafe(
      "CREATE INDEX `support_chat_history_user_id_idx` ON `support_chat_history` (`user_id`)",
    );
    console.log("Created user_id index.");
  } catch (error) {
    if (!/duplicate key name/i.test(String(error?.message || error))) {
      throw error;
    }
  }

  console.log("support_chat_history schema OK.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
