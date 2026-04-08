
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { NewsList } from './components/NewsList';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ArchiveSidebar } from './components/ArchiveSidebar';
import { fetchAndParseFeeds } from './services/rssService';
import { Article, GroupedArticles, ComprehensiveSummaryData, UserProfile } from './types';
import { RSS_FEEDS, SUMMARY_KEY } from './constants';
import * as storageManager from './services/storageManager';
import { generateComprehensiveSummary } from './services/geminiService';

// Add window.google to the global window interface
declare global {
  interface Window {
    google: any;
  }
}

const getTodayDateKey = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
};

const formatDateForDisplay = (dateKey: string) => {
    if (dateKey.length !== 8) return "新聞";
    const year = dateKey.substring(0, 4);
    const month = dateKey.substring(4, 6);
    const day = dateKey.substring(6, 8);
    const date = new Date(`${year}-${month}-${day}T00:00:00`); // Avoid timezone issues
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

function jwtDecode(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode JWT", e);
        return null;
    }
}

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [rawFeeds, setRawFeeds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<string>('');
  
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateKey());
  const [archivedDates, setArchivedDates] = useState<string[]>([]);
  
  const [summary, setSummary] = useState<ComprehensiveSummaryData | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [user, setUser] = useState<UserProfile | null>(null);

  const handleLoginSuccess = useCallback((credentialResponse: any) => {
    const decoded: any = jwtDecode(credentialResponse.credential);
    if (decoded) {
        const userProfile: UserProfile = {
            name: decoded.name,
            email: decoded.email,
            picture: decoded.picture,
        };
        setUser(userProfile);
        storageManager.setUserProfile(userProfile);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    storageManager.removeUserProfile();
    if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
    }
  }, []);

  useEffect(() => {
    const savedUser = storageManager.getUserProfile();
    if (savedUser) {
        setUser(savedUser);
    }
  }, []);

  const generateAndCacheSummary = useCallback(async (dateKey: string, feeds: Record<string, string>) => {
    setIsGeneratingSummary(true);
    setSummaryError(null);
    try {
        const generatedSummary = await generateComprehensiveSummary(feeds);
        setSummary(generatedSummary);
        const currentData = storageManager.getNewsDataForDate(dateKey);
        if (currentData) {
            storageManager.setNewsDataForDate(dateKey, { ...currentData, summary: generatedSummary });
        }
    } catch (err: any) {
        console.error("Failed to generate summary", err);
        let errorMessage = '無法生成 AI 綜合彙整。';
        const errorString = err.toString();
        if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
            errorMessage = 'API 用量已達上限，請稍後再試。';
        }
        setSummaryError(errorMessage);
    } finally {
        setIsGeneratingSummary(false);
    }
  }, []);

  const handleRegenerateSummary = useCallback(async () => {
    if (rawFeeds && Object.keys(rawFeeds).length > 0) {
        await generateAndCacheSummary(selectedDate, rawFeeds);
    } else {
        setSummaryError("無法重新彙整：缺少原始新聞資料。");
        console.warn("Cannot regenerate summary: raw feeds are not available for the selected date.");
    }
  }, [generateAndCacheSummary, selectedDate, rawFeeds]);

  const loadArticlesForDate = useCallback(async (dateKey: string, forceRefresh: boolean = false) => {
      setLoading(true);
      setError(null);
      setArticles([]);
      setRawFeeds({});
      setActiveSource('');
      setSummary(null);
      setIsGeneratingSummary(false);
      setSummaryError(null);
      
      const cachedData = forceRefresh ? null : storageManager.getNewsDataForDate(dateKey);
      
      if (cachedData && cachedData.articles.length > 0) {
          setArticles(cachedData.articles);
          setRawFeeds(cachedData.rawFeeds || {});
          setSummary(cachedData.summary || null);
          setLoading(false);

          if (dateKey === getTodayDateKey() && !cachedData.summary && Object.keys(cachedData.rawFeeds || {}).length > 0) {
              generateAndCacheSummary(dateKey, cachedData.rawFeeds!);
          }

      } else if (dateKey === getTodayDateKey()) {
          try {
              const { articles: fetchedArticles, rawFeeds: fetchedRawFeeds } = await fetchAndParseFeeds(RSS_FEEDS);
              
              if (fetchedArticles.length === 0) {
                  setError('目前無法從新聞來源獲取資料，可能是網路連線或代理伺服器問題。請稍後再試或點擊重新整理。');
                  setLoading(false);
                  return;
              }

              const articlesWithIds = fetchedArticles.map((article, index) => ({
                  ...article,
                  id: `${article.link}-${index}-${dateKey}`,
              }));
              setArticles(articlesWithIds);
              setRawFeeds(fetchedRawFeeds);
              storageManager.setNewsDataForDate(dateKey, { articles: articlesWithIds, rawFeeds: fetchedRawFeeds, summary: null });
              setArchivedDates(storageManager.getArchivedDates());
              generateAndCacheSummary(dateKey, fetchedRawFeeds);
          } catch (err) {
              console.error(err);
              setError('載入新聞時發生錯誤。請檢查您的網路連線並重試。');
          } finally {
              setLoading(false);
          }
      } else {
          setError(`沒有 ${formatDateForDisplay(dateKey)} 的新聞資料。`);
          setLoading(false);
      }
      setSelectedDate(dateKey);
  }, [generateAndCacheSummary]);

  useEffect(() => {
    setArchivedDates(storageManager.getArchivedDates());
    loadArticlesForDate(getTodayDateKey());
  }, [loadArticlesForDate]);

  useEffect(() => {
    if (articles.length > 0 && selectedDate) {
      const currentData = storageManager.getNewsDataForDate(selectedDate) || { articles: [], rawFeeds: {} };
      storageManager.setNewsDataForDate(selectedDate, { ...currentData, articles, rawFeeds });
    }
  }, [articles, rawFeeds, selectedDate]);

  const groupedArticles = useMemo((): GroupedArticles => {
    return articles.reduce((acc: GroupedArticles, article: Article) => {
      const source = article.sourceName;
      if (!acc[source]) {
        acc[source] = [];
      }
      acc[source].push(article);
      return acc;
    }, {});
  }, [articles]);
  
  const sortedSources = useMemo(() => {
    const sources = Object.keys(groupedArticles).sort((a, b) => 
      groupedArticles[b].length - groupedArticles[a].length
    );
    if (articles.length > 0) {
      return [SUMMARY_KEY, ...sources];
    }
    return sources;
  }, [groupedArticles, articles.length]);

  useEffect(() => {
    if (sortedSources.length > 0 && !activeSource) {
      setActiveSource(SUMMARY_KEY);
    }
  }, [sortedSources, activeSource]);

  const handleDateSelect = (dateKey: string) => {
    loadArticlesForDate(dateKey);
  };

  return (
    <div className="min-h-screen bg-primary font-sans">
      <Header 
        user={user}
        onLogin={handleLoginSuccess}
        onLogout={handleLogout}
      />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-text-primary">
                        {formatDateForDisplay(selectedDate)} 的新聞
                    </h2>
                    {selectedDate === getTodayDateKey() && (
                        <button 
                            onClick={() => loadArticlesForDate(selectedDate, true)}
                            className="text-sm bg-accent2 text-white px-3 py-1 rounded-md hover:bg-accent2-hover transition-colors flex items-center"
                            disabled={loading}
                        >
                            <svg className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            重新整理
                        </button>
                    )}
                </div>
                {loading && <LoadingSpinner />}
                {error && (
                <div className="text-center text-error bg-error-bg border border-error-border p-4 rounded-lg">
                    <p className="font-semibold">發生錯誤</p>
                    <p>{error}</p>
                </div>
                )}
                {!loading && !error && articles.length > 0 && (
                    <NewsList 
                        groupedArticles={groupedArticles} 
                        activeSource={activeSource}
                        setActiveSource={setActiveSource}
                        sortedSources={sortedSources}
                        rawRssContent={rawFeeds[activeSource]}
                        summaryData={summary}
                        isGeneratingSummary={isGeneratingSummary}
                        summaryError={summaryError}
                        onRegenerateSummary={handleRegenerateSummary}
                    />
                )}
                 {!loading && !error && articles.length === 0 && (
                    <div className="bg-secondary text-center p-8 rounded-xl border border-border-color shadow-lg">
                        <p className="text-text-secondary">這天沒有新聞可顯示。</p>
                    </div>
                )}
            </div>

            <ArchiveSidebar 
                archivedDates={archivedDates}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
            />
        </div>
      </main>
    </div>
  );
};

export default App;