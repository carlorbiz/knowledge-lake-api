import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Message, ChatSession } from '../types';
import { SendIcon, AureliaIcon, ChevronDownIcon, PlusIcon, PaperclipIcon, PlayCircleIcon, StopCircleIcon, MicIcon, CopyIcon } from './icons.tsx';
import { marked } from 'marked';
import SuggestedPrompts from './SuggestedPrompts.tsx';
import QuickTips from './QuickTips.tsx';
import { generateSpeech, transcribeOnce } from '../services/geminiService.ts';
import { decode, decodeAudioData } from '../utils/audio.ts';

interface ChatInterfaceProps {
  session: ChatSession | null;
  onSendMessage: (message: string, isThinkingMode: boolean) => void;
  onNewSession: () => void;
  isLoading: boolean;
  userLanguage: string | null;
  deepThoughtCount: number;
}

interface AudioState {
    messageId: string | null;
    status: 'idle' | 'loading' | 'playing' | 'error';
}

interface ChatMessageProps {
    message: Message;
    onPlayAudio: (messageId: string, text: string) => void;
    audioState: AudioState;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onPlayAudio, audioState }) => {
  const isModel = message.role === 'model';
  const [showDetails, setShowDetails] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (isModel) {
    const detailsRegex = /\[details\]([\s\S]*)\[\/details\]/s;
    const match = message.text.match(detailsRegex);
    
    const mainText = match ? message.text.replace(detailsRegex, '').trim() : message.text;
    const detailsText = match ? match[1].trim() : null;

    const mainHtml = marked.parse(mainText, { gfm: true, breaks: true });
    const detailsHtml = detailsText ? marked.parse(detailsText, { gfm: true, breaks: true }) : null;

    const isLoadingAudio = audioState.status === 'loading' && audioState.messageId === message.id;
    const isPlayingAudio = audioState.status === 'playing' && audioState.messageId === message.id;

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
      <div className="flex items-start gap-3.5 animate-message-in">
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md">
          <AureliaIcon className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="max-w-3xl w-full p-4 rounded-2xl shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 text-slate-800 dark:text-slate-200 ring-1 ring-slate-200/50 dark:ring-slate-600/50">
          <div 
              className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-headings:font-bold prose-h1:text-lg prose-h2:text-base" 
              dangerouslySetInnerHTML={{ __html: mainHtml as string }} 
          />
          
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-x-4 gap-y-3">
            <button
                onClick={() => onPlayAudio(message.id, message.text)}
                disabled={isLoadingAudio}
                className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none ring-offset-2 ring-offset-white dark:ring-offset-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm"
            >
                {isLoadingAudio ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Generating...</span>
                    </>
                ) : isPlayingAudio ? (
                    <>
                        <StopCircleIcon className="w-4 h-4" />
                        <span>Stop Audio</span>
                    </>
                ) : (
                    <>
                        <PlayCircleIcon className="w-4 h-4" />
                        <span>Read Aloud</span>
                    </>
                )}
            </button>

            <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 focus:outline-none ring-offset-2 ring-offset-white dark:ring-offset-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm"
            >
                <CopyIcon className="w-4 h-4" />
                <span>{isCopied ? 'Copied!' : 'Copy'}</span>
            </button>

            {detailsHtml && (
                <div className="w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-600 sm:pl-4">
                    <button 
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 focus:outline-none ring-offset-2 ring-offset-white dark:ring-offset-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm"
                        aria-expanded={showDetails}
                    >
                        <span>{showDetails ? 'Show Less' : 'More Details'}</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            )}
          </div>

          {detailsHtml && showDetails && (
              <div 
                  className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 prose prose-sm dark:prose-invert max-w-none prose-p:my-2 animate-fade-in"
                  dangerouslySetInnerHTML={{ __html: detailsHtml as string }} 
              />
          )}

          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-600">
              <h4 className="text-xs font-semibold mb-1.5 opacity-80">Sources:</h4>
              <ul className="space-y-1">
                {message.sources.map((source, index) => (
                  <li key={index}>
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 dark:text-indigo-400 hover:underline truncate block">
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // User message
  return (
    <div className="flex items-start gap-3.5 justify-end animate-message-in">
      <div className="max-w-3xl p-3.5 rounded-2xl shadow-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};


const ChatInterface: React.FC<ChatInterfaceProps> = ({ session, onSendMessage, onNewSession, isLoading, userLanguage, deepThoughtCount }) => {
  const [input, setInput] = useState('');
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [audioState, setAudioState] = useState<AudioState>({ messageId: null, status: 'idle' });
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'transcribing' | 'error'>('idle');
  const [transcribedText, setTranscribedText] = useState('');
  const [canRecord, setCanRecord] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [session?.messages, isLoading]);

  useEffect(() => {
    try {
      const supported = typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia;
      setCanRecord(!!supported);
    } catch {
      setCanRecord(false);
    }
  }, []);

  const cleanupVoiceResources = useCallback(async () => {
    if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach(track => track.stop());
        microphoneStreamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch {}
    }
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
        cleanupVoiceResources();
    }
  }, [cleanupVoiceResources]);

  const handlePlayAudio = async (messageId: string, text: string) => {
    if (audioSourceRef.current) {
      audioSourceRef.current.onended = null;
      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }

    if (audioState.status === 'playing' && audioState.messageId === messageId) {
      setAudioState({ messageId: null, status: 'idle' });
      return;
    }

    setAudioState({ messageId, status: 'loading' });

    try {
      const base64Audio = await generateSpeech(text, userLanguage);
      if (!base64Audio) throw new Error("No audio data received from API.");

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        if (audioSourceRef.current === source) {
          setAudioState({ messageId: null, status: 'idle' });
          audioSourceRef.current = null;
        }
      };
      
      source.start();
      audioSourceRef.current = source;
      setAudioState({ messageId, status: 'playing' });

    } catch (err) {
      console.error("Error playing audio:", err);
      setAudioState({ messageId, status: 'error' });
      setTimeout(() => {
        setAudioState({ messageId: null, status: 'idle' });
      }, 3000);
    }
  };

  const handleStopRecording = useCallback(async () => {
    if (voiceState !== 'recording') return;

    setVoiceState('transcribing');
    
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } finally {
      // The onstop handler will do the transcription
    }
  }, [voiceState, cleanupVoiceResources]);

  const handleStartRecording = useCallback(async () => {
    if (voiceState !== 'idle') return;

    setTranscribedText('');

    try {
        microphoneStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        setVoiceState('recording');

        const mimeType = 'audio/webm';
        recordedChunksRef.current = [];
        const recorder = new MediaRecorder(microphoneStreamRef.current, { mimeType });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e: BlobEvent) => {
          if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          try {
            setVoiceState('transcribing');
            const blob = new Blob(recordedChunksRef.current, { type: mimeType });
            const transcript = await transcribeOnce(blob);
            if (transcript) {
              setInput(prev => (prev ? prev + ' ' : '') + transcript);
            }
          } catch (e) {
            console.error('Transcription failed:', e);
            setVoiceState('error');
            setTimeout(() => setVoiceState('idle'), 2000);
          } finally {
            await cleanupVoiceResources();
            setTranscribedText('');
            setVoiceState('idle');
          }
        };

        recorder.start(250);

    } catch (err) {
        console.error("Failed to start recording:", err);
        setVoiceState('error');
        setTimeout(() => setVoiceState('idle'), 2000);
    }
  }, [voiceState, handleStopRecording]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim(), isThinkingMode);
      setInput('');
    }
  };
  
  const handlePromptClick = (prompt: string) => {
    setInput('');
    onSendMessage(prompt, isThinkingMode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleFileUploadClick = () => {
      fileInputRef.current?.click();
  };

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 p-4 relative">
        <div className="absolute inset-0 aurora-background z-0"></div>
        <div className="relative z-10">
          <AureliaIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">Welcome to your AI Advisor</h2>
          <p className="max-w-md mt-2">Select a conversation from the left panel or start a new one to get started.</p>
        </div>
      </div>
    );
  }
  
  const lastModelMessage = session.messages.slice().reverse().find((m: Message) => m.role === 'model');
  const showInitialSuggestions = session.messages.length === 1 && session.messages[0].role === 'model';

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div className="absolute inset-0 aurora-background z-0"></div>
      <div className="relative z-10 flex flex-col h-full">
        <header className="p-4 border-b border-slate-200/80 dark:border-slate-700/80 bg-slate-100/50 dark:bg-slate-900/50">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white truncate">{session.title}</h2>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {session.messages.map((msg: Message) => (
            <ChatMessage key={msg.id} message={msg} audioState={audioState} onPlayAudio={handlePlayAudio} />
          ))}

          {showInitialSuggestions && <SuggestedPrompts onPromptClick={handlePromptClick} isInitial={true} />}
          
          {isLoading && (
              <div className="flex items-start gap-3.5 animate-message-in">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white">
                      <AureliaIcon className="w-8 h-8" />
                  </div>
                  <div className="max-w-xl p-3.5 rounded-2xl bg-white dark:bg-slate-700 ring-1 ring-slate-200/50 dark:ring-slate-600/50">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></div>
                      <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                  </div>
              </div>
          )}

          {!isLoading && lastModelMessage?.suggestedPrompts && lastModelMessage.suggestedPrompts.length > 0 && (
              <SuggestedPrompts prompts={lastModelMessage.suggestedPrompts} onPromptClick={handlePromptClick} />
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-200/80 dark:border-slate-700/80 bg-slate-100/80 dark:bg-slate-900/80 glass-effect">
          <div className='w-full px-4 py-4'>
            <div className="flex items-center gap-2">
                <button
                    onClick={onNewSession}
                    className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label="New Chat"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
                <div className="relative flex-1 input-glow-effect">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Aurelia..."
                        className="w-full pl-10 pr-28 py-2.5 bg-white/70 dark:bg-slate-700/70 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-0 focus:border-slate-400 dark:focus:border-slate-500 transition resize-y text-slate-900 dark:text-white shadow-sm"
                        rows={3}
                        style={{ minHeight: '80px', maxHeight: '200px' }}
                    />
                    <div className="absolute left-3 top-3">
                        <button onClick={handleFileUploadClick} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                            <PaperclipIcon className="w-5 h-5" />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" />
                    </div>
                    <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
                        {canRecord && (
                        <button
                          onMouseDown={handleStartRecording}
                          onMouseUp={handleStopRecording}
                          onMouseLeave={handleStopRecording}
                          onTouchStart={handleStartRecording}
                          onTouchEnd={handleStopRecording}
                          className={`p-2 rounded-full transition-colors ${
                            voiceState === 'recording' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500'
                          }`}
                          aria-label={voiceState === 'recording' ? 'Stop recording' : 'Start recording'}
                          title={voiceState === 'recording' 
                            ? 'Release to stop. We will transcribe once.' 
                            : 'Press and hold to record. Release to transcribe (one-shot STT).'}
                        >
                          <MicIcon className="w-5 h-5" />
                        </button>
                        )}
                        <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="p-2 rounded-full bg-indigo-600 text-white disabled:bg-slate-400 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                        <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
            {canRecord && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-center">
                Tip: Press and hold the mic to record; release to transcribe. We'll insert the transcript here for you to send.
              </p>
            )}
            <div className="flex items-center justify-center gap-4 mt-3">
              <label htmlFor="thinking-mode-toggle" className={`flex items-center group ${deepThoughtCount > 0 ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                  <div className="flex flex-col items-center">
                      <span className={`mr-2 text-xs font-medium ${deepThoughtCount > 0 ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>Deep Thought Mode</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 mr-2">
                        ({deepThoughtCount} left this month)
                      </span>
                  </div>
                  <div className="relative">
                      <input 
                        type="checkbox" 
                        id="thinking-mode-toggle" 
                        className="sr-only" 
                        checked={isThinkingMode} 
                        onChange={() => deepThoughtCount > 0 && setIsThinkingMode(!isThinkingMode)}
                        disabled={deepThoughtCount <= 0}
                      />
                      <div className={`block w-10 h-5 rounded-full transition ${isThinkingMode && deepThoughtCount > 0 ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'} ${deepThoughtCount <= 0 ? 'opacity-50' : ''}`}></div>
                      <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${isThinkingMode && deepThoughtCount > 0 ? 'translate-x-full' : ''}`}></div>
                  </div>
              </label>
            </div>
          </div>
          <QuickTips />
        </div>

        {voiceState !== 'idle' && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md flex flex-col items-center p-8 gap-4">
                    <MicIcon className={`w-12 h-12 ${voiceState === 'recording' ? 'text-red-500' : 'text-indigo-500'}`} />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {voiceState === 'recording' && "Listening..."}
                        {voiceState === 'transcribing' && "Transcribing..."}
                        {voiceState === 'error' && "Error"}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 min-h-[2.5em] text-center">
                        {voiceState === 'recording' && "Release to finish"}
                        {voiceState === 'error' && "Couldn't capture audio. Please check permissions."}
                    </p>
                    <p className="text-lg text-slate-700 dark:text-slate-300 w-full text-center border-t border-slate-200 dark:border-slate-600 pt-4 mt-2">{transcribedText}</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
