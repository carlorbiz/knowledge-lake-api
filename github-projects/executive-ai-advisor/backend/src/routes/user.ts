import { Router } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { DatabaseService } from '../services/database.js';
import { z } from 'zod';

const router = Router();

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  currencyPreference: z.string().length(3).optional(),
});

const updateContextSchema = z.object({
  roleDescription: z.string().max(1000).optional(),
  priorities: z.string().max(1000).optional(),
  interests: z.array(z.string()).optional(),
  painPoints: z.array(z.string()).optional(),
  aiExperienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

// GET /api/user/profile - Get user profile
router.get('/profile', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;

    const profile = await DatabaseService.getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({ profile });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PATCH /api/user/profile - Update user profile
router.patch('/profile', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const updates = updateProfileSchema.parse(req.body);

    const success = await DatabaseService.updateUserProfile(userId, updates);

    if (!success) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json({ success: true });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/user/context - Get user context
router.get('/context', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;

    const context = await DatabaseService.getUserContext(userId);

    res.json({ context });

  } catch (error) {
    console.error('Error fetching user context:', error);
    res.status(500).json({ error: 'Failed to fetch user context' });
  }
});

// POST /api/user/context - Update user context
router.post('/context', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const context = updateContextSchema.parse(req.body);

    const success = await DatabaseService.updateUserContext(userId, context);

    if (!success) {
      return res.status(500).json({ error: 'Failed to update context' });
    }

    res.json({ success: true });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    console.error('Error updating context:', error);
    res.status(500).json({ error: 'Failed to update context' });
  }
});

// GET /api/user/stats - Get user statistics
router.get('/stats', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;

    const stats = await DatabaseService.getUserStats(userId);

    if (!stats) {
      return res.status(404).json({ error: 'Stats not found' });
    }

    res.json({ stats });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

export default router;
