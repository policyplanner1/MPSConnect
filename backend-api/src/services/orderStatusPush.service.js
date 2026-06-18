const prisma = require("../config/prisma");
const { sendPushToUser } = require("./fcm.service");
const {
  MAX_STATUS_NOTIFICATIONS_PER_DAY,
  todayKey,
  toStatusKey,
  statusNotificationCopy,
  parseNotifyState,
} = require("./orderStatusNotify.utils");

/**
 * Real-time path: CRM calls our webhook when an order status changes.
 * Sends FCM to every app user linked to this CRM user_id.
 */
async function processCrmOrderStatusEvent(crmUserId, parentOrderId, statusRaw) {
  const parentId = String(parentOrderId || "").trim();
  const nextStatus = toStatusKey(statusRaw);
  const day = todayKey();

  if (!parentId || !nextStatus) {
    return { sentCount: 0, reason: "invalid_payload" };
  }

  const users = await prisma.user.findMany({
    where: {
      crmUserId: Number(crmUserId),
      fcmToken: { not: null },
      isActive: true,
    },
    select: {
      id: true,
      fcmToken: true,
      crmUserId: true,
      orderNotifyState: true,
    },
  });

  if (!users.length) {
    return { sentCount: 0, reason: "no_app_users_with_fcm" };
  }

  let sentCount = 0;

  for (const user of users) {
    const state = parseNotifyState(user.orderNotifyState);
    const prevStatus = state.statuses[parentId];

    if (prevStatus === nextStatus) {
      continue;
    }

    const limitState = state.limits[parentId];
    const current =
      limitState && limitState.day === day
        ? limitState
        : { day, count: 0 };

    if (current.count >= MAX_STATUS_NOTIFICATIONS_PER_DAY) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          orderNotifyState: {
            seeded: true,
            statuses: { ...state.statuses, [parentId]: nextStatus },
            limits: { ...state.limits, [parentId]: current },
          },
        },
      });
      continue;
    }

    const copy = statusNotificationCopy(statusRaw);
    let pushed = false;

    if (copy) {
      const pushResult = await sendPushToUser(user.id, {
        title: copy.title,
        body: copy.body,
        data: {
          type: "order_status",
          parent_order_id: parentId,
          status: String(statusRaw ?? ""),
        },
      });
      pushed = Boolean(pushResult.sent);
      if (pushed) {
        sentCount += 1;
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        orderNotifyState: {
          seeded: true,
          statuses: { ...state.statuses, [parentId]: nextStatus },
          limits: {
            ...state.limits,
            [parentId]: pushed
              ? { day, count: current.count + 1 }
              : current,
          },
        },
      },
    });
  }

  return { sentCount, usersMatched: users.length };
}

module.exports = {
  processCrmOrderStatusEvent,
};
