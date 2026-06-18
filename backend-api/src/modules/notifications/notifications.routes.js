const express = require("express");

const router = express.Router();

const { protect } = require("../auth/auth.middleware");
const {
  saveFcmToken,
  saveCrmUserId,
  checkMyOrdersNow,
  testPush,
  crmOrderStatusWebhook,
  pollAllOrdersAdmin,
} = require("./notifications.controller");

/** Reward Planners CRM → real-time push (shared secret, no user JWT) */
router.post("/crm-order-status", crmOrderStatusWebhook);

router.post("/fcm-token", protect, saveFcmToken);
router.post("/crm-user-id", protect, saveCrmUserId);
router.post("/check-orders", protect, checkMyOrdersNow);
router.post("/test-push", protect, testPush);

/** Manual trigger for all users (dev / cron substitute) */
router.post("/poll-orders", protect, pollAllOrdersAdmin);

module.exports = router;
