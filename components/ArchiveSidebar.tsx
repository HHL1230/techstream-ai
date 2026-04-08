
import React from 'react';

interface ArchiveSidebarProps {
  archivedDates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const formatDateForDisplay = (dateKey: string) => {
    if (dateKey.length !== 8) return dateKey;
    const year = dateKey.substring(0, 4);
    const month = dateKey.substring(4, 6);
    const day = dateKey.substring(6, 8);
    return `${year}-${month}-${day}`;
};

export const ArchiveSidebar: React.FC<ArchiveSidebarProps> = ({ archivedDates, selectedDate, onSelectDate }) => {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0 lg:order-last">
      <div className="sticky top-24 bg-secondary p-4 rounded-xl border border-border-color shadow-lg">
        <h2 className="text-lg font-bold text-text-primary mb-4 border-b border-border-color pb-2">新聞封存</h2>
        {archivedDates.length > 0 ? (
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {archivedDates.map(dateKey => (
              <li key={dateKey}>
                <button
                  onClick={() => onSelectDate(dateKey)}
                  className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent2/50 ${
                    selectedDate === dateKey
                      ? 'bg-accent2 text-white shadow-md'
                      : 'text-text-secondary hover:bg-accent2/10 hover:text-accent2'
                  }`}
                  aria-pressed={selectedDate === dateKey}
                >
                  {formatDateForDisplay(dateKey)}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-secondary text-center py-4">沒有封存的新聞。</p>
        )}
      </div>
    </aside>
  );
};
