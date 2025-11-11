import React from 'react';

const tips = [
  "Tip: To convert Vera's formatting, copy the response, create a Google Doc, and use 'Paste Markdown'.",
  "Tip: Use the ACE framework for expert prompts: 'Act' as a role (e.g., experienced researcher), provide 'Context' (e.g., the Board requires a detailed report), and define 'Expectations' (e.g., draft a 2000-word literature review with 10 APA citations).",
  "Tip: Use 'Deep Thought' mode for complex strategic questions, like building a business case or comparing enterprise solutions."
];

const QuickTips: React.FC = () => {
  return (
    <div className="bg-slate-100/50 dark:bg-slate-900/50 py-1.5 overflow-hidden border-t border-slate-200 dark:border-slate-700">
      <div className="marquee">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {tips.join(' \u00A0 \u2022 \u00A0 ')}
        </span>
      </div>
    </div>
  );
};

export default QuickTips;