import React from 'react';
import type { ChatSession } from '../types';

interface ChatHistoryProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ sessions, activeSessionId, onSelectSession }) => {
  return (
    <aside className="w-full h-full md:w-64 lg:w-72 bg-white/30 dark:bg-slate-800/30 border-r border-slate-200/80 dark:border-slate-700/80 flex flex-col">
      <div className="p-3 border-b border-slate-200/80 dark:border-slate-700/80">
        <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 px-1">Previous Chats</h2>
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
              className={`relative block px-3 py-2 text-sm rounded-md truncate font-medium transition-colors ${
                activeSessionId === session.id
                  ? 'text-indigo-800 dark:text-indigo-100'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
              }`}
            >
              {activeSessionId === session.id && (
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/70 dark:to-purple-900/70 rounded-md" />
              )}
              <span className="relative">{session.title}</span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default ChatHistory;