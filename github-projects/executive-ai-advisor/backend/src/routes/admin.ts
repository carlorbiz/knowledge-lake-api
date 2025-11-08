import { Router } from 'express';
import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Simple admin authentication - replace with proper auth in production
const adminAuth = (req: Request, res: Response, next: any) => {
  const adminKey = req.headers['x-admin-key'];

  if (adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

// Apply admin auth to all routes
router.use(adminAuth);

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const timeRange = (req.query.range as string) || '7d'; // 7d, 30d, 90d, all

    // Calculate date filter
    let dateFilter = new Date();
    if (timeRange === '7d') {
      dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (timeRange === '30d') {
      dateFilter.setDate(dateFilter.getDate() - 30);
    } else if (timeRange === '90d') {
      dateFilter.setDate(dateFilter.getDate() - 90);
    } else {
      dateFilter = new Date('2000-01-01'); // All time
    }

    // Total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Active users (in time range)
    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_active_at', dateFilter.toISOString());

    // New users (in time range)
    const { count: newUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateFilter.toISOString());

    // Total sessions
    const { count: totalSessions } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true });

    // Sessions in time range
    const { count: recentSessions } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateFilter.toISOString());

    // Total messages
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    // Messages in time range
    const { count: recentMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateFilter.toISOString());

    // User messages vs AI messages
    const { count: userMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user')
      .gte('created_at', dateFilter.toISOString());

    // Token usage
    const { data: tokenData } = await supabase
      .from('messages')
      .select('tokens_used')
      .gte('created_at', dateFilter.toISOString())
      .not('tokens_used', 'is', null);

    const totalTokens = tokenData?.reduce((sum, row) => sum + (row.tokens_used || 0), 0) || 0;

    // Average response time
    const { data: responseTimeData } = await supabase
      .from('messages')
      .select('response_time_ms')
      .eq('role', 'model')
      .gte('created_at', dateFilter.toISOString())
      .not('response_time_ms', 'is', null);

    const avgResponseTime = responseTimeData && responseTimeData.length > 0
      ? responseTimeData.reduce((sum, row) => sum + (row.response_time_ms || 0), 0) / responseTimeData.length
      : 0;

    // Model usage breakdown
    const { data: modelUsageData } = await supabase
      .from('messages')
      .select('model_used')
      .gte('created_at', dateFilter.toISOString())
      .not('model_used', 'is', null);

    const modelUsage: Record<string, number> = {};
    modelUsageData?.forEach(row => {
      const model = row.model_used || 'unknown';
      modelUsage[model] = (modelUsage[model] || 0) + 1;
    });

    // Subscription tier breakdown
    const { data: subscriptionData } = await supabase
      .from('users')
      .select('subscription_tier');

    const subscriptionBreakdown: Record<string, number> = {};
    subscriptionData?.forEach(row => {
      const tier = row.subscription_tier || 'basic';
      subscriptionBreakdown[tier] = (subscriptionBreakdown[tier] || 0) + 1;
    });

    res.json({
      timeRange,
      overview: {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        newUsers: newUsers || 0,
        totalSessions: totalSessions || 0,
        recentSessions: recentSessions || 0,
        totalMessages: totalMessages || 0,
        recentMessages: recentMessages || 0,
        userMessages: userMessages || 0,
        totalTokens,
        avgResponseTimeMs: Math.round(avgResponseTime),
      },
      modelUsage,
      subscriptionBreakdown,
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/admin/users - List users with pagination
router.get('/users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('users')
      .select('id, email, name, subscription_tier, subscription_status, created_at, last_active_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      users: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/admin/users/:userId - Get detailed user stats
router.get('/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Get session count
    const { count: sessionCount } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get message count
    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('user_id', userId);

    const sessionIds = sessions?.map(s => s.id) || [];

    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('session_id', sessionIds);

    // Get token usage
    const { data: tokenData } = await supabase
      .from('messages')
      .select('tokens_used')
      .in('session_id', sessionIds)
      .not('tokens_used', 'is', null);

    const totalTokens = tokenData?.reduce((sum, row) => sum + (row.tokens_used || 0), 0) || 0;

    // Get recent activity
    const { data: recentSessions } = await supabase
      .from('chat_sessions')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(5);

    res.json({
      user,
      stats: {
        totalSessions: sessionCount || 0,
        totalMessages: messageCount || 0,
        totalTokens,
      },
      recentSessions,
    });

  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// GET /api/admin/analytics/trends - Get trends over time
router.get('/analytics/trends', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily message counts
    const { data: messageData, error } = await supabase
      .from('messages')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    // Group by date
    const dailyCounts: Record<string, number> = {};
    messageData?.forEach(msg => {
      const date = new Date(msg.created_at).toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    // Convert to array format
    const trends = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json({ trends });

  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// GET /api/admin/analytics/popular-queries - Get most common queries
router.get('/analytics/popular-queries', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const { data, error } = await supabase
      .from('messages')
      .select('content')
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(100); // Sample recent 100 queries

    if (error) throw error;

    // Simple analysis - in production you'd want more sophisticated NLP
    const queries = data?.map(m => m.content.substring(0, 100)) || [];

    res.json({ queries: queries.slice(0, limit) });

  } catch (error) {
    console.error('Error fetching popular queries:', error);
    res.status(500).json({ error: 'Failed to fetch popular queries' });
  }
});

// POST /api/admin/users/:userId/subscription - Update user subscription
router.post('/users/:userId/subscription', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { tier, status } = req.body;

    const { error } = await supabase
      .from('users')
      .update({
        subscription_tier: tier,
        subscription_status: status,
      })
      .eq('id', userId);

    if (error) throw error;

    res.json({ success: true });

  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

export default router;
