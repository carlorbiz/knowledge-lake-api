#!/usr/bin/env node
/**
 * HTTP version of the MTMOT Unified MCP Server
 *
 * This exposes the MCP server over HTTP for use with ChatGPT Developer Mode
 * and other HTTP-based MCP clients.
 *
 * Supports: 
 * - Streamable HTTP transport (SSE + HTTP POST) for MCP clients
 * - Simple REST API (/api/call) for n8n and other HTTP clients
 */
import "dotenv/config";
import http from "node:http";
import { randomUUID } from "node:crypto";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { logger } from "./logger.js";
import { notionTools } from "./tools/notionTools.js";
import { driveTools } from "./tools/driveTools.js";
import { knowledgeLakeTools } from "./tools/knowledgeLakeTools.js";
import { aaeTools } from "./tools/aaeTools.js";

const PORT = parseInt(process.env.PORT || "3000", 10);

// API Key for REST endpoint authentication (optional but recommended)
const API_KEY = process.env.MCP_API_KEY || null;

// Combine all tools
const allTools = [
  ...notionTools,
  ...driveTools,
  ...knowledgeLakeTools,
  ...aaeTools,
];

// Create tool lookup map
const toolHandlers = new Map<string, (input: unknown) => Promise<unknown>>();
for (const tool of allTools) {
  toolHandlers.set(tool.name, tool.handler as (input: unknown) => Promise<unknown>);
}

// Store active transports by session ID
const transports = new Map<string, StreamableHTTPServerTransport>();

function createMCPServer() {
  const server = new Server(
    {
      name: "mtmot-unified-mcp",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle list tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  // Handle call tool request
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const handler = toolHandlers.get(name);
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      const result = await handler(args);
      return result as { content: Array<{ type: "text"; text: string }> };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

// Helper to read request body
async function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

const httpServer = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  // Enable CORS for browser-based clients
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-session-id, Authorization, X-API-Key");
  res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check endpoint
  if (url.pathname === "/health" || url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "healthy",
      service: "mtmot-unified-mcp",
      version: "0.2.0",
      tools: allTools.length,
      toolNames: allTools.map(t => t.name),
      endpoints: {
        mcp: "/mcp (SSE/MCP protocol)",
        rest: "/api/call (simple REST)",
        tools: "/api/tools (list all tools)",
      }
    }));
    return;
  }

  // ============================================================
  // REST API ENDPOINTS - For n8n, curl, and simple HTTP clients
  // ============================================================

  // List tools via REST
  if (url.pathname === "/api/tools" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      tools: allTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    }));
    return;
  }

  // Call a tool via REST
  if (url.pathname === "/api/call" && req.method === "POST") {
    // Optional API key authentication
    if (API_KEY) {
      const authHeader = req.headers["authorization"] || req.headers["x-api-key"];
      const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
      const providedKey = headerValue?.replace("Bearer ", "");
      if (providedKey !== API_KEY) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized", message: "Invalid or missing API key" }));
        return;
      }
    }

    try {
      const body = await readBody(req);
      const { tool, arguments: args } = JSON.parse(body);

      if (!tool) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Bad request", message: "Missing 'tool' field" }));
        return;
      }

      const handler = toolHandlers.get(tool);
      if (!handler) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ 
          error: "Tool not found", 
          message: `Unknown tool: ${tool}`,
          availableTools: allTools.map(t => t.name)
        }));
        return;
      }

      logger.info(`[rest-api] Calling tool: ${tool}`);
      const result = await handler(args || {});
      
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: true,
        tool,
        result,
      }));
      return;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`[rest-api] Error calling tool: ${errorMessage}`);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: false,
        error: "Tool execution failed",
        message: errorMessage,
      }));
      return;
    }
  }

  // ============================================================
  // MCP PROTOCOL ENDPOINT - For ChatGPT Dev, Claude, MCP clients
  // ============================================================

  if (url.pathname === "/mcp") {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (req.method === "GET") {
      // New SSE connection - create transport and server
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          logger.info(`[http-mcp] Session initialized: ${id}`);
          transports.set(id, transport);
        },
        onsessionclosed: (id) => {
          logger.info(`[http-mcp] Session closed: ${id}`);
          transports.delete(id);
        },
      });

      const server = createMCPServer();
      await server.connect(transport);
      await transport.handleRequest(req, res);
      return;
    }

    if (req.method === "POST") {
      // Check for existing session
      if (sessionId && transports.has(sessionId)) {
        const transport = transports.get(sessionId)!;
        await transport.handleRequest(req, res);
        return;
      }

      // New session via POST (initialization)
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          logger.info(`[http-mcp] Session initialized: ${id}`);
          transports.set(id, transport);
        },
        onsessionclosed: (id) => {
          logger.info(`[http-mcp] Session closed: ${id}`);
          transports.delete(id);
        },
      });

      const server = createMCPServer();
      await server.connect(transport);
      await transport.handleRequest(req, res);
      return;
    }

    if (req.method === "DELETE") {
      if (sessionId && transports.has(sessionId)) {
        const transport = transports.get(sessionId)!;
        await transport.handleRequest(req, res);
        return;
      }
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Session not found" }));
      return;
    }

    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  // 404 for other paths
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

httpServer.listen(PORT, () => {
  logger.info(`[http-mcp] MTMOT Unified MCP Server (HTTP) listening on port ${PORT}`);
  logger.info(`[http-mcp] MCP endpoint: http://localhost:${PORT}/mcp`);
  logger.info(`[http-mcp] REST API: http://localhost:${PORT}/api/call`);
  logger.info(`[http-mcp] Health check: http://localhost:${PORT}/health`);
  logger.info(`[http-mcp] Available tools: ${allTools.length}`);
  if (API_KEY) {
    logger.info(`[http-mcp] REST API authentication: ENABLED`);
  } else {
    logger.info(`[http-mcp] REST API authentication: DISABLED (set MCP_API_KEY to enable)`);
  }
});
