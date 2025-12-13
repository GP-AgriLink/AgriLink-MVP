import ChatHistory from "../models/ChatHistory.js";

/**
 * Cleanup job to remove messages older than 30 days
 * Run this daily via cron job or task scheduler
 */
export const cleanupOldChatMessages = async () => {
  try {
    const result = await ChatHistory.cleanupOldMessages();
    return result;
  } catch (error) {
    console.error("[ChatHistory Cleanup] Error during cleanup:", error);
    throw error;
  }
};

/**
 * Optional: Schedule automatic cleanup
 * Uncomment and use if you want automatic daily cleanup
 * Requires 'node-cron' package: npm install node-cron
 */
/*
import cron from 'node-cron';

// Run cleanup daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  await cleanupOldChatMessages();
});
*/

export default cleanupOldChatMessages;
