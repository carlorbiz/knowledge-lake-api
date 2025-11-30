/**
 * Configuration for AI Orchestration MCP
 * Tier 1 Security: Local-only, minimal attack surface
 */

export const config = {
  // Browser settings
  browser: {
    // Use dedicated Chrome profile for MCP (separate from main Chrome to avoid conflicts)
    userDataDir: process.env.CHROME_PROFILE_PATH ||
      'C:\\Users\\carlo\\AppData\\Local\\MCP-Chrome-Profile',
    profileName: process.env.CHROME_PROFILE || 'Default',
    headless: false, // Must be false for persistent context
    channel: 'chrome' as const
  },

  // Security: Allowed domains only
  allowedDomains: [
    'grok.x.com',
    'x.com',
    'claude.ai',
    'aistudio.google.com',
    'gemini.google.com',
    'chatgpt.com',
    'openai.com'
  ],

  // Timeout settings (ms)
  timeouts: {
    navigation: 30000,
    response: 60000,
    action: 5000
  },

  // Logging
  logging: {
    enabled: true,
    level: 'info' as const,
    file: './logs/mcp-orchestration.log',
    maxSize: 10485760, // 10MB
    maxFiles: 5
  },

  // Rate limiting
  rateLimit: {
    maxCallsPerHour: 50,
    maxCallsPerAgent: 20
  }
};

export type Config = typeof config;
