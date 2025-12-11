/**
 * Chat Routes
 * Routes for AI-powered live chat
 */

import express from 'express';
import { 
  sendMessage, 
  getChatHistory, 
  clearChatHistory,
  startNewConversation
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/chat/message
 * @desc    Send chat message and get AI response
 * @access  Private
 */
router.post('/message', protect, sendMessage);

/**
 * @route   GET /api/chat/history
 * @desc    Get chat history for current user
 * @access  Private
 */
router.get('/history', protect, getChatHistory);

/**
 * @route   POST /api/chat/new-conversation
 * @desc    Start a new conversation (deletes old messages)
 * @access  Private
 */
router.post('/new-conversation', protect, startNewConversation);

/**
 * @route   DELETE /api/chat/history
 * @desc    Clear chat history for current user
 * @access  Private
 */
router.delete('/history', protect, clearChatHistory);

export default router;
