import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatSession } from '../types';
import { SendIcon, BotIcon } from './icons';
import VoiceInterface from './VoiceInterface';
import { marked } from 'marked';
import LocationPrompt from './LocationPrompt';
import SuggestedPrompts from './SuggestedPrompts';

interface ChatInterfaceProps {
  session: ChatSession | null;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  userInfo: { name: string | null };
  currencyInfo: { currency: string | null };
  onSetUserInfoAndCurrency: (name: string, currency: string) => void;
  isSettingLocation: boolean;
}

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isModel = message.role === 'model';
  const htmlContent = isModel ? marked.parse(message.text, { gfm: true, breaks: true }) : null;
  
  return (
    <div className={`flex items-start gap-3.5 ${isModel ? '' : 'justify-end'}`}>
      {isModel && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow">
          <BotIcon className="w-5 h-5" />
        </div>
      )}
      <div className={`max-w-xl p-3.5 rounded-2xl shadow-sm ${isModel ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200' : 'bg-indigo-600 text-white'}`}>
        {isModel && htmlContent ? (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        ) : (
          <p className="whitespace-pre-wrap">{message.text}</p>
        )}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-600">
            <h4 className="text-xs font-semibold mb-1.5 opacity-80">Sources:</h4>
            <ul className="space-y-1">
              {message.sources.map((source, index) => (
                <li key={index}>
                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className={`text-xs ${isModel ? 'text-indigo-500 dark:text-indigo-400' : 'text-indigo-200'} hover:underline truncate block`}>
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
};


const ChatInterface: React.FC<ChatInterfaceProps> = ({ session, onSendMessage, isLoading, userInfo, currencyInfo, onSetUserInfoAndCurrency, isSettingLocation }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [session?.messages, isLoading]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };
  
  const handlePromptClick = (prompt: string) => {
    setInput('');
    onSendMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
        <p>Select a chat or start a new one.</p>
      </div>
    );
  }
  
  const lastModelMessage = session.messages.slice().reverse().find(m => m.role === 'model');

  const showInitialSuggestions = session.messages.length === 1 && session.messages[0].role === 'model';

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-800/50 min-h-0">
      <header className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm z-10">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{session.title}</h2>
      </header>

      {(!userInfo.name || !currencyInfo.currency) && (
        <LocationPrompt onSave={onSetUserInfoAndCurrency} isLoading={isSettingLocation} />
      )}
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {session.messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {showInitialSuggestions && <SuggestedPrompts onPromptClick={handlePromptClick} isInitial={true} />}
        
        {isLoading && (
            <div className="flex items-start gap-3.5">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    <BotIcon className="w-5 h-5" />
                </div>
                <div className="max-w-xl p-3.5 rounded-2xl bg-white dark:bg-slate-700">
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

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Vera about AI tools, pricing, or your business needs..."
            className="w-full pl-4 pr-28 py-2.5 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition resize-none text-slate-900 dark:text-white"
            rows={1}
            style={{ maxHeight: '120px' }}
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <VoiceInterface />
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
    </div>
  );
};

export default ChatInterface;