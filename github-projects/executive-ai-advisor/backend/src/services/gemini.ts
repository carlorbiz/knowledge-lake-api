import { GoogleGenAI, Chat, GenerateContentResponse, Type } from '@google/genai';
import { ChatMessage } from '../types/index.js';

let ai: GoogleGenAI;

const getAi = () => {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

const PRO_TRIGGERS = [
  'compare', 'roi', 'business case', 'team', 'enterprise',
  'integrate', 'deploy', 'implementation', 'roadmap', 'cost analysis',
  'competitor', 'pricing strategy', 'vendor selection'
];

// AI tools that require real-time search (updated daily)
const AI_TOOLS = [
  'chatgpt', 'gpt', 'openai', 'claude', 'anthropic', 'gemini', 'bard',
  'perplexity', 'midjourney', 'dall-e', 'stable diffusion', 'runway',
  'notion ai', 'copilot', 'github copilot', 'cursor', 'replit',
  'jasper', 'copy.ai', 'writesonic', 'grammarly', 'quillbot',
  'otter.ai', 'fireflies', 'grain', 'krisp', 'descript',
  'synthesia', 'heygen', 'eleven labs', 'murf', 'play.ht',
  'zapier', 'make.com', 'n8n', 'activepieces',
  'hubspot', 'salesforce', 'pipedrive', 'intercom',
  'slack', 'microsoft teams', 'discord', 'zoom',
  'loom', 'tldv', 'mem', 'mem0', 'mem.ai',
  'langchain', 'llamaindex', 'pinecone', 'weaviate', 'chroma'
];

const SEARCH_TRIGGERS = [
  'latest', 'current', 'news', 'recent', 'today', 'update',
  'announcement', '2025', '2026', 'new', 'release', 'launched',
  'pricing', 'price', 'cost', 'how much', 'subscription',
  'vs', 'versus', 'compare', 'comparison', 'better than',
  'alternative', 'instead of', 'replace', 'switch from',
  'best', 'top', 'recommended', 'which', 'should i',
  'can it', 'does it', 'features', 'capabilities',
  'worth it', 'review', 'opinion', 'pros and cons'
];

const getModelForPrompt = (prompt: string): string => {
  const lowerCasePrompt = prompt.toLowerCase();

  // ALWAYS use search for AI tool queries (they change daily!)
  const mentionsAITool = AI_TOOLS.some(tool => lowerCasePrompt.includes(tool));

  // Check for explicit search triggers
  const needsSearch = SEARCH_TRIGGERS.some(trigger => lowerCasePrompt.includes(trigger));

  // Use Pro for complex analysis WITH search
  if (PRO_TRIGGERS.some(trigger => lowerCasePrompt.includes(trigger))) {
    return 'gemini-2.5-pro'; // Complex analysis with search
  }

  // Use Flash with search for AI tool queries or explicit search needs
  if (mentionsAITool || needsSearch) {
    return 'gemini-2.5-flash'; // Fast with search grounding
  }

  // Only use Lite for truly general queries (rare for this app)
  return 'gemini-2.5-flash-lite';
};

interface GenerateResponseOptions {
  messages: ChatMessage[];
  userName?: string;
  currency?: string;
  userContext?: string;
  subscriptionTier?: string;
}

export const generateChatResponse = async (
  options: GenerateResponseOptions
): Promise<{
  text: string;
  sources?: { title: string; uri: string }[];
  suggestedPrompts?: string[];
  modelUsed: string;
  tokensUsed?: number;
  responseTimeMs: number;
}> => {
  const startTime = Date.now();

  try {
    const ai = getAi();
    const lastUserMessage = options.messages[options.messages.length - 1];

    if (!lastUserMessage || lastUserMessage.role !== 'user') {
      throw new Error('Last message must be from user');
    }

    const modelName = getModelForPrompt(lastUserMessage.content);
    const lowerCaseMessage = lastUserMessage.content.toLowerCase();

    // Enable search for: AI tools, explicit triggers, or Pro model queries
    const mentionsAITool = AI_TOOLS.some(tool => lowerCaseMessage.includes(tool));
    const hasSearchTrigger = SEARCH_TRIGGERS.some(trigger => lowerCaseMessage.includes(trigger));
    const useSearch = mentionsAITool || hasSearchTrigger || modelName === 'gemini-2.5-pro';

    // Build enhanced system instruction based on subscription tier
    let systemInstruction = `You are Vera, an elite AI advisor for C-suite executives and business leaders.

**Your Expertise:**
- AI/ML product evaluation and vendor selection
- ROI modeling and business case development
- Implementation roadmaps and change management
- Competitive intelligence and market positioning
- Cost optimization and pricing strategy
- Team productivity and workflow automation

**Your Approach:**
- **Executive-Level Communication**: Direct, strategic, data-driven. No fluff or marketing speak.
- **Real-Time Intelligence**: The AI landscape changes DAILY. Always search for current pricing, features, and announcements. When discussing AI tools, explicitly mention when data was last verified (e.g., "As of October 2025..." or "Based on recent announcements...").
- **Actionable Intelligence**: Every response should include concrete next steps or decision frameworks.
- **Context-Aware**: Reference the user's industry, team size, and technical maturity level.
- **Transparency About Freshness**: If you're uncertain about current pricing or features, explicitly say "Let me search for the latest information" or "This may have changed - I recommend verifying directly with the vendor."
- **ROI-Centric**: Always consider total cost of ownership, implementation timeline, and measurable outcomes.`;

    // Add personalization
    if (options.userName) {
      systemInstruction += `\n\n**User**: ${options.userName}`;
    }

    if (options.currency) {
      systemInstruction += `\n**Currency Preference**: ${options.currency} (use this for all pricing discussions)`;
    }

    if (options.userContext) {
      systemInstruction += `\n\n**User Context**: ${options.userContext}`;
    }

    // Premium features for paying customers
    if (options.subscriptionTier === 'premium' || options.subscriptionTier === 'enterprise') {
      systemInstruction += `

**Premium Features Enabled:**
- Detailed competitor analysis with market positioning
- Custom ROI calculators with sensitivity analysis
- Multi-vendor comparison matrices
- Implementation risk assessment
- Compliance and security frameworks (SOC2, GDPR, HIPAA)`;
    }

    systemInstruction += `

**Response Format**:
1. **Executive Summary** (2-3 sentences max)
2. **Key Insights** (bullet points)
3. **Recommended Actions** (prioritized list)
4. End with "---" followed by a strategic question that advances their decision-making

Always cite sources when discussing specific products, pricing, or recent developments.`;

    // Create chat with history
    const chat: Chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction,
        ...(useSearch && { tools: [{ googleSearch: {} }] }),
      },
      history: options.messages.slice(0, -1).map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      })),
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: lastUserMessage.content
    });

    const text = result.text;

    // Generate follow-up prompts
    const suggestedPrompts = await generateFollowUpPrompts(
      lastUserMessage.content,
      text,
      options.subscriptionTier
    );

    // Extract sources from grounding metadata
    const groundingMetadata = result.candidates?.[0]?.groundingMetadata;
    let sources: { title: string; uri: string }[] = [];

    if (groundingMetadata?.groundingChunks) {
      sources = groundingMetadata.groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web?.uri && web?.title)
        .map((web: any) => ({ uri: web.uri, title: web.title }));
    }

    const responseTimeMs = Date.now() - startTime;

    return {
      text,
      sources: sources.length > 0 ? sources : undefined,
      suggestedPrompts,
      modelUsed: modelName,
      tokensUsed: result.usageMetadata?.totalTokenCount,
      responseTimeMs,
    };

  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate AI response');
  }
};

const generateFollowUpPrompts = async (
  userQuery: string,
  modelResponse: string,
  subscriptionTier?: string
): Promise<string[]> => {
  try {
    let promptInstruction = `Based on the user's question ("${userQuery}") and the AI's answer ("${modelResponse}"), generate 3 strategic follow-up questions that a busy executive would ask next.

Focus on:
- Implementation details ("How do I actually do this?")
- Risk mitigation ("What could go wrong?")
- ROI validation ("How do I measure success?")
- Competitive alternatives ("What else should I consider?")`;

    if (subscriptionTier === 'premium' || subscriptionTier === 'enterprise') {
      promptInstruction += `\n- Advanced analysis ("Show me the data/comparison matrix")`;
    }

    const result = await getAi().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptInstruction,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const json = JSON.parse(result.text);
    return json.prompts || [];

  } catch (error) {
    console.error('Error generating follow-up prompts:', error);
    return [];
  }
};

// Advanced feature: Generate ROI calculator
export const generateROICalculator = async (
  toolName: string,
  teamSize: number,
  monthlyBudget: number
): Promise<{
  calculator: any;
  insights: string;
}> => {
  try {
    const prompt = `Create a detailed ROI calculator for implementing ${toolName} for a team of ${teamSize} people with a monthly budget of $${monthlyBudget}.

Include:
1. Total cost of ownership (licenses, implementation, training, maintenance)
2. Time savings per employee
3. Productivity gains
4. Break-even timeline
5. 3-year ROI projection

Return as structured JSON.`;

    const result = await getAi().models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calculator: {
              type: Type.OBJECT,
              properties: {
                totalCost: { type: Type.NUMBER },
                timeSavingsPerEmployee: { type: Type.NUMBER },
                productivityGain: { type: Type.NUMBER },
                breakEvenMonths: { type: Type.NUMBER },
                threeYearROI: { type: Type.NUMBER }
              }
            },
            insights: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(result.text);

  } catch (error) {
    console.error('Error generating ROI calculator:', error);
    throw new Error('Failed to generate ROI calculator');
  }
};

// Advanced feature: Competitor analysis
export const generateCompetitorAnalysis = async (
  primaryTool: string,
  alternatives: string[]
): Promise<{
  comparisonMatrix: any[];
  recommendation: string;
}> => {
  try {
    const prompt = `Create a comprehensive comparison of ${primaryTool} vs these alternatives: ${alternatives.join(', ')}.

Compare across:
- Pricing (per user, volume discounts)
- Features (unique capabilities)
- Integration ecosystem
- Enterprise readiness (security, compliance)
- Support quality
- Learning curve
- Community/resources

Return structured comparison matrix with final recommendation.`;

    const result = await getAi().models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return {
      comparisonMatrix: [], // Would parse from structured response
      recommendation: result.text
    };

  } catch (error) {
    console.error('Error generating competitor analysis:', error);
    throw new Error('Failed to generate competitor analysis');
  }
};
