// Knowledge Lake API Client
// Connects to the Railway-hosted Knowledge Lake API

import { logger } from "../logger.js";

const knowledgeLakeBaseUrl = process.env.KNOWLEDGE_LAKE_URL || process.env.AAE_BASE_URL;
const knowledgeLakeApiKey = process.env.KNOWLEDGE_LAKE_API_KEY || process.env.AAE_API_KEY;

if (!knowledgeLakeBaseUrl) {
  logger.warn("[mtmot-mcp] KNOWLEDGE_LAKE_URL not set - Knowledge Lake tools will fail.");
}

// Generic fetch helper
async function klFetch<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    params?: Record<string, string | number | undefined>;
  } = {}
): Promise<T> {
  if (!knowledgeLakeBaseUrl) {
    throw new Error("Knowledge Lake API not configured (KNOWLEDGE_LAKE_URL missing).");
  }

  const { method = "GET", body, params } = options;

  let url = `${knowledgeLakeBaseUrl}${endpoint}`;

  // Add query params for GET requests
  if (params && method === "GET") {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (knowledgeLakeApiKey) {
    headers["Authorization"] = `Bearer ${knowledgeLakeApiKey}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Knowledge Lake API error: ${res.status} - ${text}`);
  }

  return res.json() as Promise<T>;
}

// ==================== Knowledge/Memory Operations ====================

export interface SearchResult {
  results: unknown[];
  timestamp: string;
}

export async function searchKnowledge(
  query: string,
  userId = "carla_knowledge_lake"
): Promise<SearchResult> {
  return klFetch<SearchResult>("/knowledge/search", {
    params: { query, user_id: userId },
  });
}

export interface AddKnowledgeResult {
  status: string;
  timestamp: string;
}

export async function addKnowledge(
  content: string | Array<{ role: string; content: string }>,
  userId = "carla_knowledge_lake",
  metadata: Record<string, unknown> = {}
): Promise<AddKnowledgeResult> {
  return klFetch<AddKnowledgeResult>("/knowledge/add", {
    method: "POST",
    body: { content, user_id: userId, metadata },
  });
}

export async function getContext(topic: string): Promise<{ context: unknown[]; topic: string }> {
  return klFetch<{ context: unknown[]; topic: string }>(`/knowledge/context/${encodeURIComponent(topic)}`);
}

// ==================== Conversation Operations ====================

export interface ConversationEntity {
  name: string;
  entityType: string;
  confidence?: number;
  description?: string;
  sourceContext?: string;
}

export interface ConversationRelationship {
  from: string;
  to: string;
  relationshipType: string;
  weight?: number;
}

export interface IngestConversationParams {
  userId: number;
  agent: string;
  date: string;
  topic?: string;
  content: string;
  entities?: ConversationEntity[];
  relationships?: ConversationRelationship[];
  metadata?: Record<string, unknown>;
}

export interface IngestConversationResult {
  success: boolean;
  conversation: {
    id: number;
    agent: string;
    topic: string;
  };
  entitiesCreated: number;
  relationshipsCreated: number;
  timestamp: string;
}

export async function ingestConversation(
  params: IngestConversationParams
): Promise<IngestConversationResult> {
  return klFetch<IngestConversationResult>("/api/conversations/ingest", {
    method: "POST",
    body: params,
  });
}

export interface ConversationsListResult {
  conversations: Array<{
    id: number;
    userId: number;
    agent: string;
    date: string;
    topic: string;
    entityCount: number;
    relationshipCount: number;
    createdAt: string;
  }>;
  total: number;
}

export async function getConversations(
  userId: number,
  agent?: string,
  limit = 50
): Promise<ConversationsListResult> {
  return klFetch<ConversationsListResult>("/api/conversations", {
    params: { userId: String(userId), agent, limit },
  });
}

export interface SearchConversationsParams {
  query: string;
  userId: number;
  agent?: string;
  limit?: number;
}

export interface SearchConversationsResult {
  results: Array<{
    id: number;
    userId: number;
    agent: string;
    date: string;
    topic: string;
    content: string;
    metadata: Record<string, unknown>;
    createdAt: string;
    entities: Array<{
      id: number;
      name: string;
      entityType: string;
      confidence: number;
    }>;
  }>;
  total: number;
  query: string;
}

export async function searchConversations(
  params: SearchConversationsParams
): Promise<SearchConversationsResult> {
  return klFetch<SearchConversationsResult>("/api/conversations/search", {
    method: "POST",
    body: params,
  });
}

// ==================== Entity Operations ====================

export interface Entity {
  id: number;
  userId: number;
  entityType: string;
  name: string;
  description: string;
  semanticState: string;
  confidence: number;
  sourceContext: string;
  conversationId: number;
  createdAt: string;
}

export interface EntitiesListResult {
  entities: Entity[];
  total: number;
}

export async function getEntities(
  userId: number,
  entityType?: string,
  limit = 100
): Promise<EntitiesListResult> {
  return klFetch<EntitiesListResult>("/api/entities", {
    params: { userId: String(userId), entityType, limit },
  });
}

// ==================== Relationship Operations ====================

export interface Relationship {
  id: number;
  fromEntityId: number;
  toEntityId: number;
  relationshipType: string;
  weight: number;
  semanticState: string;
  conversationId: number;
  createdAt: string;
  fromEntity?: string;
  toEntity?: string;
}

export interface RelationshipsListResult {
  relationships: Relationship[];
  total: number;
}

export async function getRelationships(userId: number): Promise<RelationshipsListResult> {
  return klFetch<RelationshipsListResult>("/api/relationships", {
    params: { userId: String(userId) },
  });
}

// ==================== Aurelia Query Operations ====================

export interface AureliaQueryParams {
  query: string;
  userId?: number;
  includeEntities?: boolean;
  maxResults?: number;
}

export interface AureliaQueryResult {
  query: string;
  semanticResults: unknown[];
  relatedEntities: Entity[];
  timestamp: string;
}

export async function aureliaQuery(params: AureliaQueryParams): Promise<AureliaQueryResult> {
  return klFetch<AureliaQueryResult>("/api/aurelia/query", {
    method: "POST",
    body: params,
  });
}

// ==================== Learning Extraction ====================

export interface ExtractLearningParams {
  userId: number;
  conversationIds?: number[];
  dimensions?: string[];
}

export interface ExtractLearningResult {
  success: boolean;
  conversationsProcessed: number;
  learningsCreated: number;
  learningsByDimension: Record<string, number>;
  timestamp: string;
}

export async function extractLearning(
  params: ExtractLearningParams
): Promise<ExtractLearningResult> {
  return klFetch<ExtractLearningResult>("/api/conversations/extract-learning", {
    method: "POST",
    body: params,
  });
}

// ==================== Archive Operations ====================

export interface ArchiveConversationsParams {
  userId: number;
  conversationIds: number[];
  archiveType?: "soft_delete" | "hard_delete" | "compress";
  retentionDays?: number;
}

export interface ArchiveConversationsResult {
  success: boolean;
  conversationsArchived: number;
  archiveType: string;
  scheduledDeletion?: string;
  timestamp: string;
}

export async function archiveConversations(
  params: ArchiveConversationsParams
): Promise<ArchiveConversationsResult> {
  return klFetch<ArchiveConversationsResult>("/api/conversations/archive", {
    method: "POST",
    body: params,
  });
}

// ==================== Health Check ====================

export interface HealthCheckResult {
  status: string;
  service: string;
  version: string;
  endpoints: Record<string, string[]>;
}

export async function healthCheck(): Promise<HealthCheckResult> {
  return klFetch<HealthCheckResult>("/health");
}
