'use client';

import { useMeetingStore } from '@/store/meetingStore';

type SettingsPanelProps = {
  onClose: () => void;
};

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const {
    overheadMultiplier,
    setOverheadMultiplier,
    currency,
    setCurrency,
    theme,
    setTheme,
    meeting,
  } = useMeetingStore();

  const frequencies = [
    { value: 'one-time', label: 'One-time' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  ];

  return (
    <div className=\"fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50\" onClick={onClose}>
      <div
        className=\"bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:max-h-[90vh] overflow-y-auto\"
        onClick={(e) => e.stopPropagation()}
      >
        <div className=\"sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between\">
          <h2 className=\"text-2xl font-bold text-slate-900 dark:text-white\">Settings</h2>
          <button
            onClick={onClose}
            className=\"p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors\"
          >
            <svg className=\"w-6 h-6 text-slate-500\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
              <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M6 18L18 6M6 6l12 12\" />
            </svg>
          </button>
        </div>

        <div className=\"p-6 space-y-6\">
          {/* Overhead Multiplier */}
          <div>
            <label className=\"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2\">
              Overhead Multiplier: {overheadMultiplier.toFixed(1)}x
            </label>
            <input
              type=\"range\"
              min=\"1\"
              max=\"2.5\"
              step=\"0.1\"
              value={overheadMultiplier}
              onChange={(e) => setOverheadMultiplier(parseFloat(e.target.value))}
              className=\"w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600\"
            />
            <div className=\"flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1\">
              <span>1.0x</span>
              <span>2.5x</span>
            </div>
            <p className=\"text-xs text-slate-500 dark:text-slate-400 mt-2\">
              Accounts for benefits, taxes, office costs, and equipment. Each $100K salary costs company ~${(100000 * overheadMultiplier / 1000).toFixed(0)}K
            </p>
          </div>

          {/* Currency */}
          <div>
            <label className=\"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2\">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className=\"w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500\"
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.name} ({curr.code})
                </option>
              ))}
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className=\"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2\">
              Theme
            </label>
            <div className=\"grid grid-cols-3 gap-2\">
              {(['light', 'dark', 'auto'] as const).map((themeOption) => (
                <button
                  key={themeOption}
                  onClick={() => setTheme(themeOption)}
                  className={`px-4 py-3 rounded-xl font-medium transition-colors capitalize ${
                    theme === themeOption
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {themeOption}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting Frequency (for projections) */}
          <div>
            <label className=\"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2\">
              Meeting Frequency
            </label>
            <select
              value={meeting.frequency}
              className=\"w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500\"
              disabled
            >
              {frequencies.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
            <p className=\"text-xs text-slate-500 dark:text-slate-400 mt-2\">
              Coming soon: Annual cost projections
            </p>
          </div>

          {/* Info Section */}
          <div className=\"p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl\">
            <h3 className=\"font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2\">
              <svg className=\"w-5 h-5\" fill=\"currentColor\" viewBox=\"0 0 20 20\">
                <path fillRule=\"evenodd\" d=\"M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z\" clipRule=\"evenodd\" />
              </svg>
              About Overhead
            </h3>
            <p className=\"text-sm text-blue-800 dark:text-blue-300\">
              The overhead multiplier accounts for the true cost of an employee beyond their salary, including benefits, taxes, office space, equipment, and other operational costs. A typical multiplier is 1.5x to 2x.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

