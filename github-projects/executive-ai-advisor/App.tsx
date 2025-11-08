import React, { useState, useEffect, useCallback } from 'react';
import { ChatSession, Message } from './types';
import { getChatResponse } from './services/geminiService';
import Header from './components/Header';
import ChatHistory from './components/ChatHistory';
import ChatInterface from './components/ChatInterface';

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
  const [isSettingLocation, setIsSettingLocation] = useState(false);

  const [userInfo, setUserInfo] = useState<{ name: string | null }>(() => {
    try {
      const saved = localStorage.getItem('userInfo');
      return saved ? JSON.parse(saved) : { name: null };
    } catch {
      return { name: null };
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
      localStorage.setItem('currencyInfo', JSON.stringify(currencyInfo));
    } catch (error) {
      console.error("Could not save currency info to local storage", error);
    }
  }, [currencyInfo]);
  
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    }
    if(activeSessionId && !sessions.find(s => s.id === activeSessionId)) {
        setActiveSessionId(sessions.length > 0 ? sessions[0].id : null);
    }
  }, [activeSessionId, sessions]);


  const handleNewSession = useCallback(() => {
    const userName = userInfo.name;
    const greeting = userName
      ? `Hello ${userName}! I'm Vera, your Executive AI Advisor.`
      : "Hello! I'm Vera, your Executive AI Advisor.";
      
    const fullMessage = `${greeting} My priority is helping you find safe and effective productivity solutions through up-to-the-minute information about rapidly-evolving AI solutions. To customise my responses to your unique situation, please tell me a little about your role and/or the types of AI functions and features you are curious about.`;
      
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
  }, [userInfo.name]);
  
  const handleSetUserInfoAndCurrency = useCallback(async (name: string, currency: string) => {
    setIsSettingLocation(true);
    setUserInfo({ name });
    setCurrencyInfo({ currency });
    setIsSettingLocation(false);
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!activeSessionId) return;

    const userMessage: Message = { id: `msg-${Date.now()}`, role: 'user', text };

    const sessionToUpdate = sessions.find(s => s.id === activeSessionId);
    if (!sessionToUpdate) return;
    
    const updatedSessionForApi = {
        ...sessionToUpdate,
        messages: [...sessionToUpdate.messages, userMessage],
    };

    // Immediately update UI with user message
    setSessions(prev =>
        prev.map(s => (s.id === activeSessionId ? updatedSessionForApi : s))
    );
    
    // Set title if it's the first user message
    if (sessionToUpdate.messages.filter(m => m.role === 'user').length === 0) {
        const newTitle = text.length > 30 ? text.substring(0, 27) + '...' : text;
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title: newTitle } : s));
    }

    setIsLoading(true);

    const response = await getChatResponse(updatedSessionForApi, sessions, currencyInfo, userInfo.name);
    
    const modelMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        text: response.text,
        sources: response.sources,
        suggestedPrompts: response.suggestedPrompts,
    };

    // Final state update to add the model's message
    setSessions(prev =>
        prev.map(s =>
            s.id === activeSessionId
            ? { ...s, messages: [...s.messages, modelMessage] }
            : s
        )
    );
    
    setIsLoading(false);
  }, [activeSessionId, sessions, currencyInfo, userInfo.name]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  return (
    <div className="h-screen w-screen flex flex-col font-sans text-base text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-900">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <ChatHistory
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onNewSession={handleNewSession}
        />
        <main className="flex-1 flex flex-col min-h-0">
          <ChatInterface 
            session={activeSession}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            userInfo={userInfo}
            currencyInfo={currencyInfo}
            onSetUserInfoAndCurrency={handleSetUserInfoAndCurrency}
            isSettingLocation={isSettingLocation}
          />
        </main>
      </div>
    </div>
  );
};

export default App;