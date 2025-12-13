/**
 * Chat Controller
 * Handles AI-powered live chat requests
 * @route   /api/chat
 * @access  Private (requires authentication)
 */

import { isAIConfigured, listAIFiles, uploadTextFile } from '../utils/aiService.js';
import ChatHistory from '../models/ChatHistory.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import AI API configuration
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL_ID = process.env.AI_MODEL_ID || 'gemini-2.5-flash';
const AI_API_BASE_URL =
  process.env.AI_API_BASE_URL ||
  'https://generativelanguage.googleapis.com/v1beta/models';
const AI_API_URL = `${AI_API_BASE_URL}/${AI_MODEL_ID}:generateContent`;

/**
 * Get or upload user guide file for chat context
 * @returns {Promise<{uri: string, mimeType: string} | null>}
 */
const getOrUploadUserGuide = async () => {
  try {
    // Check if user_guide file already exists
    const files = await listAIFiles();
    const existingFile = files.find((f) => f.displayName === 'user_guide');

    if (existingFile) {
      console.log('[Chat] Using existing user_guide file:', existingFile.name);
      return {
        uri: existingFile.uri,
        mimeType: existingFile.mimeType,
      };
    }

    // File doesn't exist, upload it
    console.log('[Chat] user_guide not found, uploading...');
    const userGuidePath = path.join(__dirname, '../../docs/user_guide.md');
    const userGuideContent = await fs.readFile(userGuidePath, 'utf-8');

    const uploadedFile = await uploadTextFile(
      userGuideContent,
      'user_guide',
      'text/plain'
    );

    if (uploadedFile) {
      console.log('[Chat] user_guide uploaded successfully:', uploadedFile.name);
      return {
        uri: uploadedFile.uri,
        mimeType: uploadedFile.mimeType,
      };
    }

    console.warn('[Chat] Failed to upload user_guide');
    return null;
  } catch (error) {
    console.error('[Chat] Error getting/uploading user guide:', error);
    return null;
  }
};


/**
 * Call Gemini AI for chat responses
 * @param {string} userMessage - User's message
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} - AI response
 */
const getChatResponse = async (userMessage, conversationHistory = []) => {
  if (!AI_API_KEY || AI_API_KEY === 'your_api_key_here') {
    throw new Error(
      'AI API key is not configured. Please add AI_API_KEY to your .env file.'
    );
  }

  try {
    // Get user guide file for context
    const userGuideFile = await getOrUploadUserGuide();

    // Smart Context: Use only last 20 messages for AI (even if we store more)
    // This keeps responses fast and reduces API costs
    const recentHistory = conversationHistory.slice(-20);

    // Build context-aware prompt
    const systemPrompt = `You are the AgriLink AI Assistant, a helpful and friendly support agent for AgriLink - an online marketplace connecting farmers directly with customers for fresh, local agricultural products.

Your role:
- Help users understand how AgriLink works
- Answer questions about buying products, placing orders, and payment methods
- Provide information about farmers, products, and the platform
- Be warm, professional, and concise
- Keep responses brief (2-4 sentences unless asked for more detail)
- Use a friendly, conversational tone
${userGuideFile ? '\n- Use the provided user guide document to answer questions accurately' : ''}

Remember: Be helpful, accurate, and enthusiastic about connecting people with fresh, local food!`;

    // Build conversation history
    const contents = [
      {
        role: 'user',
        parts: [
          { text: systemPrompt },
          // Add user guide file if available
          ...(userGuideFile ? [{ fileData: { fileUri: userGuideFile.uri, mimeType: userGuideFile.mimeType } }] : [])
        ],
      },
      {
        role: 'model',
        parts: [
          {
            text: "Hello! I'm the AgriLink AI Assistant. I'm here to help you with any questions about our platform, products, or how to connect with local farmers. How can I assist you today?",
          },
        ],
      },
    ];

    // Add recent conversation history (last 20 messages)
    recentHistory.forEach((msg) => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    });

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const response = await fetch(`${AI_API_URL}?key=${AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7, // Reduced for more accurate answers
          maxOutputTokens: 500,
          topP: 0.9,
          topK: 40,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `AI request failed: ${response.status}`
      );
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response generated from AI');
    }

    return generatedText.trim();
  } catch (error) {
    console.error('Chat AI Error:', error);
    throw error;
  }
};

/**
 * @desc    Send chat message and get AI response
 * @route   POST /api/chat/message
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    // Validate AI configuration
    if (!isAIConfigured()) {
      return res.status(503).json({
        message:
          'Chat service is not available. Please contact support.',
      });
    }

    const { message } = req.body;
    const userId = req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Get or create chat history for this user
    let chatHistory = await ChatHistory.findOne({ userId });
    
    if (!chatHistory) {
      chatHistory = new ChatHistory({
        userId,
        messages: [],
      });
    }

    // Build conversation history from messages (already limited to 20)
    const conversationHistory = chatHistory.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Get AI response
    const aiResponse = await getChatResponse(message, conversationHistory);

    // Save user message
    chatHistory.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Save AI response
    chatHistory.messages.push({
      role: 'ai',
      content: aiResponse,
      timestamp: new Date(),
    });

    // Update timestamp
    chatHistory.lastMessageAt = new Date();

    await chatHistory.save();

    res.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to process chat message',
      success: false,
      message: 'Failed to process chat message',
      success: false,
    });
  }
};

/**
 * @desc    Get chat history for current user
 * @route   GET /api/chat/history
 * @access  Private
 */
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const chatHistory = await ChatHistory.findOne({ userId });

    if (!chatHistory) {
      return res.json({
        success: true,
        messages: [],
      });
    }

    res.json({
      success: true,
      messages: chatHistory.messages,
    });
  } catch (error) {
    console.error('Get Chat History Error:', error);
    res.status(500).json({
      message: 'Failed to retrieve chat history',
      success: false,
    });
  }
};


/**
 * @desc    Start a new conversation (deletes old messages)
 * @route   POST /api/chat/new-conversation
 * @access  Private
 */
export const startNewConversation = async (req, res) => {
  try {
    const userId = req.user._id;

    let chatHistory = await ChatHistory.findOne({ userId });

    if (!chatHistory) {
      chatHistory = new ChatHistory({
        userId,
        messages: [],
      });
    }

    // Delete all existing messages - fresh start
    chatHistory.messages = [];
    chatHistory.lastMessageAt = new Date();
    
    await chatHistory.save();

    res.json({
      success: true,
      message: 'New conversation started - previous messages deleted',
    });
  } catch (error) {
    console.error('Start New Conversation Error:', error);
    res.status(500).json({
      message: 'Failed to start new conversation',
      success: false,
    });
  }
};

/**
 * @desc    Clear chat history for current user (all conversations)
 * @route   DELETE /api/chat/history
 * @access  Private
 */
export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    await ChatHistory.findOneAndDelete({ userId });

    res.json({
      success: true,
      message: 'Chat history cleared successfully',
    });
  } catch (error) {
    console.error('Clear Chat History Error:', error);
    res.status(500).json({
      message: 'Failed to clear chat history',
      success: false,
    });
  }
};
