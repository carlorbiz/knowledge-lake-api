import React from 'react';
import { ChatSession } from '../types';
import { PlusIcon } from './icons';

interface ChatHistoryProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ sessions, activeSessionId, onSelectSession, onNewSession }) => {
  return (
    <aside className="w-full md:w-64 lg:w-72 bg-white/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          {sessions.map((session) => (
            <a
              key={session.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectSession(session.id);
              }}
              className={`block px-3 py-2 text-sm rounded-md truncate font-medium ${
                activeSessionId === session.id
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {session.title}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default ChatHistory;