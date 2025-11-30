#!/usr/bin/env node

/**
 * Carla's AI Orchestration MCP
 * Secure browser automation for AI agents with full conversation memory
 *
 * Tier 1 Security:
 * - Local-only (stdio transport)
 * - Persistent browser context (no credential storage)
 * - Domain filtering
 * - Rate limiting
 * - Audit logging
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { chromium, BrowserContext } from 'playwright';
import { config } from './config.js';
import { logger } from './logger.js';
import { isAllowedDomain, checkRateLimit, getRateLimitStatus } from './security.js';
import { askGrok, listGrokThreads } from './agents/grok.js';

// Global browser context (reused across calls)
let browserContext: BrowserContext | null = null;

/**
 * Initialize browser with persistent context
 */
async function initBrowser(): Promise<BrowserContext> {
  if (browserContext) {
    return browserContext;
  }

  logger.info('Initializing browser context...');

  const profilePath = `${config.browser.userDataDir}\\${config.browser.profileName}`;

  browserContext = await chromium.launchPersistentContext(profilePath, {
    headless: config.browser.headless,
    channel: config.browser.channel,
    viewport: { width: 1280, height: 720 },
    acceptDownloads: false, // Security: no downloads
    bypassCSP: false, // Security: respect CSP
    args: [
      '--disable-blink-features=AutomationControlled', // Hide automation
      '--disable-dev-shm-usage',
      '--disable-web-security', // Allow cross-origin (needed for some AI sites)
      '--no-sandbox',
    ]
  });

  // Security: Block requests to non-allowed domains
  await browserContext.route('**/*', route => {
    if (isAllowedDomain(route.request().url())) {
      route.continue();
    } else {
      route.abort();
    }
  });

  logger.info('Browser context initialized');
  return browserContext;
}

/**
 * Create and configure MCP server
 */
const server = new Server(
  {
    name: 'carla-ai-orchestration',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'ask_grok',
        description: 'Ask Grok (X.com AI) a question. Grok will have full access to your conversation history and project context from previous interactions. Optionally continue an existing conversation thread.',
        inputSchema: {
          type: 'object',
          properties: {
            question: {
              type: 'string',
              description: 'The question to ask Grok'
            },
            thread_id: {
              type: 'string',
              description: 'Optional: ID of existing conversation thread to continue'
            },
            wait_for_response: {
              type: 'boolean',
              description: 'Whether to wait for Grok\'s response (default: true)',
              default: true
            }
          },
          required: ['question']
        }
      },
      {
        name: 'list_grok_threads',
        description: 'List recent Grok conversation threads to find thread IDs for continuing conversations',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_rate_limit_status',
        description: 'Check current rate limit status for an AI agent',
        inputSchema: {
          type: 'object',
          properties: {
            agent: {
              type: 'string',
              description: 'Agent name (e.g., "grok", "claude", "fred")',
              enum: ['grok', 'claude', 'fred', 'penny', 'gemini']
            }
          },
          required: ['agent']
        }
      }
    ]
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'ask_grok': {
        // Rate limiting
        if (!checkRateLimit('grok')) {
          const status = getRateLimitStatus('grok');
          return {
            content: [{
              type: 'text',
              text: `Rate limit exceeded for Grok. ${status.calls}/${status.limit} calls used. Resets at ${status.resetAt.toLocaleTimeString()}.`
            }]
          };
        }

        const context = await initBrowser();
        const result = await askGrok(context, {
          question: (args?.question ?? '') as string,
          threadId: args?.thread_id as string | undefined,
          waitForResponse: args?.wait_for_response !== false
        });

        return {
          content: [{
            type: 'text',
            text: `**Grok's Response:**\n\n${result.answer}\n\n${result.threadId ? `Thread ID: ${result.threadId}` : ''}\n\nTimestamp: ${result.timestamp.toLocaleString()}`
          }]
        };
      }

      case 'list_grok_threads': {
        const context = await initBrowser();
        const threads = await listGrokThreads(context);

        return {
          content: [{
            type: 'text',
            text: `**Recent Grok Conversations:**\n\n${threads.map(t => `- ${t.id}: ${t.preview}`).join('\n')}`
          }]
        };
      }

      case 'get_rate_limit_status': {
        const agent = (args?.agent ?? 'grok') as string;
        const status = getRateLimitStatus(agent);

        return {
          content: [{
            type: 'text',
            text: `**Rate Limit Status for ${agent}:**\n\nCalls: ${status.calls}/${status.limit}\nResets at: ${status.resetAt.toLocaleString()}`
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logger.error(`Tool execution failed: ${name}`, error);
    return {
      content: [{
        type: 'text',
        text: `Error executing ${name}: ${(error as Error).message}`
      }],
      isError: true
    };
  }
});

/**
 * Start server
 */
async function main() {
  logger.info('Starting Carla AI Orchestration MCP...');

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('MCP server running on stdio');

  // Cleanup on exit
  process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    if (browserContext) {
      await browserContext.close();
    }
    process.exit(0);
  });
}

main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
