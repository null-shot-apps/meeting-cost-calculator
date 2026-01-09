'use client';

import { useMeetingStore } from '@/store/meetingStore';
import { formatCurrency, formatTime } from '@/lib/utils';

type MeetingHistoryProps = {
  onClose: () => void;
};

export function MeetingHistory({ onClose }: MeetingHistoryProps) {
  const { history, deleteHistoryItem, clearHistory } = useMeetingStore();

  const totalSpent = history.reduce((sum, meeting) => sum + meeting.finalCost, 0);
  const mostExpensive = history.length > 0
    ? history.reduce((max, meeting) => (meeting.finalCost > max.finalCost ? meeting : max))
    : null;
  const averageCost = history.length > 0 ? totalSpent / history.length : 0;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className=\"fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50\" onClick={onClose}>
      <div
        className=\"bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl sm:max-h-[90vh] overflow-y-auto\"
        onClick={(e) => e.stopPropagation()}
      >
        <div className=\"sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between\">
          <h2 className=\"text-2xl font-bold text-slate-900 dark:text-white\">Meeting History</h2>
          <button
            onClick={onClose}
            className=\"p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors\"
          >
            <svg className=\"w-6 h-6 text-slate-500\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
              <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M6 18L18 6M6 6l12 12\" />
            </svg>
          </button>
        </div>

        <div className=\"p-6\">
          {history.length === 0 ? (
            <div className=\"text-center py-12\">
              <svg className=\"w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
                <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z\" />
              </svg>
              <p className=\"text-slate-600 dark:text-slate-400 mb-2\">No meeting history yet</p>
              <p className=\"text-sm text-slate-500 dark:text-slate-500\">
                Your completed meetings will appear here
              </p>
            </div>
          ) : (
            <>
              {/* Statistics */}
              <div className=\"grid grid-cols-3 gap-4 mb-6\">
                <div className=\"bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4\">
                  <div className=\"text-xs text-slate-600 dark:text-slate-400 mb-1\">Total Spent</div>
                  <div className=\"text-lg font-bold text-slate-900 dark:text-white\">
                    {formatCurrency(totalSpent)}
                  </div>
                </div>
                <div className=\"bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4\">
                  <div className=\"text-xs text-slate-600 dark:text-slate-400 mb-1\">Meetings</div>
                  <div className=\"text-lg font-bold text-slate-900 dark:text-white\">
                    {history.length}
                  </div>
                </div>
                <div className=\"bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4\">
                  <div className=\"text-xs text-slate-600 dark:text-slate-400 mb-1\">Avg Cost</div>
                  <div className=\"text-lg font-bold text-slate-900 dark:text-white\">
                    {formatCurrency(averageCost)}
                  </div>
                </div>
              </div>

              {mostExpensive && (
                <div className=\"mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl\">
                  <div className=\"flex items-center gap-2 mb-2\">
                    <svg className=\"w-5 h-5 text-orange-600 dark:text-orange-400\" fill=\"currentColor\" viewBox=\"0 0 20 20\">
                      <path d=\"M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z\" />
                    </svg>
                    <span className=\"text-sm font-semibold text-orange-900 dark:text-orange-300\">
                      Most Expensive Meeting
                    </span>
                  </div>
                  <div className=\"text-2xl font-bold text-orange-600 dark:text-orange-400\">
                    {formatCurrency(mostExpensive.finalCost)}
                  </div>
                  <div className=\"text-sm text-orange-800 dark:text-orange-300 mt-1\">
                    {mostExpensive.name} • {formatDate(mostExpensive.date)}
                  </div>
                </div>
              )}

              {/* Clear History Button */}
              <div className=\"flex justify-end mb-4\">
                <button
                  onClick={() => {
                    if (confirm('Clear all meeting history? This cannot be undone.')) {
                      clearHistory();
                    }
                  }}
                  className=\"px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors\"
                >
                  Clear All History
                </button>
              </div>

              {/* Meeting List */}
              <div className=\"space-y-3\">
                {history.map((meeting) => (
                  <div
                    key={meeting.id}
                    className=\"bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors\"
                  >
                    <div className=\"flex items-start justify-between mb-2\">
                      <div className=\"flex-1\">
                        <h3 className=\"font-semibold text-slate-900 dark:text-white mb-1\">
                          {meeting.name}
                        </h3>
                        <div className=\"flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400\">
                          <span className=\"flex items-center gap-1\">
                            <svg className=\"w-4 h-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
                              <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z\" />
                            </svg>
                            {formatTime(meeting.duration)}
                          </span>
                          <span className=\"flex items-center gap-1\">
                            <svg className=\"w-4 h-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
                              <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z\" />
                            </svg>
                            {meeting.attendeeCount} attendees
                          </span>
                        </div>
                        <div className=\"text-xs text-slate-500 dark:text-slate-400 mt-1\">
                          {formatDate(meeting.date)}
                        </div>
                      </div>
                      <div className=\"text-right\">
                        <div className=\"text-xl font-bold text-slate-900 dark:text-white\">
                          {formatCurrency(meeting.finalCost)}
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Delete this meeting from history?')) {
                              deleteHistoryItem(meeting.id);
                            }
                          }}
                          className=\"mt-2 p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors\"
                        >
                          <svg className=\"w-4 h-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
                            <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16\" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Efficiency Badge */}
                    {meeting.duration < 600 && (
                      <div className=\"mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium\">
                        <span>📧</span>
                        <span>Could have been an email</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

