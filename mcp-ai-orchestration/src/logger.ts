/**
 * Security-focused logger
 * Never logs sensitive content, only metadata
 */

import winston from 'winston';
import { config } from './config.js';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

// Ensure log directory exists
try {
  mkdirSync(dirname(config.logging.file), { recursive: true });
} catch (err) {
  // Directory already exists
}

export const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: config.logging.file,
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

/**
 * Log MCP tool call (metadata only, no sensitive content)
 */
export function logToolCall(tool: string, metadata: Record<string, any> = {}) {
  logger.info({
    type: 'tool_call',
    tool,
    timestamp: new Date().toISOString(),
    user: process.env.USER || process.env.USERNAME,
    ...metadata
  });
}

/**
 * Log security event
 */
export function logSecurityEvent(event: string, details: Record<string, any> = {}) {
  logger.warn({
    type: 'security',
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
}

/**
 * Log error (sanitized)
 */
export function logError(error: Error, context: Record<string, any> = {}) {
  logger.error({
    type: 'error',
    message: error.message,
    stack: error.stack?.split('\n').slice(0, 3).join('\n'), // Limit stack trace
    timestamp: new Date().toISOString(),
    ...context
  });
}
