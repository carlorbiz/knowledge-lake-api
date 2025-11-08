import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, WordPressJWTPayload } from '../types/index.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export const authenticateWordPressJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.substring(7);

    // Verify WordPress JWT token
    const decoded = jwt.verify(
      token,
      process.env.WORDPRESS_JWT_SECRET!
    ) as WordPressJWTPayload;

    const wordpressUser = decoded.data.user;

    // Set user info on request
    req.user = {
      wordpressId: wordpressUser.id,
      email: wordpressUser.email,
      name: `${wordpressUser.firstName} ${wordpressUser.lastName}`.trim() || wordpressUser.nicename,
    };

    // Ensure user exists in Supabase database
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('wordpress_user_id', wordpressUser.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is OK
      throw fetchError;
    }

    if (!existingUser) {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          wordpress_user_id: wordpressUser.id,
          email: wordpressUser.email,
          name: req.user.name,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      req.userId = newUser.id;
    } else {
      req.userId = existingUser.id;

      // Update last_active_at
      await supabase
        .from('users')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', existingUser.id);
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Try to authenticate, but don't fail if token is invalid
      await authenticateWordPressJWT(req, res, next);
    } else {
      // No token, continue without authentication
      next();
    }
  } catch (error) {
    // Log error but continue
    console.warn('Optional auth failed:', error);
    next();
  }
};
