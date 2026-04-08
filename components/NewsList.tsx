
import React, { useState, useEffect } from 'react';
import { GroupedArticles, ComprehensiveSummaryData } from '../types';
import { NewsItem } from './NewsItem';
import { ComprehensiveSummary } from './ComprehensiveSummary';
import { ChevronDownIcon, SparklesIcon } from './IconComponents';
import { SUMMARY_KEY } from '../constants';

interface NewsListProps {
  groupedArticles: GroupedArticles;
  activeSource: string;
  setActiveSource: (source: string) => void;
  sortedSources: string[];
  rawRssContent?: string;
  summaryData: ComprehensiveSummaryData | null;
  isGeneratingSummary: boolean;
  summaryError: string | null;
  onRegenerateSummary: () => void;
}

export const NewsList: React.FC<NewsListProps> = ({ 
    groupedArticles, 
    activeSource, 
    setActiveSource, 
    sortedSources, 
    rawRssContent,
    summaryData,
    isGeneratingSummary,
    summaryError,
    onRegenerateSummary
}) => {
  const [showRss, setShowRss] = useState(false);

  useEffect(() => {
    setShowRss(false);
  }, [activeSource]);

  const renderContent = () => {
    if (activeSource === SUMMARY_KEY) {
      return (
        <ComprehensiveSummary 
          summaryData={summaryData}
          isLoading={isGeneratingSummary}
          error={summaryError}
          onRegenerate={onRegenerateSummary}
        />
      );
    }
    
    if (activeSource && groupedArticles[activeSource]) {
      return (
        <div className="p-4 md:p-6">
          {rawRssContent && (
            <div className="mb-6 border border-border-color rounded-lg shadow-sm">
              <button
                onClick={() => setShowRss(!showRss)}
                className="w-full text-left p-3 font-semibold text-text-primary bg-input rounded-t-lg hover:bg-border-color transition-colors flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-accent/50"
                aria-expanded={showRss}
              >
                <span>查看原始 RSS 內容 ({activeSource})</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${showRss ? 'rotate-180' : ''}`} />
              </button>
              {showRss && (
                <div className="p-4 bg-gray-800 text-gray-200 rounded-b-lg">
                  <pre className="whitespace-pre-wrap break-all text-xs max-h-80 overflow-auto font-mono">
                    <code>{rawRssContent}</code>
                  </pre>
                </div>
              )}
            </div>
          )}
          <div className="space-y-4">
            {groupedArticles[activeSource].map((article, index) => (
              <NewsItem key={article.id} article={article} canTranslate={index < 2} />
            ))}
          </div>
        </div>
      );
    }

    return <p className="text-center text-text-secondary py-8">請選擇一個新聞來源。</p>;
  };

  return (
    <div className="bg-secondary rounded-xl border border-border-color shadow-lg">
      <div className="border-b border-border-color p-4">
        <nav className="flex flex-wrap items-center gap-4">
          {sortedSources.map((source) => {
            if (source === SUMMARY_KEY) {
              return (
                <button
                  key={source}
                  onClick={() => setActiveSource(source)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-accent2/50 flex items-center ${
                    activeSource === source
                      ? 'bg-accent2 text-white shadow-xl scale-105'
                      : 'text-text-secondary hover:bg-accent2/10 hover:text-accent2 hover:shadow-lg hover:-translate-y-1'
                  }`}
                  aria-pressed={activeSource === source}
                >
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  綜合彙整
                </button>
              );
            }
            return (
              <button
                key={source}
                onClick={() => setActiveSource(source)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                  activeSource === source
                    ? 'bg-accent text-white shadow-xl scale-105'
                    : 'text-text-secondary hover:bg-accent/10 hover:text-accent hover:shadow-lg hover:-translate-y-1'
                }`}
                aria-pressed={activeSource === source}
              >
                {source}
              </button>
            );
          })}
        </nav>
      </div>
      {renderContent()}
    </div>
  );
};
