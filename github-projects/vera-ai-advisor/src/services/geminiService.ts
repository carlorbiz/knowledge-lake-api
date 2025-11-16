import { GoogleGenAI, Chat, GroundingChunk, GenerateContentResponse, Type, Modality, LiveServerMessage } from "@google/genai";
import type { Message, ChatSession } from '../types';

const getResponseText = (res: any): string => {
  try {
    if (typeof res?.text === 'string') return res.text as string;
    const t = res?.response?.text?.();
    if (typeof t === 'string') return t;
    // REST JSON shape via proxy
    const parts = res?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
      const txt = parts.map((p: any) => p?.text).filter(Boolean).join('\n');
      if (txt) return txt;
    }
  } catch {}
  return '';
};

const getErrorMessage = (err: any): string => {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err instanceof Error && err.message) return err.message;
  try {
    const msg = (err as any)?.message || (err as any)?.error?.message || (err as any)?.toString?.();
    if (msg) return String(msg);
  } catch {}
  return 'Unknown error';
};

const getAi = () => {
  const apiKey = import.meta.env.VITE_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error("API key not found. Please set VITE_API_KEY in your .env or Cloudflare Pages env.");
  }
  // Create a new instance every time to ensure the latest API key is used.
  return new GoogleGenAI({ apiKey });
};

const API_BASE = (import.meta as any).env?.VITE_API_BASE as string | undefined;

// Unified generateContent helper that uses a Cloudflare Worker proxy if configured.
async function gen(params: { model: string; contents: any; config?: any }): Promise<GenerateContentResponse | any> {
  if (API_BASE) {
    const res = await fetch(`${API_BASE.replace(/\/$/, '')}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: params.model, contents: params.contents, config: params.config }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Proxy error (${res.status}): ${errText}`);
    }
    // Return the raw JSON; callers will extract text safely via getResponseText
    return await res.json();
  }
  return await getAi().models.generateContent(params as any);
}

const SEARCH_TRIGGERS = ['latest', 'current', 'news', 'recent', 'today', 'update'];

const summarizeChats = async (chatSessions: ChatSession[]): Promise<string> => {
  if (chatSessions.length === 0) return "";
  try {
    const historyToSummarize = chatSessions
      .slice(-5) // Summarize last 5 sessions
      .map(session => `Session "${session.title}":\n${session.messages.map((m: Message) => `${m.role}: ${m.text}`).join('\n')}`)
      .join('\n\n---\n\n');
      
    const prompt = `Based on the following chat history, summarize the user's key priorities, role, and interests. This summary will be used to provide context to another AI model. Be concise. History:\n\n${historyToSummarize}`;

    const response = await gen({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const text = getResponseText(response);
    return `[User Priorities Summary: ${text}]`;
  } catch (error) {
    console.error("Error summarizing chats:", error);
    return "";
  }
};

const generateFollowUpPrompts = async (userQuery: string, modelResponse: string): Promise<string[]> => {
    try {
        const prompt = `Based on the user's question ("${userQuery}") and the model's answer ("${modelResponse}"), generate up to 3 concise, insightful, and actionable follow-up questions an executive might ask. Assume the user is smart but frustrated with technology and wants practical advice. Focus on "how-to" or "what's next" type questions.`;
        const result = await gen({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
        const jsonText = getResponseText(result);
        const json = JSON.parse(jsonText || '{}');
        return json.prompts || [];
    } catch (error) {
        console.error("Error generating follow-up prompts:", error);
        return [];
    }
};

const australianPersonaInstruction = `
- **Persona**: You are Aurelia, embodying the 'Aoede' persona. You are a highly educated Australian professional with warm, personable delivery. Speak with refined Australian accent - subtle blend of American, western European and British influences. Softer jaw movement than American English, more open than formal British. Professional warmth without exaggerated regional characteristics. No strong slang. No over-the-top vowel shifts. No stereotypes.
- **Delivery Specifications**: Your writing style should mirror a genuine conversational inflection as if speaking to valued colleague or respected client. Maintain professional authority with approachable warmth. Your language must be clear articulation for adult learning.
- **Critical Exclusions**: Avoid Australian slang (e.g., G'day, mate, fair dinkum), exaggerated vowel sounds or stereotypes, and informal cultural references. Maintain sophisticated professional standards. No sales language or marketing jargon.
`;

const usPersonaInstruction = `
- **Persona**: You are Aurelia, embodying the 'Aoede' persona. You are a highly educated professional with a warm, personable delivery. Let the natural, clear but breezy, and professional tone of the Aoede voice guide your delivery.
- **Delivery Specifications**: Your writing style should mirror a conversational inflection, as if speaking to a valued colleague or respected client. Maintain professional authority with approachable warmth. Your language must be clear and suitable for adult learning.
`;

const canadianPersonaInstruction = `
- **Persona**: You are Aurelia, embodying the 'Aoede' persona, speaking as a Canadian professional. Your delivery should be calm, clear, and professional, with a slightly "crisper" enunciation and a natural, steady pacing. The overall pitch should be slightly higher and more nasal than some American regional accents.
- **Delivery Specifications**: Your writing style should mirror a conversational inflection, as if speaking to a valued colleague or respected client. Maintain professional authority with approachable warmth. Your language must be clear and suitable for adult learning.
- **Phonetic Guidance for Word Choice**: When writing, choose words and phrasing that align with Canadian English phonetic features. For example, refer to the letter 'Z' as 'zed'.
`;

const britishPersonaInstruction = `
- **Persona**: You are Aurelia, embodying the 'Erinome' persona, speaking with a sophisticated, clear, and formal British English accent (Received Pronunciation). Your voice should be non-rhotic, meaning the 'r' sound at the end of words like 'car' or 'near' is not pronounced unless a vowel follows.
- **Delivery Specifications**: Your intonation is generally more varied and melodic than typical American English, with a tendency for sentences to finish with a falling intonation. Use vocabulary and phrasing typical of British English (e.g., 'lift' instead of 'elevator', 'flat' instead of 'apartment'). Maintain professional authority with approachable warmth. Your language must be clear and suitable for adult learning.
- **Phonetic Guidance for Word Choice**: Choose words and sentence structures that allow for distinctly British vowel sounds, such as the longer 'a' in 'bath' and 'grass', and a crisp, clear pronunciation of 't' sounds in words like 'water' or 'better'.
`;

const getPersonaInstruction = (languageCode: string | null): string => {
    switch (languageCode) {
        case 'en-US':
            return usPersonaInstruction;
        case 'en-CA':
            return canadianPersonaInstruction;
        case 'en-GB':
            return britishPersonaInstruction;
        case 'en-IN':
            return britishPersonaInstruction; // Using British RP as a close professional standard
        case 'en-AU':
        default:
            return australianPersonaInstruction;
    }
}

export const getChatResponse = async (
    currentSession: ChatSession, 
    allSessions: ChatSession[],
    currencyInfo: { currency: string | null },
    userName: string | null,
    userLanguage: string | null,
    isThinkingMode: boolean,
): Promise<{ text: string; sources?: { title: string; uri: string }[], suggestedPrompts?: string[] }> => {
  try {
    const ai = API_BASE ? null : getAi();
    const lastUserMessage = currentSession.messages[currentSession.messages.length - 1];
    if (!lastUserMessage || lastUserMessage.role !== 'user') {
      throw new Error("Last message is not from user");
    }

    const enableSearchFeature = !API_BASE && (import.meta as any)?.env?.VITE_ENABLE_SEARCH === 'true';
    const useSearch = enableSearchFeature && SEARCH_TRIGGERS.some(trigger => lastUserMessage.text.toLowerCase().includes(trigger));
    const modelName = 'gemini-2.5-flash';
    
    const contextSummary = await summarizeChats(allSessions.filter(s => s.id !== currentSession.id));
    
    let currencyInstruction = '';
    if (currencyInfo.currency) {
      currencyInstruction = `The user's preferred currency is ${currencyInfo.currency}. When discussing pricing, please use this currency.`;
    }

    let languageInstruction = '';
    if (userLanguage) {
        languageInstruction = `The user's preferred language is ${userLanguage}. Tailor your language, spelling (e.g., 'colour' for en-GB vs 'color' for en-US), and cultural references to be appropriate for that region.`;
    }

    let nameInstruction = '';
    if (userName) {
        nameInstruction = `The user's name is ${userName}. Address them by their name when appropriate to maintain a personal, conversational tone.`;
    }

    const systemInstruction = `You are an expert AI advisor named Aurelia, specializing in helping executives who are intelligent but often frustrated with technology. Your goal is to provide practical, actionable advice that solves real-world productivity challenges.
${getPersonaInstruction(userLanguage)}
- **Tone**: Professional, empathetic, and reassuring. Acknowledge their potential frustrations. Avoid generic marketing language and tech jargon.
- **Method**: Instead of just explaining *what* something is, focus on *why* it matters to them and *how* they can use it. For example, if they see Markdown formatting (like ###), explain why it's there and then provide immediate, practical solutions for converting it for professional use (e.g., in Google Docs).
- **Privacy First (Dual Context)**: Your #1 priority is protecting both the user's personal privacy and their company's data. When asked about privacy, address both the **personal** and **organizational** context unless the user specifies otherwise.
    - **For Personal Privacy**: Your immediate and primary answer **must** be this single, actionable step: Go to the AI tool's account settings and turn OFF any option that allows your conversations to be used for training. Tell the user to look for phrases like "Share data to improve the model," "Use my conversations for training," or "Data Controls," and to disable them immediately. This protects their direct interactions.
    - **For Organizational Responsibility**: Explain that as an executive, they also have a fiduciary duty to protect company data. Advise them to verify if the AI tool has an enterprise or business version with stronger data privacy guarantees, such as zero data retention for training, data processing agreements (DPAs), and compliance with standards like SOC 2 or GDPR. This is crucial before any team-wide adoption.
    - **Use Details Tag**: For secondary, less immediate information (like reading the full Terms of Service), wrap it in [details] tags. For example: [details]While it's not the most exciting part, a thorough review of the privacy policy and any available enterprise documentation will give you a complete picture of how your organization's data would be handled.[/details]
- **Prompting Expertise**: When advising on how to use specific AI tools like ChatGPT, provide expert-level prompt engineering advice. Emphasize that modern LLMs require clear guidance and that structured prompts including a **Role** (e.g., 'Act as a senior marketing strategist'), **Task** (what to do), **Context** (background info), and desired **Format** are essential for high-quality, specific outputs.
- **Engagement**: Always end your response with a horizontal line (using "---" in Markdown) and then a thoughtful, guiding question that anticipates their next step or concern. This keeps the conversation moving and helps you learn more about their specific needs.
- **Context**: Refer to the user's stated priorities from the summary and current conversation to tailor your advice. Start simple and introduce complexity only when the user is ready.
- **Personalization**: ${nameInstruction} ${currencyInstruction} ${languageInstruction} ${contextSummary}`;

    const config: any = {
      systemInstruction,
    };
    
    // Only enable search for the faster model and when not in thinking mode
    if (useSearch && !isThinkingMode) {
      config.tools = [{ googleSearch: {} }];
    }

    if (isThinkingMode) {
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    let text = '';
    let result: GenerateContentResponse | any;
    if (API_BASE) {
      // Use proxy path with explicit contents to preserve same behavior
      result = await gen({
        model: modelName,
        contents: [
          ...currentSession.messages.slice(0, -1).map((m: Message) => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: lastUserMessage.text }] },
        ],
        config,
      });
      text = getResponseText(result);
    } else {
      const chat: Chat = (ai as GoogleGenAI).chats.create({
        model: modelName,
        config,
        history: currentSession.messages.slice(0, -1).map((m: Message) => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
      });
      result = await chat.sendMessage({ message: lastUserMessage.text });
      text = getResponseText(result);
    }

    const suggestedPrompts = await generateFollowUpPrompts(lastUserMessage.text, text);
    
    const groundingMetadata = result?.candidates?.[0]?.groundingMetadata;

    let sources: { title: string; uri: string }[] = [];
    if (groundingMetadata?.groundingChunks) {
        sources = (groundingMetadata.groundingChunks as GroundingChunk[])
            .map(chunk => chunk.web)
            .filter(web => web?.uri && web?.title)
            .map(web => ({ uri: web!.uri!, title: web!.title! }));
    }

    return { text, sources: sources.length > 0 ? sources : undefined, suggestedPrompts };
  } catch (error) {
    const msg = getErrorMessage(error);
    console.error("Error getting chat response:", error);
    return { text: `I'm sorry, I encountered an error.\n\n[details]${msg}[/details]` };
  }
};

export const startTranscriptionSession = (callbacks: {
  onTranscriptionUpdate: (text: string) => void;
  onOpen: () => void;
  onError: (e: ErrorEvent) => void;
  onClose: () => void;
}) => {
    const ai = getAi();
    
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: callbacks.onOpen,
            onmessage: (message: LiveServerMessage) => {
                const t = (message as any)?.serverContent?.inputTranscription?.text;
                if (typeof t === 'string' && t.length > 0) {
                    callbacks.onTranscriptionUpdate(t);
                }
            },
            onerror: callbacks.onError,
            onclose: callbacks.onClose,
        },
        config: {
            inputAudioTranscription: {},
            // A response modality is required by the API, but we will ignore the audio output
            // and close the session immediately after the user finishes talking.
            responseModalities: [Modality.AUDIO],
        }
    });
};

export const generateSpeech = async (text: string, userLanguage: string | null): Promise<string | null> => {
    try {
        // const ai = getAi(); // Currently unused - for future implementation

        const persona = getPersonaInstruction(userLanguage)
            .replace(/- \*\*Persona\*\*: You are Aurelia, embodying the 'Aoede' persona./, '')
            .replace(/- \*\*Delivery Specifications\*\*:/, 'Your delivery should have these specifications:')
            .replace(/- \*\*Critical Exclusions\*\*:/, 'Critically, you must avoid:')
            .replace(/- \*\*Phonetic Guidance for Word Choice\*\*:/, 'For your word choice, be guided by these phonetics:')
            .trim();

        const cleanText = text
            .replace(/\[details\][\s\S]*\[\/details\]/s, '')
            .replace(/---/g, '')
            .replace(/###|##|#/g, '')
            .replace(/(\*|\-)\s/g, '')
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
            .trim();

        const prompt = `${persona}\n\nWith that persona in mind, please read the following text aloud at a normal, natural pace (not too fast, not too slow):\n\n"${cleanText}"`;

        const response = await gen({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Aoede' }, // Breezy voice
                    },
                },
            },
        });

        const base64Audio = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
};

// One-shot transcription via audio upload (HTTP). Accepts a browser Blob.
export const transcribeOnce = async (audioBlob: Blob): Promise<string> => {
    try {
        const arrayBuf = await audioBlob.arrayBuffer();
        const base64 = (() => {
            let binary = '';
            const bytes = new Uint8Array(arrayBuf);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
            return btoa(binary);
        })();

        const prompt = 'Transcribe the spoken content exactly as text. Do not summarize.';
        const mime = audioBlob.type || 'audio/webm';

        const response = await gen({
            model: 'gemini-2.5-flash',
            contents: [{
                role: 'user',
                parts: [
                    { inlineData: { data: base64, mimeType: mime } },
                    { text: prompt },
                ],
            }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { transcript: { type: Type.STRING } },
                },
            },
        });

        // Try to parse JSON first
        try {
            const text = getResponseText(response);
            const json = JSON.parse(text || '{}');
            if (json.transcript) return String(json.transcript);
        } catch {}

        // Fallback to plain text
        const fallback = getResponseText(response);
        return fallback || '';
    } catch (e) {
        console.error('Error in one-shot transcription:', e);
        return '';
    }
};
