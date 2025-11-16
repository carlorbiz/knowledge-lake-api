/**
 * Grok Agent - Browser automation for X.com Grok
 * Maintains full conversation history and memory
 */

import { Page, BrowserContext } from 'playwright';
import { logger, logToolCall, logError } from '../logger.js';
import { config } from '../config.js';

export interface GrokOptions {
  question: string;
  threadId?: string; // Optional: continue existing conversation
  waitForResponse?: boolean;
}

export interface GrokResponse {
  answer: string;
  threadId?: string;
  timestamp: Date;
}

/**
 * Ask Grok a question using browser automation
 * Maintains conversation context and memory
 */
export async function askGrok(
  context: BrowserContext,
  options: GrokOptions
): Promise<GrokResponse> {
  logToolCall('ask_grok', {
    hasThreadId: !!options.threadId,
    questionLength: options.question.length
  });

  const page = await context.newPage();

  try {
    // Navigate to Grok (or existing thread)
    const url = options.threadId
      ? `https://x.com/i/grok/chat/${options.threadId}`
      : 'https://x.com/i/grok';

    logger.info(`Navigating to: ${url}`);
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: config.timeouts.navigation
    });

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Find the input textarea
    const inputSelector = 'textarea[placeholder*="Ask"], textarea[data-testid="grok-input"]';
    await page.waitForSelector(inputSelector, {
      timeout: config.timeouts.action
    });

    // Type the question
    await page.fill(inputSelector, options.question);
    await page.waitForTimeout(500);

    // Submit (usually Enter key or clicking send button)
    await page.keyboard.press('Enter');

    // Wait for response
    if (options.waitForResponse !== false) {
      // Wait for Grok's response to appear
      // This selector may need adjustment based on X.com's actual DOM
      await page.waitForTimeout(3000); // Give Grok time to start responding

      // Look for the latest message from Grok
      const responseSelector = '[data-testid="grok-message"]:last-of-type, .grok-response:last-of-type';

      try {
        await page.waitForSelector(responseSelector, {
          timeout: config.timeouts.response
        });
      } catch (err) {
        // Fallback: just wait and grab whatever is there
        logger.warn('Could not find specific response selector, using fallback');
        await page.waitForTimeout(5000);
      }

      // Extract the response text
      const responseText = await page.evaluate((): string => {
        // Try multiple selectors to find Grok's response
        const selectors = [
          '[data-testid="grok-message"]:last-of-type',
          '.grok-response:last-of-type',
          '[role="article"]:last-of-type',
          'div[dir="auto"]:last-of-type'
        ];

        for (const selector of selectors) {
          const element = (window as any).document.querySelector(selector);
          if (element?.textContent) {
            return element.textContent.trim();
          }
        }

        return 'Could not extract response. Please check the browser window.';
      });

      // Try to extract thread ID from URL
      const currentUrl = page.url();
      const threadMatch = currentUrl.match(/\/chat\/([a-zA-Z0-9-]+)/);
      const threadId = threadMatch ? threadMatch[1] : undefined;

      await page.close();

      return {
        answer: responseText,
        threadId,
        timestamp: new Date()
      };
    } else {
      // Don't wait for response, just return immediately
      await page.close();
      return {
        answer: 'Question submitted to Grok. Check the browser for the response.',
        timestamp: new Date()
      };
    }
  } catch (error) {
    logError(error as Error, { tool: 'ask_grok' });
    await page.close();
    throw error;
  }
}

/**
 * List recent Grok conversations
 */
export async function listGrokThreads(
  context: BrowserContext
): Promise<Array<{ id: string; preview: string }>> {
  logToolCall('list_grok_threads');

  const page = await context.newPage();

  try {
    await page.goto('https://x.com/i/grok', {
      waitUntil: 'networkidle',
      timeout: config.timeouts.navigation
    });

    await page.waitForTimeout(2000);

    // Extract thread list
    const threads = await page.evaluate((): Array<{ id: string; preview: string }> => {
      // This selector will need to be adjusted based on X.com's actual DOM
      const threadElements = (window as any).document.querySelectorAll('[data-testid="grok-thread"]');
      return Array.from(threadElements).map((el: any) => ({
        id: el.getAttribute('data-thread-id') || '',
        preview: el.textContent?.trim().substring(0, 100) || ''
      }));
    });

    await page.close();
    return threads;
  } catch (error) {
    logError(error as Error, { tool: 'list_grok_threads' });
    await page.close();
    throw error;
  }
}
