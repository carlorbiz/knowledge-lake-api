/**
 * Tier 1 Security Features
 * - Domain filtering
 * - Rate limiting
 * - Request monitoring
 */

import { config } from './config.js';
import { logSecurityEvent } from './logger.js';

interface RateLimitTracker {
  [agent: string]: {
    calls: number;
    resetAt: number;
  };
}

const rateLimits: RateLimitTracker = {};

/**
 * Check if domain is allowed
 */
export function isAllowedDomain(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    const allowed = config.allowedDomains.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    );

    if (!allowed) {
      logSecurityEvent('blocked_domain', { hostname });
    }

    return allowed;
  } catch (err) {
    logSecurityEvent('invalid_url', { url });
    return false;
  }
}

/**
 * Check rate limit for agent
 */
export function checkRateLimit(agent: string): boolean {
  const now = Date.now();
  const hourMs = 3600000;

  // Initialize or reset if needed
  if (!rateLimits[agent] || rateLimits[agent].resetAt < now) {
    rateLimits[agent] = {
      calls: 0,
      resetAt: now + hourMs
    };
  }

  // Check limit
  if (rateLimits[agent].calls >= config.rateLimit.maxCallsPerAgent) {
    logSecurityEvent('rate_limit_exceeded', {
      agent,
      calls: rateLimits[agent].calls,
      limit: config.rateLimit.maxCallsPerAgent
    });
    return false;
  }

  // Increment counter
  rateLimits[agent].calls++;
  return true;
}

/**
 * Get rate limit status
 */
export function getRateLimitStatus(agent: string): {
  calls: number;
  limit: number;
  resetAt: Date;
} {
  const tracker = rateLimits[agent] || { calls: 0, resetAt: Date.now() };
  return {
    calls: tracker.calls,
    limit: config.rateLimit.maxCallsPerAgent,
    resetAt: new Date(tracker.resetAt)
  };
}

/**
 * Sanitize text for logging (remove sensitive data patterns)
 */
export function sanitizeForLogging(text: string): string {
  // Remove potential API keys, tokens, passwords
  return text
    .replace(/[a-zA-Z0-9]{20,}/g, '[REDACTED]')
    .replace(/password[:\s]*\S+/gi, 'password:[REDACTED]')
    .replace(/token[:\s]*\S+/gi, 'token:[REDACTED]')
    .replace(/key[:\s]*\S+/gi, 'key:[REDACTED]');
}
