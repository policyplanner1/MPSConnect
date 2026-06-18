const prisma = require("../../config/prisma");
const { detectIntent } = require("./intent.service");
const { buildSupportResponse } = require("./response.service");

async function processSupportQuery(userId, message, responseKey) {
  const intent = detectIntent(message, responseKey);
  const result = await buildSupportResponse({
    userId,
    message,
    intent,
  });

  const botResponse = [result.answerPrimary, result.answerSecondary]
    .filter(Boolean)
    .join("\n\n");

  await prisma.supportChatHistory.create({
    data: {
      userId: String(userId),
      message: String(message || "").trim() || result.prompt,
      botResponse,
      intent,
    },
  });

  return result;
}

async function getSupportChatHistory(userId, limit = 50) {
  const rows = await prisma.supportChatHistory.findMany({
    where: { userId: String(userId) },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(limit, 1), 100),
    select: {
      id: true,
      message: true,
      botResponse: true,
      intent: true,
      createdAt: true,
    },
  });

  return rows.map((row) => ({
    id: String(row.id),
    message: row.message,
    botResponse: row.botResponse,
    intent: row.intent,
    createdAt: row.createdAt,
  }));
}

module.exports = {
  processSupportQuery,
  getSupportChatHistory,
};
