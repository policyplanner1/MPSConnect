const { Router } = require("express");
const { protect } = require("../auth/auth.middleware");
const {
  supportChat,
  supportChatHistory,
} = require("./support.controller");

const router = Router();

router.get("/history", protect, supportChatHistory);
router.post("/chat", protect, supportChat);

module.exports = router;
