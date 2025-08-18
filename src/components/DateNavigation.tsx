import React from 'react';
import { Button } from './ui/Button';
import { formatDate, getTodayString } from '../utils';

interface DateNavigationProps {
  projectId: string;
  entries: Array<{ id: string; date: string; createdAt: string }>;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onTodayClick: () => void;
  onBack?: () => void;
}

export const DateNavigation: React.FC<DateNavigationProps> = ({
  projectId,
  entries,
  selectedDate,
  onDateSelect,
  onTodayClick,
  onBack,
}) => {
  const today = getTodayString();
  
  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get unique dates from entries, excluding today
  const uniqueDates = Array.from(new Set(sortedEntries.map(entry => entry.date)))
    .filter(date => date !== today);

  return (
    <div className="w-64 bg-white border-r border-neutral-200 p-4 space-y-4 min-h-screen">
      {/* Navigation Section */}
      {onBack && (
        <div className="border-b border-neutral-200 pb-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-neutral-600 hover:text-neutral-900"
            onClick={onBack}
          >
            ← Back to Projects
          </Button>
        </div>
      )}

      {/* Timeline Section */}
      <div className="space-y-2">
        <h3 className="font-semibold text-neutral-900">Timeline</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onTodayClick}
          className={`w-full justify-start ${
            selectedDate === today ? 'text-primary-700' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Today
        </Button>
      </div>

      {uniqueDates.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-neutral-700 mb-2">Past Entries</h4>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {uniqueDates.map((date) => {
              const isSelected = selectedDate === date;
              const isToday = date === today;
              
              return (
                <Button
                  key={date}
                  variant="ghost"
                  size="sm"
                  onClick={() => onDateSelect(date)}
                  className={`w-full justify-start text-left h-auto py-2 px-3 ${
                    isSelected 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {isToday ? 'Today' : formatDate(date)}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {new Date(date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-neutral-500">
            No entries yet
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Start documenting your process
          </p>
        </div>
      )}
    </div>
  );
};
