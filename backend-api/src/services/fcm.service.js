const { getAdmin, isFirebaseReady } = require("../config/firebase");
const prisma = require("../config/prisma");

async function sendPushToToken(fcmToken, { title, body, data = {} }) {
  if (!isFirebaseReady()) {
    console.warn("[fcm] Firebase not initialized — skip send");
    return { sent: false, reason: "firebase_not_configured" };
  }

  const admin = getAdmin();
  const stringData = {};
  Object.entries(data).forEach(([key, value]) => {
    stringData[key] = value == null ? "" : String(value);
  });

  try {
    const messageId = await admin.messaging().send({
      token: fcmToken,
      notification: title || body ? { title: title || "", body: body || "" } : undefined,
      data: stringData,
      android: {
        priority: "high",
        notification: {
          channelId: "order_updates",
          priority: "high",
        },
      },
    });
    return { sent: true, messageId };
  } catch (error) {
    const code = error?.code || error?.errorInfo?.code;
    if (
      code === "messaging/registration-token-not-registered" ||
      code === "messaging/invalid-registration-token"
    ) {
      return { sent: false, reason: "invalid_token", code };
    }
    throw error;
  }
}

async function sendPushToUser(userId, payload) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true },
  });

  if (!user?.fcmToken) {
    return { sent: false, reason: "no_fcm_token" };
  }

  const result = await sendPushToToken(user.fcmToken, payload);

  if (result.reason === "invalid_token") {
    await prisma.user.update({
      where: { id: userId },
      data: { fcmToken: null },
    });
  }

  return result;
}

module.exports = {
  sendPushToToken,
  sendPushToUser,
};
