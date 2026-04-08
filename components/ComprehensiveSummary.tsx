
import React from 'react';
import { ComprehensiveSummaryData } from '../types';
import { ExternalLinkIcon, SparklesIcon } from './IconComponents';

interface ComprehensiveSummaryProps {
  summaryData: ComprehensiveSummaryData | null;
  isLoading: boolean;
  error: string | null;
  onRegenerate: () => void;
}

export const ComprehensiveSummary: React.FC<ComprehensiveSummaryProps> = ({ summaryData, isLoading, error, onRegenerate }) => {
  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-10">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-10 w-10 text-accent2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg text-text-secondary mt-4">正在生成 AI 綜合彙整...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-error bg-error-bg border border-error-border p-4 rounded-lg my-8 mx-0">
          <p className="font-semibold">無法生成綜合彙整</p>
          <p>{error}</p>
        </div>
      );
    }

    if (!summaryData || summaryData.length === 0) {
      return (
        <div className="text-center text-text-secondary py-10">
          <p>沒有可供彙整的重複性新聞主題，或 AI 未能找到共同報導的事件。</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {summaryData.map((item, index) => (
          <div key={index} className="bg-primary/50 p-5 rounded-lg border border-border-color shadow-md transition-shadow hover:shadow-xl">
            <p className="text-text-primary mb-4 whitespace-pre-wrap">{item.summary}</p>
            <div>
              <h4 className="font-semibold text-sm text-text-secondary mb-2">相關來源：</h4>
              <ul className="space-y-2">
                {item.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-accent2 hover:underline hover:text-accent2-hover group"
                    >
                      <ExternalLinkIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{link.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h3 className="text-xl font-bold text-text-primary flex items-center">
          <SparklesIcon className="w-6 h-6 mr-2 text-accent2" />
          重點新聞彙整
        </h3>
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="bg-accent2 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent2-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          aria-label="重新產生綜合彙整"
        >
          <SparklesIcon className="w-4 h-4 mr-2" />
          重新彙整
        </button>
      </div>
      {renderBody()}
    </div>
  );
};
