import { Router } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { DatabaseService } from '../services/database.js';
import { generateChatResponse } from '../services/gemini.js';
import { z } from 'zod';

const router = Router();

// Validation schemas
const sendMessageSchema = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().min(1).max(5000),
});

const updateTitleSchema = z.object({
  title: z.string().min(1).max(500),
});

// POST /api/chat/send - Send a message and get AI response
router.post('/send', async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId, message } = sendMessageSchema.parse(req.body);
    const userId = req.userId!;

    // Get user profile for personalization
    const userProfile = await DatabaseService.getUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Get or create session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = await DatabaseService.createChatSession(userId);
      if (!currentSessionId) {
        return res.status(500).json({ error: 'Failed to create chat session' });
      }
    }

    // Get session history
    const session = await DatabaseService.getChatSession(currentSessionId);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Save user message
    await DatabaseService.createMessage(currentSessionId, {
      role: 'user',
      content: message,
    });

    // Get user context for personalization
    const userContext = await DatabaseService.getUserContext(userId);

    // Generate AI response
    const aiResponse = await generateChatResponse({
      messages: [
        ...session.messages,
        { role: 'user', content: message }
      ],
      userName: userProfile.name || undefined,
      currency: userProfile.currencyPreference,
      userContext: userContext || undefined,
      subscriptionTier: userProfile.subscriptionTier,
    });

    // Save AI response
    await DatabaseService.createMessage(currentSessionId, {
      role: 'model',
      content: aiResponse.text,
      sources: aiResponse.sources,
      suggestedPrompts: aiResponse.suggestedPrompts,
      modelUsed: aiResponse.modelUsed,
      tokensUsed: aiResponse.tokensUsed,
      responseTimeMs: aiResponse.responseTimeMs,
    });

    // Update session title if this is the first user message
    if (session.messages.filter(m => m.role === 'user').length === 0) {
      const title = message.length > 50 ? message.substring(0, 47) + '...' : message;
      await DatabaseService.updateChatSessionTitle(currentSessionId, title);
    }

    // Track analytics
    await DatabaseService.trackEvent(userId, {
      eventType: 'message_sent',
      eventData: {
        sessionId: currentSessionId,
        messageLength: message.length,
        modelUsed: aiResponse.modelUsed,
        tokensUsed: aiResponse.tokensUsed,
        responseTimeMs: aiResponse.responseTimeMs,
      },
      sessionId: currentSessionId,
    });

    res.json({
      sessionId: currentSessionId,
      message: {
        role: 'model',
        content: aiResponse.text,
        sources: aiResponse.sources,
        suggestedPrompts: aiResponse.suggestedPrompts,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/chat/sessions - Get user's chat sessions
router.get('/sessions', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 10;

    const sessions = await DatabaseService.getChatSessions(userId, limit);

    res.json({ sessions });

  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /api/chat/sessions/:sessionId - Get specific session with messages
router.get('/sessions/:sessionId', async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;

    const session = await DatabaseService.getChatSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });

  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// PATCH /api/chat/sessions/:sessionId - Update session title
router.patch('/sessions/:sessionId', async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = updateTitleSchema.parse(req.body);

    const success = await DatabaseService.updateChatSessionTitle(sessionId, title);

    if (!success) {
      return res.status(500).json({ error: 'Failed to update session title' });
    }

    res.json({ success: true });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// DELETE /api/chat/sessions/:sessionId - Delete a session
router.delete('/sessions/:sessionId', async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;

    const success = await DatabaseService.deleteChatSession(sessionId);

    if (!success) {
      return res.status(500).json({ error: 'Failed to delete session' });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// POST /api/chat/new - Create a new chat session
router.post('/new', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;

    const sessionId = await DatabaseService.createChatSession(userId, 'New Conversation');

    if (!sessionId) {
      return res.status(500).json({ error: 'Failed to create session' });
    }

    res.json({ sessionId });

  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

export default router;
