import React from 'react';
import { useLiveConversation } from '../hooks/useLiveConversation';
import { MicIcon } from './icons';

const VoiceInterface: React.FC = () => {
  const { isListening, transcript, error, startConversation, stopConversation } = useLiveConversation();

  const handleToggleListening = () => {
    if (isListening) {
      stopConversation();
    } else {
      startConversation();
    }
  };

  return (
    <>
      <button
        onClick={handleToggleListening}
        className={`p-2 rounded-full transition-colors ${
          isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500'
        }`}
        aria-label={isListening ? 'Stop conversation' : 'Start conversation'}
      >
        <MicIcon className="w-5 h-5" />
      </button>

      {isListening && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl h-full max-h-[80vh] flex flex-col font-sans">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Live Conversation</h2>
               <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-red-500 font-medium">LISTENING</span>
               </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {transcript.history.map((line, index) => (
                <p key={index} className={`text-lg ${line.startsWith('You:') ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                  {line}
                </p>
              ))}
              {transcript.user && <p className="text-lg text-slate-500 dark:text-slate-400 italic">You: {transcript.user}...</p>}
              {transcript.model && <p className="text-lg text-slate-900 dark:text-white italic">Advisor: {transcript.model}...</p>}
            </div>
            {error && <div className="p-4 text-center text-red-500 bg-red-100 dark:bg-red-900/50">{error}</div>}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-center">
              <button
                onClick={stopConversation}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                End Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceInterface;