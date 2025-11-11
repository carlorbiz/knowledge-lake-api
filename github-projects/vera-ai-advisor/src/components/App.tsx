import React, { useState, useEffect, useCallback } from 'react';
import type { ChatSession, Message } from '../types';
import { getChatResponse } from '../services/geminiService.ts';
import Header from './Header.tsx';
import ChatHistory from './ChatHistory.tsx';
import ChatInterface from './ChatInterface.tsx';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const savedSessions = localStorage.getItem('chatSessions');
      return savedSessions ? JSON.parse(savedSessions) : [];
    } catch (error) {
      return [];
    }
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  const [userInfo, setUserInfo] = useState<{ name: string | null }>(() => {
    try {
      const saved = localStorage.getItem('userInfo');
      return saved ? JSON.parse(saved) : { name: null };
    } catch {
      return { name: null };
    }
  });

  const [languageInfo, setLanguageInfo] = useState<{ language: string | null }>(() => {
    try {
      const saved = localStorage.getItem('languageInfo');
      return saved ? JSON.parse(saved) : { language: null };
    } catch {
      return { language: null };
    }
  });

  const [currencyInfo, setCurrencyInfo] = useState<{ currency: string | null }>(() => {
    try {
      const saved = localStorage.getItem('currencyInfo');
      return saved ? JSON.parse(saved) : { currency: null };
    } catch {
      return { currency: null };
    }
  });
  
  const [deepThoughtCount, setDeepThoughtCount] = useState<{ count: number; month: number }>(() => {
    try {
      const saved = localStorage.getItem('deepThoughtCount');
      if (saved) {
        const data = JSON.parse(saved);
        const currentMonth = new Date().getMonth();
        // Reset if the month has changed
        if (data.month !== currentMonth) {
          return { count: 3, month: currentMonth };
        }
        return data;
      }
    } catch (error) {
      // Fallback to default if parsing fails
    }
    return { count: 3, month: new Date().getMonth() };
  });

  useEffect(() => {
    try {
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
    } catch (error) {
      console.error("Could not save sessions to local storage", error);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } catch (error) {
      console.error("Could not save user info to local storage", error);
    }
  }, [userInfo]);

  useEffect(() => {
    try {
      localStorage.setItem('languageInfo', JSON.stringify(languageInfo));
    } catch (error) {
      console.error("Could not save language info to local storage", error);
    }
  }, [languageInfo]);

  useEffect(() => {
    try {
      localStorage.setItem('currencyInfo', JSON.stringify(currencyInfo));
    } catch (error) {
      console.error("Could not save currency info to local storage", error);
    }
  }, [currencyInfo]);

  useEffect(() => {
    try {
      localStorage.setItem('deepThoughtCount', JSON.stringify(deepThoughtCount));
    } catch (error) {
      console.error("Could not save deep thought count to local storage", error);
    }
  }, [deepThoughtCount]);

  useEffect(() => {
    if (sessions.length === 0) {
      handleNewSession();
    } else if (!activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
    
    if(activeSessionId && !sessions.find(s => s.id === activeSessionId)) {
        setActiveSessionId(sessions.length > 0 ? sessions[0].id : null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId, sessions]);


  const handleNewSession = useCallback(() => {
    const fullMessage = `To customise my responses to your unique situation, I'm keen to learn a little about your role and/or the types of AI functions and features we can explore together.`;
      
    const initialMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      role: 'model',
      text: fullMessage
    };
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Conversation',
      messages: [initialMessage],
      createdAt: new Date(),
    };
    setSessions(prev => [newSession, ...prev.slice(0, 9)]);
    setActiveSessionId(newSession.id);
    setIsHistoryVisible(false);
  }, []);
  
  const handleSaveUserInfo = useCallback(async (name: string, language: string, currency: string) => {
    setIsSaving(true);
    setUserInfo({ name });
    setLanguageInfo({ language });
    setCurrencyInfo({ currency });
    // Simulate a save operation
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
  }, []);

  const handleSendMessage = useCallback(async (text: string, isThinkingMode: boolean) => {
    if (!activeSessionId) return;
    
    if (isThinkingMode) {
        if (deepThoughtCount.count <= 0) {
            // Optionally, show an alert to the user
            alert("You have used all your Deep Thought queries for this month.");
            return;
        }
        setDeepThoughtCount(prev => ({ ...prev, count: prev.count - 1 }));
    }

    const userMessage: Message = { id: `msg-${Date.now()}`, role: 'user', text };

    const sessionToUpdate = sessions.find(s => s.id === activeSessionId);
    if (!sessionToUpdate) return;
    
    const updatedMessages = [...sessionToUpdate.messages, userMessage];
    
    let updatedSession = { ...sessionToUpdate, messages: updatedMessages };

    if (sessionToUpdate.messages.filter((m: Message) => m.role === 'user').length === 0) {
        const newTitle = text.length > 50 ? text.substring(0, 47) + '...' : text;
        updatedSession.title = newTitle;
    }

    setSessions(prev =>
        prev.map(s => (s.id === activeSessionId ? updatedSession : s))
    );

    setIsLoading(true);

    const response = await getChatResponse(
      updatedSession,
      sessions,
      currencyInfo,
      userInfo.name,
      languageInfo.language,
      isThinkingMode
    );
    
    const modelMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        text: response.text,
        sources: response.sources,
        suggestedPrompts: response.suggestedPrompts,
    };

    setSessions(prev =>
        prev.map(s =>
            s.id === activeSessionId
            ? { ...s, messages: [...updatedMessages, modelMessage] }
            : s
        )
    );
    
    setIsLoading(false);
  }, [activeSessionId, sessions, currencyInfo, userInfo.name, languageInfo.language, deepThoughtCount]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setIsHistoryVisible(false);
  }

  return (
    <div className="h-screen w-screen flex flex-col font-sans text-base text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-900 overflow-hidden">
      <div className="absolute inset-0 aurora-background z-0"></div>
      <div className="relative flex flex-col h-full w-full">
        <Header
          userInfo={userInfo}
          languageInfo={languageInfo}
          currencyInfo={currencyInfo}
          onSaveUserInfo={handleSaveUserInfo}
          isSaving={isSaving}
          onToggleHistory={() => setIsHistoryVisible(!isHistoryVisible)}
        />
        <div className="flex flex-1 overflow-hidden w-full max-w-7xl mx-auto min-w-0">
          <div className={`absolute top-0 left-0 h-full z-20 w-full max-w-xs transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:w-auto md:flex-shrink-0 ${isHistoryVisible ? 'translate-x-0 animate-slide-in' : '-translate-x-full'}`}>
            <ChatHistory
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={handleSelectSession}
            />
          </div>
          {isHistoryVisible && <div onClick={() => setIsHistoryVisible(false)} className="absolute inset-0 bg-black/50 z-10 md:hidden"></div>}
          <main className="flex-1 flex flex-col min-h-0 min-w-0 bg-slate-100/50 dark:bg-slate-900/50">
            <ChatInterface 
              session={activeSession}
              onSendMessage={handleSendMessage}
              onNewSession={handleNewSession}
              isLoading={isLoading}
              userLanguage={languageInfo.language}
              deepThoughtCount={deepThoughtCount.count}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
