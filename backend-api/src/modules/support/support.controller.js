const {
  getSupportChatHistory,
  processSupportQuery,
} = require("./support.service");

async function supportChatHistory(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const limit = Number(req.query.limit) || 50;
    const data = await getSupportChatHistory(userId, limit);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[support] supportChatHistory failed:", error);

    return res.status(500).json({
      success: false,
      message: "Could not load chat history",
    });
  }
}

async function supportChat(req, res) {
  try {
    const { message, responseKey } = req.body || {};
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!message && !responseKey) {
      return res.status(400).json({
        success: false,
        message: "message or responseKey is required",
      });
    }

    const result = await processSupportQuery(
      userId,
      message || responseKey,
      responseKey,
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("[support] supportChat failed:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

module.exports = {
  supportChat,
  supportChatHistory,
};
