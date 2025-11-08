import { Request } from 'express';

export interface WordPressJWTPayload {
  data: {
    user: {
      id: string;
      email: string;
      nicename: string;
      firstName: string;
      lastName: string;
    };
  };
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    wordpressId: string;
    email: string;
    name: string;
  };
  userId?: string; // Supabase user ID
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  sources?: { title: string; uri: string }[];
  suggestedPrompts?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  wordpressUserId: string;
  email: string;
  name: string | null;
  subscriptionTier: 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'cancelled' | 'expired';
  currencyPreference: string;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface AnalyticsEvent {
  eventType: string;
  eventData: Record<string, any>;
  sessionId?: string;
}
