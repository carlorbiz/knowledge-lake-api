import { Client } from "@notionhq/client";

const notionApiKey = process.env.NOTION_API_KEY;
if (!notionApiKey) {
  console.warn("[mtmot-mcp] NOTION_API_KEY not set - Notion tools will fail.");
}

export const notionClient = new Client({
  auth: notionApiKey,
});
