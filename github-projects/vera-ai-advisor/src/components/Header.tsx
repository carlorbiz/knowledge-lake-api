import React from 'react';
import PersonalizationForm from './LocationPrompt.tsx';
import { MenuIcon } from './icons.tsx';

interface HeaderProps {
  userInfo: { name: string | null };
  languageInfo: { language: string | null };
  currencyInfo: { currency: string | null };
  onSaveUserInfo: (name: string, language: string, currency: string) => void;
  isSaving: boolean;
  onToggleHistory: () => void;
}

const Header: React.FC<HeaderProps> = (props) => {
  return (
    <header className="sticky top-0 z-30 p-4 bg-slate-100/80 dark:bg-slate-900/80 glass-effect border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className='flex-shrink-0 flex items-start gap-3'>
                <button 
                  onClick={props.onToggleHistory}
                  className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md"
                  aria-label="Toggle chat history"
                >
                  <MenuIcon className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                      Executive AI Advisor
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mt-1">
                      Hello! I'm Aurelia, your Executive AI Advisor. My priority is helping you find safe and effective productivity solutions through up-to-the-minute information about rapidly-evolving AI solutions. To get us started, please share your preferred name, language and currency so I can tailor my answers accordingly.
                  </p>
                </div>
            </div>
            <div className="flex-shrink-0 w-full md:max-w-md">
                <PersonalizationForm 
                  onSaveUserInfo={props.onSaveUserInfo}
                  isSaving={props.isSaving}
                  userInfo={props.userInfo}
                  languageInfo={props.languageInfo}
                  currencyInfo={props.currencyInfo}
                />
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
