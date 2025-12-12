/**
 * Chat Service
 * Handles API calls for live chat functionality
 */

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

/**
 * Get API base URL
 * @returns {string} API base URL
 */
const getApiUrl = () => {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured');
  }
  return API_BASE_URL;
};

/**
 * Get chat history for current user
 * @returns {Promise<Array>} Array of messages
 */
export const getChatHistory = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${getApiUrl()}/api/chat/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to load chat history');
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error('Get chat history error:', error);
    throw error;
  }
};

/**
 * Clear chat history for current user
 * @returns {Promise<void>}
 */
export const clearChatHistory = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${getApiUrl()}/api/chat/history`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to clear chat history');
    }

    return await response.json();
  } catch (error) {
    console.error('Clear chat history error:', error);
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
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Please log in to use chat');
    }

    const response = await fetch(`${getApiUrl()}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send message');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Chat service error:', error);
    throw error;
  }
};

/**
 * Start a new conversation (archives current active one)
 * @returns {Promise<Object>}
 */
export const startNewConversation = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${getApiUrl()}/api/chat/new-conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to start new conversation');
    }

    return await response.json();
  } catch (error) {
    console.error('Start new conversation error:', error);
    throw error;
  }
};

/**
 * Get all conversations for current user
 * @returns {Promise<Array>}
 */
export const getConversations = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${getApiUrl()}/api/chat/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get conversations');
    }

    const data = await response.json();
    return data.conversations || [];
  } catch (error) {
    console.error('Get conversations error:', error);
    throw error;
  }
};
