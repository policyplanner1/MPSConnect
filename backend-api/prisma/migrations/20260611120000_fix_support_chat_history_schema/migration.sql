-- Align support_chat_history with Prisma model (user id is JWT string cuid, not bigint)
ALTER TABLE `support_chat_history`
  MODIFY `user_id` VARCHAR(191) NOT NULL;

ALTER TABLE `support_chat_history`
  ADD COLUMN `intent` VARCHAR(50) NULL AFTER `bot_response`;
