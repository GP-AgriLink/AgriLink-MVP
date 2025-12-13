import apiClient, { API_ENDPOINTS } from "../config/api";

/**
 * Get chat history for current user
 * @returns {Promise<Array>} Array of messages
 */
export const getChatHistory = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.chat.history);
    return response.data.messages || [];
  } catch (error) {
    console.error("Get chat history error:", error);
    throw error;
  }
};

/**
 * Clear chat history for current user
 * @returns {Promise<void>}
 */
export const clearChatHistory = async () => {
  try {
    const response = await apiClient.delete(API_ENDPOINTS.chat.history);
    return response.data;
  } catch (error) {
    console.error("Clear chat history error:", error);
    throw error;
  }
};

/**
 * Send a chat message and get AI response
 * @param {string} message - The user's message
 * @returns {Promise<Object>} Response containing AI message and timestamp
 */
export const sendChatMessage = async (message) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.chat.message, {
      message,
    });
    return response.data;
  } catch (error) {
    console.error("Chat service error:", error);
    throw error;
  }
};

/**
 * Start a new conversation (archives current active one)
 * @returns {Promise<Object>}
 */
export const startNewConversation = async () => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.chat.newConversation);
    return response.data;
  } catch (error) {
    console.error("Start new conversation error:", error);
    throw error;
  }
};

/**
 * Get all conversations for current user
 * @returns {Promise<Array>}
 */
export const getConversations = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.chat.conversations);
    return response.data.conversations || [];
  } catch (error) {
    console.error("Get conversations error:", error);
    throw error;
  }
};
