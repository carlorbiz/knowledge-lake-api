// Test script to verify real-time search is working
// Run with: node test-search.mjs

import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const testQueries = [
  { query: "What's the latest pricing for ChatGPT Plus?", expectSearch: true },
  { query: "Compare Claude vs Gemini for enterprise", expectSearch: true },
  { query: "What are the newest features in Perplexity?", expectSearch: true },
  { query: "Is Cursor better than GitHub Copilot?", expectSearch: true },
  { query: "What's the current cost of Notion AI?", expectSearch: true },
  { query: "How do I motivate my team?", expectSearch: false }, // Should NOT trigger search
];

async function testSearchComponent() {
  console.log('\n🧪 TESTING REAL-TIME SEARCH COMPONENT\n');
  console.log('════════════════════════════════════════\n');

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ ERROR: GEMINI_API_KEY not found in .env file\n');
    console.log('Please set GEMINI_API_KEY in backend/.env');
    console.log('Get one at: https://aistudio.google.com/apikey\n');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let passed = 0;
  let failed = 0;

  for (const test of testQueries) {
    console.log(`📝 Query: "${test.query}"`);
    console.log(`   Expected: ${test.expectSearch ? 'WITH search' : 'NO search'}`);

    try {
      const startTime = Date.now();

      // Determine if search should be used based on triggers
      const lowerQuery = test.query.toLowerCase();
      const aiTools = ['chatgpt', 'claude', 'gemini', 'perplexity', 'cursor', 'copilot', 'notion'];
      const searchTriggers = ['latest', 'pricing', 'compare', 'vs', 'features', 'newest', 'current', 'cost', 'better'];

      const shouldUseSearch =
        aiTools.some(tool => lowerQuery.includes(tool)) ||
        searchTriggers.some(trigger => lowerQuery.includes(trigger));

      const chat = ai.chats.create({
        model: shouldUseSearch ? 'gemini-2.5-flash' : 'gemini-2.5-flash-lite',
        config: {
          systemInstruction: 'You are an AI advisor. Provide concise, factual answers.',
          ...(shouldUseSearch && { tools: [{ googleSearch: {} }] }),
        },
      });

      const result = await chat.sendMessage({ message: test.query });
      const responseTime = Date.now() - startTime;

      // Check for sources (grounding metadata)
      const groundingMetadata = result.candidates?.[0]?.groundingMetadata;
      const sources = groundingMetadata?.groundingChunks || [];

      console.log(`   ✅ Model: ${shouldUseSearch ? 'gemini-2.5-flash' : 'gemini-2.5-flash-lite'}`);
      console.log(`   ✅ Search enabled: ${shouldUseSearch}`);
      console.log(`   ✅ Sources found: ${sources.length}`);

      if (sources.length > 0) {
        console.log(`   📎 Sample source: ${sources[0].web?.title || 'N/A'}`);
        console.log(`   📎 URL: ${sources[0].web?.uri || 'N/A'}`);
      }

      console.log(`   ⏱️  Response time: ${responseTime}ms`);
      console.log(`   📊 Tokens: ${result.usageMetadata?.totalTokenCount || 'N/A'}`);

      // Verify expectations
      const hasSearch = sources.length > 0;
      if (test.expectSearch === hasSearch) {
        console.log(`   ✅ PASS: Search behavior matches expectation\n`);
        passed++;
      } else {
        console.log(`   ⚠️  WARNING: Expected ${test.expectSearch ? 'sources' : 'no sources'}, got ${sources.length}\n`);
        failed++;
      }

    } catch (error) {
      console.error(`   ❌ ERROR: ${error.message}\n`);
      failed++;
    }
  }

  console.log('════════════════════════════════════════\n');
  console.log(`📊 RESULTS: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Real-time search is working correctly.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check your Gemini API key and internet connection.\n');
    process.exit(1);
  }
}

testSearchComponent();
