const prisma = require("../../config/prisma");
const { isFirebaseReady } = require("../../config/firebase");
const { sendPushToUser } = require("../../services/fcm.service");
const {
  pollAllUsersOrderStatuses,
  processUserOrderStatuses,
} = require("../../services/orderStatusMonitor.service");
const {
  processCrmOrderStatusEvent,
} = require("../../services/orderStatusPush.service");

function getPlatform(raw) {
  const p = String(raw || "").toLowerCase();
  if (p === "android" || p === "ios") {
    return p;
  }
  return "unknown";
}

function parseCrmUserId(raw) {
  if (raw == null || raw === "") {
    return null;
  }
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) {
    return null;
  }
  return n;
}

const saveFcmToken = async (req, res) => {
  try {
    const token = String(req.body?.token || "").trim();
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "token is required",
      });
    }

    const platform = getPlatform(req.body?.platform);
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const crmUserId = parseCrmUserId(
      req.body?.crm_user_id ?? req.body?.crmUserId,
    );

    const data = { fcmToken: token };
    if (crmUserId != null) {
      data.crmUserId = crmUserId;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { crmUserId: true, fcmToken: true },
    });

    if (!updated.crmUserId) {
      console.warn(
        `[notifications] user ${userId} has FCM token but no crmUserId — order push polling will skip this user until crm_user_id is sent`,
      );
    }

    return res.json({
      success: true,
      message: "FCM token saved",
      data: {
        platform,
        crmUserId: updated.crmUserId ?? undefined,
        pushEnabled: isFirebaseReady(),
      },
    });
  } catch (error) {
    console.error("[notifications/saveFcmToken]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save FCM token",
    });
  }
};

const saveCrmUserId = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const crmUserId = parseCrmUserId(
      req.body?.crm_user_id ?? req.body?.crmUserId,
    );
    if (crmUserId == null) {
      return res.status(400).json({
        success: false,
        message: "crm_user_id must be a positive integer",
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { crmUserId },
    });

    return res.json({
      success: true,
      message: "CRM user id saved",
      data: { crmUserId },
    });
  } catch (error) {
    console.error("[notifications/saveCrmUserId]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save CRM user id",
    });
  }
};

const checkMyOrdersNow = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fcmToken: true,
        crmUserId: true,
        orderNotifyState: true,
      },
    });

    if (!user?.crmUserId) {
      return res.status(400).json({
        success: false,
        message:
          "CRM user id not linked. Send crm_user_id with POST /notifications/fcm-token or POST /notifications/crm-user-id",
      });
    }

    if (!user.fcmToken) {
      return res.status(400).json({
        success: false,
        message: "FCM token not registered",
      });
    }

    const result = await processUserOrderStatuses(user);
    return res.json({
      success: true,
      message: "Order status check completed",
      data: result,
    });
  } catch (error) {
    console.error("[notifications/checkMyOrdersNow]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check orders",
    });
  }
};

const testPush = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!isFirebaseReady()) {
      return res.status(503).json({
        success: false,
        message:
          "Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH in backend .env",
      });
    }

    const title = String(req.body?.title || "MPS Connect").trim();
    const body = String(
      req.body?.body || "Test push from backend",
    ).trim();

    const result = await sendPushToUser(userId, {
      title,
      body,
      data: {
        type: "test",
        parent_order_id: String(req.body?.parent_order_id || ""),
      },
    });

    if (!result.sent) {
      return res.status(400).json({
        success: false,
        message: `Push not sent: ${result.reason || "unknown"}`,
        data: result,
      });
    }

    return res.json({
      success: true,
      message: "Test push sent",
      data: result,
    });
  } catch (error) {
    console.error("[notifications/testPush]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send test push",
    });
  }
};

/**
 * Called by Reward Planners CRM when order status changes (real-time push).
 * Secured with CRM_WEBHOOK_SECRET — not end-user JWT.
 */
const crmOrderStatusWebhook = async (req, res) => {
  try {
    const expectedSecret = String(process.env.CRM_WEBHOOK_SECRET || "").trim();
    if (!expectedSecret) {
      return res.status(503).json({
        success: false,
        message:
          "Webhook not configured on app server (CRM_WEBHOOK_SECRET missing)",
      });
    }

    const providedSecret =
      req.headers["x-crm-webhook-secret"] ||
      req.headers["x-webhook-secret"] ||
      req.body?.secret;

    if (String(providedSecret || "") !== expectedSecret) {
      return res.status(401).json({
        success: false,
        message: "Invalid webhook secret",
      });
    }

    const crmUserId = parseCrmUserId(
      req.body?.user_id ?? req.body?.userId ?? req.body?.crm_user_id,
    );
    const parentOrderId =
      req.body?.parent_order_id ?? req.body?.parentOrderId ?? req.body?.order_id;
    const status = req.body?.status ?? req.body?.order_status;

    if (crmUserId == null) {
      return res.status(400).json({
        success: false,
        message: "user_id (CRM integer) is required",
      });
    }
    if (!parentOrderId) {
      return res.status(400).json({
        success: false,
        message: "parent_order_id is required",
      });
    }
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required",
      });
    }

    const result = await processCrmOrderStatusEvent(
      crmUserId,
      parentOrderId,
      status,
    );

    return res.json({
      success: true,
      message: "Webhook processed",
      data: result,
    });
  } catch (error) {
    console.error("[notifications/crmOrderStatusWebhook]", error);
    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

const pollAllOrdersAdmin = async (req, res) => {
  try {
    const result = await pollAllUsersOrderStatuses();
    return res.json({
      success: true,
      message: "Poll completed",
      data: result,
    });
  } catch (error) {
    console.error("[notifications/pollAllOrdersAdmin]", error);
    return res.status(500).json({
      success: false,
      message: "Poll failed",
    });
  }
};

module.exports = {
  saveFcmToken,
  saveCrmUserId,
  checkMyOrdersNow,
  testPush,
  crmOrderStatusWebhook,
  pollAllOrdersAdmin,
};
