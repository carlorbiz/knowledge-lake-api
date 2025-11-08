import React from 'react';

interface SuggestedPromptsProps {
  onPromptClick: (prompt: string) => void;
  prompts?: string[];
  isInitial?: boolean;
}

const initialPrompts = [
  "What's the first thing I should do to protect my privacy with a new AI tool?",
  "How should I introduce myself to a new AI assistant for best results?",
  "Teach me an expert framework for writing effective AI prompts.",
  "Explain the real risks of using AI for my business.",
];

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onPromptClick, prompts = initialPrompts, isInitial = false }) => {
  return (
    <div className={`flex flex-col items-start gap-3 pl-12 animate-fade-in ${isInitial ? '' : 'mt-2'}`}>
       {isInitial && <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Here are a few ideas to get you started:</p>}
       {!isInitial && <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Next steps:</p>}
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptClick(prompt)}
            className="px-3 py-1.5 text-sm text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full hover:bg-indigo-50 dark:hover:bg-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 ease-in-out shadow-sm"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedPrompts;