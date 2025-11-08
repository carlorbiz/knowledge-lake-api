import { createClient } from '@supabase/supabase-js';
import { ChatSession, ChatMessage, UserProfile, AnalyticsEvent } from '../types/index.js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export class DatabaseService {
  // User operations
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return {
      id: data.id,
      wordpressUserId: data.wordpress_user_id,
      email: data.email,
      name: data.name,
      subscriptionTier: data.subscription_tier,
      subscriptionStatus: data.subscription_status,
      currencyPreference: data.currency_preference,
      createdAt: new Date(data.created_at),
      lastActiveAt: new Date(data.last_active_at),
    };
  }

  static async updateUserProfile(
    userId: string,
    updates: Partial<{
      name: string;
      currencyPreference: string;
      subscriptionTier: string;
      subscriptionStatus: string;
    }>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.currencyPreference && { currency_preference: updates.currencyPreference }),
        ...(updates.subscriptionTier && { subscription_tier: updates.subscriptionTier }),
        ...(updates.subscriptionStatus && { subscription_status: updates.subscriptionStatus }),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      return false;
    }

    return true;
  }

  // Chat session operations
  static async createChatSession(
    userId: string,
    title: string = 'New Conversation'
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        title,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating chat session:', error);
      return null;
    }

    return data.id;
  }

  static async getChatSessions(
    userId: string,
    limit: number = 10
  ): Promise<{ id: string; title: string; createdAt: Date; updatedAt: Date }[]> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }

    return data.map(session => ({
      id: session.id,
      title: session.title,
      createdAt: new Date(session.created_at),
      updatedAt: new Date(session.updated_at),
    }));
  }

  static async getChatSession(sessionId: string): Promise<ChatSession | null> {
    // Get session info
    const { data: sessionData, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Error fetching chat session:', sessionError);
      return null;
    }

    // Get messages
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return null;
    }

    return {
      id: sessionData.id,
      title: sessionData.title,
      createdAt: new Date(sessionData.created_at),
      updatedAt: new Date(sessionData.updated_at),
      messages: messagesData.map(msg => ({
        role: msg.role,
        content: msg.content,
        sources: msg.sources,
        suggestedPrompts: msg.suggested_prompts,
      })),
    };
  }

  static async updateChatSessionTitle(
    sessionId: string,
    title: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('chat_sessions')
      .update({ title })
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating chat session title:', error);
      return false;
    }

    return true;
  }

  static async deleteChatSession(sessionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting chat session:', error);
      return false;
    }

    return true;
  }

  // Message operations
  static async createMessage(
    sessionId: string,
    message: ChatMessage & {
      modelUsed?: string;
      tokensUsed?: number;
      responseTimeMs?: number;
    }
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        role: message.role,
        content: message.content,
        sources: message.sources || null,
        suggested_prompts: message.suggestedPrompts || null,
        model_used: message.modelUsed || null,
        tokens_used: message.tokensUsed || null,
        response_time_ms: message.responseTimeMs || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return null;
    }

    return data.id;
  }

  // Analytics operations
  static async trackEvent(
    userId: string,
    event: AnalyticsEvent
  ): Promise<boolean> {
    const { error } = await supabase
      .from('usage_analytics')
      .insert({
        user_id: userId,
        session_id: event.sessionId || null,
        event_type: event.eventType,
        event_data: event.eventData,
      });

    if (error) {
      console.error('Error tracking analytics event:', error);
      return false;
    }

    return true;
  }

  static async getUserStats(userId: string): Promise<{
    totalSessions: number;
    totalMessages: number;
    totalTokens: number;
    lastActive: Date;
  } | null> {
    const { data, error } = await supabase
      .rpc('get_user_stats', { p_user_id: userId });

    if (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }

    return data;
  }

  // User context operations
  static async getUserContext(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('user_context')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user context:', error);
      return null;
    }

    if (!data) return null;

    // Build context summary
    const parts = [];
    if (data.role_description) parts.push(`Role: ${data.role_description}`);
    if (data.priorities) parts.push(`Priorities: ${data.priorities}`);
    if (data.ai_experience_level) parts.push(`AI Experience: ${data.ai_experience_level}`);
    if (data.interests?.length > 0) parts.push(`Interests: ${data.interests.join(', ')}`);
    if (data.pain_points?.length > 0) parts.push(`Pain Points: ${data.pain_points.join(', ')}`);

    return parts.join(' | ');
  }

  static async updateUserContext(
    userId: string,
    context: {
      roleDescription?: string;
      priorities?: string;
      interests?: string[];
      painPoints?: string[];
      aiExperienceLevel?: string;
    }
  ): Promise<boolean> {
    const { error } = await supabase
      .from('user_context')
      .upsert({
        user_id: userId,
        role_description: context.roleDescription,
        priorities: context.priorities,
        interests: context.interests,
        pain_points: context.painPoints,
        ai_experience_level: context.aiExperienceLevel,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error updating user context:', error);
      return false;
    }

    return true;
  }
}
