import {
  searchKnowledge,
  addKnowledge,
  getContext,
  ingestConversation,
  getConversations,
  getEntities,
  getRelationships,
  aureliaQuery,
  extractLearning,
  archiveConversations,
  healthCheck,
  type IngestConversationParams,
  type ConversationEntity,
  type ConversationRelationship,
  type ExtractLearningParams,
  type ArchiveConversationsParams,
} from "../clients/knowledgeLakeClient.js";
import { notionClient } from "../clients/notionClient.js";
import { drive } from "../clients/driveClient.js";

const notionKLDatabaseId = process.env.NOTION_KL_DATABASE_ID;
const driveKLFolderId = process.env.DRIVE_KL_FOLDER_ID;

export const knowledgeLakeTools = [
  // ==================== UNIFIED SEARCH ====================
  {
    name: "search_knowledge_lake",
    description:
      "Unified search across the Knowledge Lake (Notion database + Drive folder + Railway API). Use this first when looking for MTMOT/AAE/IP context.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search keywords.",
        },
        maxNotionResults: {
          type: "number",
          description: "Max Notion results (default 5).",
        },
        maxDriveResults: {
          type: "number",
          description: "Max Drive results (default 5).",
        },
        includeSemanticSearch: {
          type: "boolean",
          description: "Include mem0 semantic search from Railway API (default true).",
        },
      },
      required: ["query"],
    },
    handler: async (input: {
      query: string;
      maxNotionResults?: number;
      maxDriveResults?: number;
      includeSemanticSearch?: boolean;
    }) => {
      const {
        query,
        maxNotionResults = 5,
        maxDriveResults = 5,
        includeSemanticSearch = true,
      } = input;

      const result: {
        query: string;
        notion: unknown[];
        drive: unknown[];
        semantic: unknown[];
        notionError?: string;
        notionWarning?: string;
        driveError?: string;
        driveWarning?: string;
        semanticError?: string;
      } = {
        query,
        notion: [],
        drive: [],
        semantic: [],
      };

      // Notion part (if configured)
      if (notionKLDatabaseId) {
        try {
          const notionRes = await notionClient.databases.query({
            database_id: notionKLDatabaseId,
            filter: {
              or: [
                {
                  property: "Name",
                  rich_text: {
                    contains: query,
                  },
                },
              ],
            },
            page_size: maxNotionResults,
          });

          result.notion = notionRes.results;
        } catch (err: unknown) {
          result.notionError =
            err instanceof Error ? err.message : String(err);
        }
      } else {
        result.notionWarning = "NOTION_KL_DATABASE_ID not set.";
      }

      // Drive part (if configured)
      if (driveKLFolderId) {
        try {
          const q = [
            `'${driveKLFolderId}' in parents`,
            `name contains '${query.replace(/'/g, "\\'")}'`,
          ].join(" and ");

          const driveRes = await drive.files.list({
            q,
            pageSize: maxDriveResults,
            fields: "files(id, name, mimeType, webViewLink)",
          });

          result.drive = driveRes.data.files ?? [];
        } catch (err: unknown) {
          result.driveError =
            err instanceof Error ? err.message : String(err);
        }
      } else {
        result.driveWarning = "DRIVE_KL_FOLDER_ID not set.";
      }

      // Semantic search from Railway API
      if (includeSemanticSearch) {
        try {
          const semanticRes = await searchKnowledge(query);
          result.semantic = semanticRes.results;
        } catch (err: unknown) {
          result.semanticError =
            err instanceof Error ? err.message : String(err);
        }
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },

  // ==================== KNOWLEDGE/MEMORY OPERATIONS ====================
  {
    name: "kl_search_semantic",
    description:
      "Search the Knowledge Lake using semantic/vector search (mem0). Best for finding contextually related information.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Natural language search query.",
        },
        userId: {
          type: "string",
          description: "User ID for scoping search (default: carla_knowledge_lake).",
        },
      },
      required: ["query"],
    },
    handler: async (input: { query: string; userId?: string }) => {
      const { query, userId = "carla_knowledge_lake" } = input;

      const result = await searchKnowledge(query, userId);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "kl_add_knowledge",
    description:
      "Add new knowledge/memory to the Knowledge Lake. Use for storing insights, learnings, or important information.",
    inputSchema: {
      type: "object" as const,
      properties: {
        content: {
          type: "string",
          description: "The knowledge content to add.",
        },
        userId: {
          type: "string",
          description: "User ID for scoping (default: carla_knowledge_lake).",
        },
        metadata: {
          type: "object",
          description:
            "Optional metadata object (e.g., source, category, tags).",
        },
      },
      required: ["content"],
    },
    handler: async (input: {
      content: string;
      userId?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const { content, userId = "carla_knowledge_lake", metadata = {} } = input;

      const result = await addKnowledge(content, userId, metadata);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "kl_get_context",
    description:
      "Get contextual knowledge for a specific topic. Returns related memories/knowledge.",
    inputSchema: {
      type: "object" as const,
      properties: {
        topic: {
          type: "string",
          description: "The topic to get context for.",
        },
      },
      required: ["topic"],
    },
    handler: async (input: { topic: string }) => {
      const { topic } = input;

      const result = await getContext(topic);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },

  // ==================== CONVERSATION OPERATIONS ====================
  {
    name: "kl_ingest_conversation",
    description:
      "Ingest a conversation with structured entities and relationships into the Knowledge Lake. Use after AI agent conversations to build the knowledge graph.",
    inputSchema: {
      type: "object" as const,
      properties: {
        userId: {
          type: "number",
          description: "User ID (default 1 for Carla).",
        },
        agent: {
          type: "string",
          description:
            "AI agent name (Claude, Jan, Manus, Fred, Penny, Grok, etc.).",
        },
        date: {
          type: "string",
          description: "Conversation date (YYYY-MM-DD format).",
        },
        topic: {
          type: "string",
          description: "Main topic/title of the conversation.",
        },
        content: {
          type: "string",
          description: "Full conversation text or summary.",
        },
        entities: {
          type: "array",
          items: {
            type: "object",
            description: "Entity object with name, entityType, confidence, description.",
          },
          description:
            "Array of entities extracted from conversation. Each has: name, entityType (Technology, Person, Concept, Project, etc.), confidence (0-1), description.",
        },
        relationships: {
          type: "array",
          items: {
            type: "object",
            description: "Relationship object with from, to, relationshipType.",
          },
          description:
            "Array of relationships. Each has: from (entity name), to (entity name), relationshipType (integrates_with, depends_on, created_by, etc.).",
        },
        metadata: {
          type: "object",
          description: "Additional metadata (business_area, quality_rating, etc.).",
        },
      },
      required: ["agent", "date", "content"],
    },
    handler: async (input: {
      userId?: number;
      agent: string;
      date: string;
      topic?: string;
      content: string;
      entities?: ConversationEntity[];
      relationships?: ConversationRelationship[];
      metadata?: Record<string, unknown>;
    }) => {
      const {
        userId = 1,
        agent,
        date,
        topic,
        content,
        entities = [],
        relationships = [],
        metadata = {},
      } = input;

      const params: IngestConversationParams = {
        userId,
        agent,
        date,
        topic,
        content,
        entities,
        relationships,
        metadata,
      };

      const result = await ingestConversation(params);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "kl_list_conversations",
    description:
      "List conversations stored in the Knowledge Lake. Filter by agent if needed.",
    inputSchema: {
      type: "object" as const,
      properties: {
        userId: {
          type: "number",
          description: "User ID (default 1).",
        },
        agent: {
          type: "string",
          description: "Optional filter by agent name.",
        },
        limit: {
          type: "number",
          description: "Max results (default 50).",
        },
      },
      required: [],
    },
    handler: async (input: {
      userId?: number;
      agent?: string;
      limit?: number;
    }) => {
      const { userId = 1, agent, limit = 50 } = input;

      const result = await getConversations(userId, agent, limit);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },

  // ==================== ENTITY OPERATIONS ====================
  {
    name: "kl_list_entities",
    description:
      "List entities in the Knowledge Lake knowledge graph. Use for exploring what concepts/technologies/people are tracked.",
    inputSchema: {
      type: "object" as const,
      properties: {
        userId: {
          type: "number",
          description: "User ID (default 1).",
        },
        entityType: {
          type: "string",
          description:
            "Optional filter by type (Technology, Person, Concept, Project, etc.).",
        },
        limit: {
          type: "number",
          description: "Max results (default 100).",
        },
      },
      required: [],
    },
    handler: async (input: {
      userId?: number;
      entityType?: string;
      limit?: number;
    }) => {
      const { userId = 1, entityType, limit = 100 } = input;

      const result = await getEntities(userId, entityType, limit);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },

  // ==================== RELATIONSHIP OPERATIONS ====================
  {
    name: "kl_list_relationships",
    description:
      "List relationships in the Knowledge Lake knowledge graph. Shows how entities connect.",
    inputSchema: {
      type: "object" as const,
      properties: {
        userId: {
          type: "number",
          description: "User ID (default 1).",
        },
      },
      required: [],
    },
    handler: async (input: { userId?: number }) => {
      const { userId = 1 } = input;

      const result = await getRelationships(userId);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },

  // ==================== AURELIA QUERY ====================
  {
    name: "kl_aurelia_query",
    description:
      "Intelligent query for Aurelia AI avatar. Combines semantic search with entity knowledge for rich context.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Natural language query.",
        },
        userId: {
          type: "number",
          description: "User ID (default 1).",
        },
        includeEntities: {
          type: "boolean",
          description: "Include related entities in response (default true).",
        },
        maxResults: {
          type: "number",
          description: "Max semantic search results (default 10).",
        },
      },
      required: ["query"],
    },
    handler: async (input: {
      query: string;
      userId?: number;
      includeEntities?: boolean;
      maxResults?: number;
    }) => {
      const {
        query,
        userId = 1,
        includeEntities = true,
        maxResults = 10,
      } = input;

      const result = await aureliaQuery({
        query,
        userId,
        includeEntities,
        maxResults,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },

  // ==================== LEARNING EXTRACTION ====================
  {
    name: "kl_extract_learning",
    description:
      "Extract 7-dimension learning patterns from conversations using OpenAI. Creates discrete, searchable learning entities from raw conversations. Use this to clean up the Knowledge Lake after ingesting messy conversations.",
    inputSchema: {
      type: "object" as const,
      properties: {
        userId: {
          type: "number",
          description: "User ID (default 1 for Carla).",
        },
        conversationIds: {
          type: "array",
          items: {
            type: "number",
          },
          description:
            "Array of conversation IDs to process. If empty, processes all unprocessed conversations.",
        },
        dimensions: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "Learning dimensions to extract. Defaults to all 7: methodology, decisions, corrections, insights, values, prompting, teaching.",
        },
      },
      required: [],
    },
    handler: async (input: {
      userId?: number;
      conversationIds?: number[];
      dimensions?: string[];
    }) => {
      const {
        userId = 1,
        conversationIds = [],
        dimensions = [
          "methodology",
          "decisions",
          "corrections",
          "insights",
          "values",
          "prompting",
          "teaching",
        ],
      } = input;

      const params: ExtractLearningParams = {
        userId,
        conversationIds,
        dimensions,
      };

      const result = await extractLearning(params);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },

  // ==================== ARCHIVE OPERATIONS ====================
  {
    name: "kl_archive_conversations",
    description:
      "Archive conversations after extracting learnings. Removes raw conversations from queries while preserving extracted learning entities. Use after kl_extract_learning to keep the Knowledge Lake clean and focused.",
    inputSchema: {
      type: "object" as const,
      properties: {
        userId: {
          type: "number",
          description: "User ID (default 1 for Carla).",
        },
        conversationIds: {
          type: "array",
          items: {
            type: "number",
          },
          description: "Array of conversation IDs to archive.",
        },
        archiveType: {
          type: "string",
          enum: ["soft_delete", "hard_delete", "compress"],
          description:
            "Archive type: soft_delete (scheduled deletion with retention), hard_delete (immediate removal), compress (future feature). Default: soft_delete.",
        },
        retentionDays: {
          type: "number",
          description:
            "Days to retain before deletion (soft_delete only). Default: 30.",
        },
      },
      required: ["conversationIds"],
    },
    handler: async (input: {
      userId?: number;
      conversationIds: number[];
      archiveType?: "soft_delete" | "hard_delete" | "compress";
      retentionDays?: number;
    }) => {
      const {
        userId = 1,
        conversationIds,
        archiveType = "soft_delete",
        retentionDays = 30,
      } = input;

      const params: ArchiveConversationsParams = {
        userId,
        conversationIds,
        archiveType,
        retentionDays,
      };

      const result = await archiveConversations(params);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },

  // ==================== HEALTH CHECK ====================
  {
    name: "kl_health_check",
    description:
      "Check the health and status of the Knowledge Lake API on Railway.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
    handler: async () => {
      const result = await healthCheck();

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  },
];
