import { GoogleGenAI, Chat, GroundingChunk, GenerateContentResponse, Type } from "@google/genai";
import { Message, ChatSession } from '../types';

let ai: GoogleGenAI;

const getAi = () => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API key not found. Please set the API_KEY environment variable.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

const PRO_TRIGGERS = ['compare', 'roi', 'business case', 'team', 'enterprise', 'integrate', 'deploy'];
const SEARCH_TRIGGERS = ['latest', 'current', 'news', 'recent', 'today', 'update'];

const getModelForPrompt = (prompt: string) => {
  const lowerCasePrompt = prompt.toLowerCase();
  if (SEARCH_TRIGGERS.some(trigger => lowerCasePrompt.includes(trigger))) {
    return 'gemini-2.5-flash'; // With search
  }
  if (PRO_TRIGGERS.some(trigger => lowerCasePrompt.includes(trigger))) {
    return 'gemini-2.5-pro';
  }
  return 'gemini-2.5-flash-lite';
};

const summarizeChats = async (chatSessions: ChatSession[]): Promise<string> => {
  if (chatSessions.length === 0) return "";
  try {
    const historyToSummarize = chatSessions
      .slice(-5) // Summarize last 5 sessions
      .map(session => `Session "${session.title}":\n${session.messages.map(m => `${m.role}: ${m.text}`).join('\n')}`)
      .join('\n\n---\n\n');
      
    const prompt = `Based on the following chat history, summarize the user's key priorities, role, and interests. This summary will be used to provide context to another AI model. Be concise. History:\n\n${historyToSummarize}`;

    const response = await getAi().models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt
    });

    return `[User Priorities Summary: ${response.text}]`;
  } catch (error) {
    console.error("Error summarizing chats:", error);
    return "";
  }
};

const generateFollowUpPrompts = async (userQuery: string, modelResponse: string): Promise<string[]> => {
    try {
        const prompt = `Based on the user's question ("${userQuery}") and the model's answer ("${modelResponse}"), generate up to 3 concise, insightful, and actionable follow-up questions an executive might ask. Assume the user is smart but frustrated with technology and wants practical advice. Focus on "how-to" or "what's next" type questions.`;
        const result = await getAi().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
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
        console.error("Error generating follow-up prompts:", error);
        return [];
    }
};

export const getChatResponse = async (
    currentSession: ChatSession, 
    allSessions: ChatSession[],
    currencyInfo: { currency: string | null },
    userName: string | null
): Promise<{ text: string; sources?: { title: string; uri: string }[], suggestedPrompts?: string[] }> => {
  try {
    const ai = getAi();
    const lastUserMessage = currentSession.messages[currentSession.messages.length - 1];
    if (!lastUserMessage || lastUserMessage.role !== 'user') {
      throw new Error("Last message is not from user");
    }

    const modelName = getModelForPrompt(lastUserMessage.text);
    const useSearch = SEARCH_TRIGGERS.some(trigger => lastUserMessage.text.toLowerCase().includes(trigger));
    
    const contextSummary = await summarizeChats(allSessions.filter(s => s.id !== currentSession.id));
    
    let currencyInstruction = '';
    if (currencyInfo.currency) {
      currencyInstruction = `The user's preferred currency is ${currencyInfo.currency}. When discussing pricing, please use this currency.`;
    }

    let nameInstruction = '';
    if (userName) {
        nameInstruction = `The user's name is ${userName}. Address them by their name when appropriate to maintain a personal, conversational tone.`;
    }

    const systemInstruction = `You are an expert AI advisor named Vera, specializing in helping executives who are intelligent but often frustrated with technology. Your goal is to provide practical, actionable advice that solves real-world productivity challenges.
- **Tone**: Professional, empathetic, and reassuring. Acknowledge their potential frustrations. Avoid generic marketing language and tech jargon.
- **Method**: Instead of just explaining *what* something is, focus on *why* it matters to them and *how* they can use it. For example, if they see Markdown formatting (like ###), explain why it's there and then provide immediate, practical solutions for converting it for professional use (e.g., in Google Docs).
- **Prompting Expertise**: When advising on how to use specific AI tools like ChatGPT, provide expert-level prompt engineering advice. Emphasize that modern LLMs require clear guidance and that structured prompts including a **Role** (e.g., 'Act as a senior marketing strategist'), **Task** (what to do), **Context** (background info), and desired **Format** are essential for high-quality, specific outputs.
- **Engagement**: Always end your response with a horizontal line (using "---" in Markdown) and then a thoughtful, guiding question that anticipates their next step or concern. This keeps the conversation moving and helps you learn more about their specific needs.
- **Context**: Refer to the user's stated priorities from the summary and current conversation to tailor your advice. Start simple and introduce complexity only when the user is ready.
- **Personalization**: ${nameInstruction} ${currencyInstruction} ${contextSummary}`;

    const chat: Chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction,
        ...(useSearch && { tools: [{ googleSearch: {} }] }),
      },
      history: currentSession.messages.slice(0, -1).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })),
    });

    const result: GenerateContentResponse = await chat.sendMessage({ message: lastUserMessage.text });
    
    const text = result.text;

    const suggestedPrompts = await generateFollowUpPrompts(lastUserMessage.text, text);
    
    const groundingMetadata = result.candidates?.[0]?.groundingMetadata;

    let sources: { title: string; uri: string }[] = [];
    if (groundingMetadata?.groundingChunks) {
        sources = (groundingMetadata.groundingChunks as GroundingChunk[])
            .map(chunk => chunk.web)
            .filter(web => web?.uri && web?.title)
            .map(web => ({ uri: web!.uri!, title: web!.title! }));
    }

    return { text, sources: sources.length > 0 ? sources : undefined, suggestedPrompts };
  } catch (error) {
    console.error("Error getting chat response:", error);
    return { text: "I'm sorry, I encountered an error. Please try again." };
  }
};

export const connectLiveSession = (callbacks: any) => {
    const ai = getAi();
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: ['AUDIO'],
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: 'You are a friendly and helpful AI advisor for executives. Keep your answers concise and conversational.'
        }
    });
};