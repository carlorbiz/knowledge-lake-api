import { notionClient } from "../clients/notionClient.js";

// Type definitions for Notion block content
interface RichTextItem {
  type: "text";
  text: { content: string; link?: { url: string } | null };
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
  };
}

interface BlockContent {
  type: "paragraph" | "heading_1" | "heading_2" | "heading_3" | "bulleted_list_item" | "numbered_list_item" | "to_do" | "code";
  content: string;
  checked?: boolean; // for to_do
  language?: string; // for code blocks
}

// Helper to convert simple text to Notion rich_text format
function toRichText(text: string): RichTextItem[] {
  return [{ type: "text", text: { content: text } }];
}

// Helper to convert block content to Notion block format
function toNotionBlock(block: BlockContent): Record<string, unknown> {
  const baseBlock: Record<string, unknown> = {
    object: "block",
    type: block.type,
  };

  switch (block.type) {
    case "paragraph":
      baseBlock.paragraph = { rich_text: toRichText(block.content) };
      break;
    case "heading_1":
      baseBlock.heading_1 = { rich_text: toRichText(block.content) };
      break;
    case "heading_2":
      baseBlock.heading_2 = { rich_text: toRichText(block.content) };
      break;
    case "heading_3":
      baseBlock.heading_3 = { rich_text: toRichText(block.content) };
      break;
    case "bulleted_list_item":
      baseBlock.bulleted_list_item = { rich_text: toRichText(block.content) };
      break;
    case "numbered_list_item":
      baseBlock.numbered_list_item = { rich_text: toRichText(block.content) };
      break;
    case "to_do":
      baseBlock.to_do = {
        rich_text: toRichText(block.content),
        checked: block.checked ?? false,
      };
      break;
    case "code":
      baseBlock.code = {
        rich_text: toRichText(block.content),
        language: block.language ?? "plain text",
      };
      break;
  }

  return baseBlock;
}

export const notionTools = [
  // ==================== READ TOOLS ====================
  {
    name: "search_notion",
    description:
      "Search Notion for pages/blocks matching a query. Use for general knowledge lake lookups.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search keywords." },
        pageSize: {
          type: "number",
          description: "Max results (default 5).",
        },
      },
      required: ["query"],
    },
    handler: async (input: { query: string; pageSize?: number }) => {
      const { query, pageSize = 5 } = input;

      const response = await notionClient.search({
        query,
        page_size: pageSize,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response.results, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "get_notion_page",
    description:
      "Fetch a Notion page by ID and return its raw properties. Use when you already know the page ID.",
    inputSchema: {
      type: "object" as const,
      properties: {
        pageId: {
          type: "string",
          description: "Notion page ID (UUID-style, with or without dashes).",
        },
      },
      required: ["pageId"],
    },
    handler: async (input: { pageId: string }) => {
      const { pageId } = input;

      const page = await notionClient.pages.retrieve({
        page_id: pageId,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(page, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "get_notion_block_children",
    description:
      "Get all child blocks of a page or block. Use to read the full content of a page.",
    inputSchema: {
      type: "object" as const,
      properties: {
        blockId: {
          type: "string",
          description: "Block or page ID to get children from.",
        },
        pageSize: {
          type: "number",
          description: "Max results per page (default 50).",
        },
      },
      required: ["blockId"],
    },
    handler: async (input: { blockId: string; pageSize?: number }) => {
      const { blockId, pageSize = 50 } = input;

      const response = await notionClient.blocks.children.list({
        block_id: blockId,
        page_size: pageSize,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response.results, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "query_notion_database",
    description:
      "Query a Notion database with optional filters and sorts. Use for structured data queries.",
    inputSchema: {
      type: "object" as const,
      properties: {
        databaseId: {
          type: "string",
          description: "The database ID to query.",
        },
        filter: {
          type: "object",
          description: "Optional Notion filter object (see Notion API docs).",
        },
        sorts: {
          type: "array",
          items: {
            type: "object",
            description: "Sort object with property and direction.",
          },
          description: "Optional array of sort objects.",
        },
        pageSize: {
          type: "number",
          description: "Max results (default 10).",
        },
      },
      required: ["databaseId"],
    },
    handler: async (input: {
      databaseId: string;
      filter?: Record<string, unknown>;
      sorts?: Array<Record<string, unknown>>;
      pageSize?: number;
    }) => {
      const { databaseId, filter, sorts, pageSize = 10 } = input;

      const queryParams: Record<string, unknown> = {
        database_id: databaseId,
        page_size: pageSize,
      };
      if (filter) queryParams.filter = filter;
      if (sorts) queryParams.sorts = sorts;

      const response = await notionClient.databases.query(
        queryParams as Parameters<typeof notionClient.databases.query>[0]
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response.results, null, 2),
          },
        ],
      };
    },
  },

  // ==================== WRITE TOOLS ====================
  {
    name: "create_notion_page",
    description:
      "Create a new page in a Notion database or as a child of another page. Returns the created page.",
    inputSchema: {
      type: "object" as const,
      properties: {
        parentType: {
          type: "string",
          enum: ["database_id", "page_id"],
          description: "Whether parent is a database or page.",
        },
        parentId: {
          type: "string",
          description: "The ID of the parent database or page.",
        },
        properties: {
          type: "object",
          description:
            "Page properties object. For database pages, must match database schema. For page children, use { title: [{ text: { content: 'Page Title' } }] }",
        },
        children: {
          type: "array",
          items: {
            type: "object",
            description: "Block content object with type and content fields.",
          },
          description:
            "Optional array of block content objects with type and content fields.",
        },
        icon: {
          type: "string",
          description: "Optional emoji icon (e.g., '📝').",
        },
        cover: {
          type: "string",
          description: "Optional external URL for cover image.",
        },
      },
      required: ["parentType", "parentId", "properties"],
    },
    handler: async (input: {
      parentType: "database_id" | "page_id";
      parentId: string;
      properties: Record<string, unknown>;
      children?: BlockContent[];
      icon?: string;
      cover?: string;
    }) => {
      const { parentType, parentId, properties, children, icon, cover } = input;

      const createParams: Record<string, unknown> = {
        parent: { [parentType]: parentId },
        properties,
      };

      if (children && children.length > 0) {
        createParams.children = children.map(toNotionBlock);
      }

      if (icon) {
        createParams.icon = { type: "emoji", emoji: icon };
      }

      if (cover) {
        createParams.cover = { type: "external", external: { url: cover } };
      }

      const page = await notionClient.pages.create(
        createParams as Parameters<typeof notionClient.pages.create>[0]
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(page, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "update_notion_page",
    description:
      "Update properties of an existing Notion page. Can also archive/unarchive pages.",
    inputSchema: {
      type: "object" as const,
      properties: {
        pageId: {
          type: "string",
          description: "The page ID to update.",
        },
        properties: {
          type: "object",
          description: "Properties to update (partial update supported).",
        },
        archived: {
          type: "boolean",
          description: "Set to true to archive, false to unarchive.",
        },
        icon: {
          type: "string",
          description: "New emoji icon (e.g., '✅').",
        },
        cover: {
          type: "string",
          description: "New external URL for cover image.",
        },
      },
      required: ["pageId"],
    },
    handler: async (input: {
      pageId: string;
      properties?: Record<string, unknown>;
      archived?: boolean;
      icon?: string;
      cover?: string;
    }) => {
      const { pageId, properties, archived, icon, cover } = input;

      const updateParams: Record<string, unknown> = {
        page_id: pageId,
      };

      if (properties) updateParams.properties = properties;
      if (archived !== undefined) updateParams.archived = archived;
      if (icon) updateParams.icon = { type: "emoji", emoji: icon };
      if (cover) updateParams.cover = { type: "external", external: { url: cover } };

      const page = await notionClient.pages.update(
        updateParams as Parameters<typeof notionClient.pages.update>[0]
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(page, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "append_notion_blocks",
    description:
      "Append new blocks (paragraphs, headings, lists, etc.) to a page or block.",
    inputSchema: {
      type: "object" as const,
      properties: {
        blockId: {
          type: "string",
          description: "The page or block ID to append to.",
        },
        children: {
          type: "array",
          items: {
            type: "object",
            description: "Block content object with type, content, and optional checked/language fields.",
          },
          description:
            "Array of block content objects. Each has: type (paragraph, heading_1, heading_2, heading_3, bulleted_list_item, numbered_list_item, to_do, code), content (text), and optionally checked (for to_do) or language (for code).",
        },
      },
      required: ["blockId", "children"],
    },
    handler: async (input: { blockId: string; children: BlockContent[] }) => {
      const { blockId, children } = input;

      const response = await notionClient.blocks.children.append({
        block_id: blockId,
        children: children.map(toNotionBlock) as Parameters<
          typeof notionClient.blocks.children.append
        >[0]["children"],
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "update_notion_block",
    description:
      "Update an existing block's content. Can also archive/delete blocks.",
    inputSchema: {
      type: "object" as const,
      properties: {
        blockId: {
          type: "string",
          description: "The block ID to update.",
        },
        type: {
          type: "string",
          enum: [
            "paragraph",
            "heading_1",
            "heading_2",
            "heading_3",
            "bulleted_list_item",
            "numbered_list_item",
            "to_do",
            "code",
          ],
          description: "The block type (must match existing block type).",
        },
        content: {
          type: "string",
          description: "New text content for the block.",
        },
        checked: {
          type: "boolean",
          description: "For to_do blocks: checked state.",
        },
        language: {
          type: "string",
          description: "For code blocks: programming language.",
        },
        archived: {
          type: "boolean",
          description: "Set to true to delete/archive the block.",
        },
      },
      required: ["blockId"],
    },
    handler: async (input: {
      blockId: string;
      type?: BlockContent["type"];
      content?: string;
      checked?: boolean;
      language?: string;
      archived?: boolean;
    }) => {
      const { blockId, type, content, checked, language, archived } = input;

      const updateParams: Record<string, unknown> = {
        block_id: blockId,
      };

      if (archived !== undefined) {
        updateParams.archived = archived;
      }

      if (type && content !== undefined) {
        const blockContent: BlockContent = { type, content };
        if (checked !== undefined) blockContent.checked = checked;
        if (language) blockContent.language = language;

        const notionBlock = toNotionBlock(blockContent);
        updateParams[type] = notionBlock[type];
      }

      const block = await notionClient.blocks.update(
        updateParams as Parameters<typeof notionClient.blocks.update>[0]
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(block, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "delete_notion_block",
    description: "Delete (archive) a block by ID.",
    inputSchema: {
      type: "object" as const,
      properties: {
        blockId: {
          type: "string",
          description: "The block ID to delete.",
        },
      },
      required: ["blockId"],
    },
    handler: async (input: { blockId: string }) => {
      const { blockId } = input;

      const block = await notionClient.blocks.delete({
        block_id: blockId,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(block, null, 2),
          },
        ],
      };
    },
  },
];
