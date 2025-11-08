import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <h1 className="text-xl font-bold text-slate-800 dark:text-white">
        Executive AI Advisor
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Your personalized guide to AI-powered productivity.
      </p>
    </header>
  );
};

export default Header;