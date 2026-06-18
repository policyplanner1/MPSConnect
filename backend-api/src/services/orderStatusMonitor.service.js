const prisma = require("../config/prisma");
const { fetchMyOrdersForCrmUser } = require("./crmOrders.service");
const { sendPushToUser } = require("./fcm.service");
const {
  MAX_STATUS_NOTIFICATIONS_PER_DAY,
  todayKey,
  toStatusKey,
  statusNotificationCopy,
  defaultNotifyState,
  parseNotifyState,
} = require("./orderStatusNotify.utils");

let pollRunning = false;

async function processUserOrderStatuses(user) {
  if (!user.crmUserId || !user.fcmToken) {
    return { skipped: true, reason: "missing_crm_or_fcm" };
  }

  let orders;
  try {
    orders = await fetchMyOrdersForCrmUser(user.crmUserId);
  } catch (error) {
    console.error(
      `[orderStatusMonitor] CRM fetch failed user=${user.id} crmUserId=${user.crmUserId}`,
      error?.message || error,
    );
    return { skipped: true, reason: "crm_fetch_failed" };
  }

  if (!orders.length) {
    return { skipped: true, reason: "no_orders" };
  }

  const state = parseNotifyState(user.orderNotifyState);
  const day = todayKey();
  let sentCount = 0;

  if (!state.seeded) {
    const seedStatuses = {};
    orders.forEach((order) => {
      const id = String(order.parent_order_id || "");
      if (id) {
        seedStatuses[id] = toStatusKey(order.status);
      }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        orderNotifyState: {
          seeded: true,
          statuses: seedStatuses,
          limits: state.limits,
        },
      },
    });
    return { seeded: true, sentCount: 0 };
  }

  const nextStatuses = { ...state.statuses };
  const nextLimits = { ...state.limits };

  for (const order of orders) {
    const id = String(order.parent_order_id || "");
    if (!id) {
      continue;
    }

    const nextStatus = toStatusKey(order.status);
    const prevStatus = state.statuses[id];
    nextStatuses[id] = nextStatus;

    if (!prevStatus || prevStatus === nextStatus) {
      continue;
    }

    const limitState = nextLimits[id];
    const current =
      limitState && limitState.day === day
        ? limitState
        : { day, count: 0 };

    if (current.count >= MAX_STATUS_NOTIFICATIONS_PER_DAY) {
      nextLimits[id] = current;
      continue;
    }

    const copy = statusNotificationCopy(order.status);
    if (!copy) {
      continue;
    }

    const pushResult = await sendPushToUser(user.id, {
      title: copy.title,
      body: copy.body,
      data: {
        type: "order_status",
        parent_order_id: id,
        status: String(order.status ?? ""),
      },
    });

    if (pushResult.sent) {
      sentCount += 1;
      nextLimits[id] = { day, count: current.count + 1 };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      orderNotifyState: {
        seeded: true,
        statuses: nextStatuses,
        limits: nextLimits,
      },
    },
  });

  return { seeded: false, sentCount };
}

async function pollAllUsersOrderStatuses() {
  if (pollRunning) {
    return { skipped: true, reason: "already_running" };
  }

  pollRunning = true;
  try {
    const users = await prisma.user.findMany({
      where: {
        fcmToken: { not: null },
        crmUserId: { not: null },
        isActive: true,
      },
      select: {
        id: true,
        fcmToken: true,
        crmUserId: true,
        orderNotifyState: true,
      },
    });

    let totalSent = 0;
    for (const user of users) {
      const result = await processUserOrderStatuses(user);
      if (result.sentCount) {
        totalSent += result.sentCount;
      }
    }

    if (users.length > 0) {
      console.log(
        `[orderStatusMonitor] polled ${users.length} user(s), sent ${totalSent} notification(s)`,
      );
    }

    return { users: users.length, totalSent };
  } finally {
    pollRunning = false;
  }
}

function startOrderStatusPolling() {
  const enabled = process.env.ENABLE_ORDER_STATUS_POLL !== "false";
  if (!enabled) {
    console.log("[orderStatusMonitor] Polling disabled (ENABLE_ORDER_STATUS_POLL=false)");
    return;
  }

  const intervalMs = Number(process.env.ORDER_STATUS_POLL_INTERVAL_MS) || 600_000;

  setTimeout(() => {
    pollAllUsersOrderStatuses().catch((err) => {
      console.error("[orderStatusMonitor] initial poll failed", err);
    });
  }, 15_000);

  setInterval(() => {
    pollAllUsersOrderStatuses().catch((err) => {
      console.error("[orderStatusMonitor] poll failed", err);
    });
  }, intervalMs);

  console.log(
    `[orderStatusMonitor] Started — interval ${Math.round(intervalMs / 1000)}s`,
  );
}

module.exports = {
  processUserOrderStatuses,
  pollAllUsersOrderStatuses,
  startOrderStatusPolling,
};
