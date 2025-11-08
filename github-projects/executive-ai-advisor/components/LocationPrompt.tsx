import React, { useState } from 'react';
import { currencies } from '../utils/currencies';

interface LocationPromptProps {
  onSave: (name: string, currency: string) => void;
  isLoading: boolean;
}

const LocationPrompt: React.FC<LocationPromptProps> = ({ onSave, isLoading }) => {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && currency && !isLoading) {
      onSave(name.trim(), currency);
    }
  };

  return (
    <div className="p-4 bg-slate-100 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Welcome! To personalize your experience and provide relevant pricing, please tell us a bit about yourself.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
                 <label htmlFor="name-input" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    First Name
                </label>
                <input
                    id="name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Jane"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                />
            </div>
            <div className="md:col-span-1">
                 <label htmlFor="currency-select" className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Preferred Currency
                </label>
                <select
                    id="currency-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                >
                    <option value="" disabled>Select a currency</option>
                    {currencies.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                </select>
            </div>
            <div className="md:col-span-1 flex items-end">
                <button
                type="submit"
                disabled={isLoading || !name.trim() || !currency}
                className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                {isLoading ? 'Saving...' : 'Save and Continue'}
                </button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default LocationPrompt;