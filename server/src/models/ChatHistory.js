import mongoose from "mongoose";

/**
 * ChatHistory Schema
 * Keeps all messages, auto-deletes messages older than 30 days
 */
const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One chat history per user
      index: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "ai"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
          index: true, // Index for efficient date-based queries
        },
      },
    ],
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Auto-cleanup messages older than 30 days
 * Called before saving to keep database clean
 */
chatHistorySchema.pre("save", function (next) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Filter out messages older than 30 days
  this.messages = this.messages.filter((msg) => msg.timestamp >= thirtyDaysAgo);

  next();
});

/**
 * Static method to cleanup old messages across all users
 * Call this periodically (e.g., daily cron job)
 */
chatHistorySchema.statics.cleanupOldMessages = async function () {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await this.updateMany(
    {},
    {
      $pull: {
        messages: {
          timestamp: { $lt: thirtyDaysAgo },
        },
      },
    }
  );
  return result;
};

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

export default ChatHistory;
