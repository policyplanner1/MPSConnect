require("dotenv").config();
const prisma = require("../src/config/prisma");
const { initFirebaseAdmin } = require("../src/config/firebase");
const { sendPushToUser } = require("../src/services/fcm.service");

async function main() {
  initFirebaseAdmin();
  const user = await prisma.user.findFirst({
    where: { fcmToken: { not: null } },
    select: { id: true, email: true },
  });
  if (!user) {
    console.error("No user with fcmToken");
    process.exit(1);
  }
  const result = await sendPushToUser(user.id, {
    title: "MPS Connect test",
    body: "If you see this, backend FCM is working.",
    data: { type: "test" },
  });
  console.log(user.email, result);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
