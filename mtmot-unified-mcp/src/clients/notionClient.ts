import { Client } from "@notionhq/client";
import { logger } from "../logger.js";

const notionApiKey = process.env.NOTION_API_KEY;
if (!notionApiKey) {
  logger.warn("[mtmot-mcp] NOTION_API_KEY not set - Notion tools will fail.");
} else {
  // Debug: show token prefix to verify correct token is loaded
  const prefix = notionApiKey.slice(0, 12);
  const suffix = notionApiKey.slice(-4);
  logger.info(`[mtmot-mcp] NOTION_API_KEY loaded: ${prefix}...${suffix} (length: ${notionApiKey.length})`);
}

export const notionClient = new Client({
  auth: notionApiKey,
});
