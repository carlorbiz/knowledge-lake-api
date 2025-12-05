/**
 * Simple logger that writes everything to stdout
 * Prevents Railway from labeling all logs as "error" (which happens with stderr)
 */

export const logger = {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  warn: (...args: any[]) => console.log('[WARN]', ...args),
  error: (...args: any[]) => console.log('[ERROR]', ...args),
  debug: (...args: any[]) => console.log('[DEBUG]', ...args),
  log: (...args: any[]) => console.log('[LOG]', ...args),
};
