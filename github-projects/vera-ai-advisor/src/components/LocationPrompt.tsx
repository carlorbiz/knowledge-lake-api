import React, { useState, useEffect } from 'react';
import { currencies } from '../utils/currencies';
import type { Currency } from '../utils/currencies';
import { languages } from '../utils/languages';
import type { Language } from '../utils/languages';

interface PersonalizationFormProps {
  onSaveUserInfo: (name: string, language: string, currency: string) => void;
  isSaving: boolean;
  userInfo: { name: string | null };
  languageInfo: { language: string | null };
  currencyInfo: { currency: string | null };
}

const PersonalizationForm: React.FC<PersonalizationFormProps> = ({ onSaveUserInfo, isSaving, userInfo, languageInfo, currencyInfo }) => {
  const [name, setName] = useState(userInfo.name || '');
  const [language, setLanguage] = useState(languageInfo.language || '');
  const [currency, setCurrency] = useState(currencyInfo.currency || '');

  useEffect(() => {
      setName(userInfo.name || '');
      setLanguage(languageInfo.language || '');
      setCurrency(currencyInfo.currency || '');
  }, [userInfo, languageInfo, currencyInfo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSaving) {
      onSaveUserInfo(name.trim(), language, currency);
    }
  };

  return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
                 <label htmlFor="name-input" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Preferred Name
                </label>
                <input
                    id="name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Jane"
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    disabled={isSaving}
                />
            </div>
            <div>
                 <label htmlFor="language-select" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Preferred Language
                </label>
                <select
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    disabled={isSaving}
                >
                    <option value="">Select language</option>
                    {languages.map((l: Language) => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
            </div>
            <div className='col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2'>
                 <label htmlFor="currency-select" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Currency (optional - for ROI calculations)
                </label>
                <select
                    id="currency-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    disabled={isSaving}
                >
                    <option value="">Select currency</option>
                    {currencies.map((c: Currency) => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                </select>
            </div>
        </div>
        <div className="flex justify-end">
            <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors text-sm"
            >
            {isSaving ? 'Saving...' : 'Update Preferences'}
            </button>
        </div>
      </form>
  );
};

export default PersonalizationForm;