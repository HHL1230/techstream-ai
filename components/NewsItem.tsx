import React, { useState, useEffect, useRef } from 'react';
import { Article, Comment, Translation } from '../types';
import { CommentSection } from './CommentSection';
import { HeartIcon, CommentIcon, ExternalLinkIcon, SparklesIcon, TranslateIcon, ImageIcon } from './IconComponents';
import { summarizeText, translateArticle } from '../services/geminiService';
import * as storageManager from '../services/storageManager';

interface NewsItemProps {
  article: Article;
  canTranslate: boolean;
}

const ImagePlaceholder: React.FC = () => (
    <div className="w-full h-full bg-input rounded-lg aspect-video sm:aspect-square flex items-center justify-center shadow-inner">
        <ImageIcon className="w-10 h-10 text-text-secondary/30" />
    </div>
);

export const NewsItem: React.FC<NewsItemProps> = ({ article, canTranslate }) => {
  const [likes, setLikes] = useState(() => storageManager.getLikes(article.id));
  const [comments, setComments] = useState<Comment[]>(() => storageManager.getComments(article.id));
  const [showComments, setShowComments] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  // New state management for on-demand translation
  const [translation, setTranslation] = useState<Translation | null>(() => storageManager.getTranslation(article.id));
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(!!storageManager.getTranslation(article.id));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (itemRef.current) {
            observer.unobserve(itemRef.current);
          }
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.01
      }
    );

    const currentRef = itemRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const handleLike = () => {
    const newLikes = likes + 1;
    setLikes(newLikes);
    storageManager.setLikes(article.id, newLikes);
  };

  const handleAddComment = (text: string) => {
    const newComment: Comment = {
      id: Date.now(),
      author: '訪客',
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    const newComments = [...comments, newComment];
    setComments(newComments);
    storageManager.setComments(article.id, newComments);
  };

  const handleSummarize = async () => {
    if (summary) {
        setSummary(null);
        return;
    }
    setIsSummarizing(true);
    setSummaryError(null);
    try {
      const result = await summarizeText(article.title, article.description);
      setSummary(result);
    } catch (error: any) {
      console.error('Summarization failed:', error);
      let errorMessage = '無法生成摘要。請再試一次。';
      const errorString = error.toString();
      if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
          errorMessage = 'API 用量已達上限，請稍後再試。';
      }
      setSummaryError(errorMessage);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleTranslate = async () => {
    if (translation) {
      setShowTranslation(!showTranslation);
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);
    try {
      const result = await translateArticle(article.title, article.description);
      setTranslation(result);
      storageManager.setTranslation(article.id, result);
      setShowTranslation(true);
    } catch (error: any) {
      console.error('Translation failed:', error);
      let errorMessage = '無法翻譯內容。請再試一次。';
      const errorString = error.toString();
      if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
          errorMessage = 'API 用量已達上限，請稍後再試。';
      }
      setTranslationError(errorMessage);
    } finally {
      setIsTranslating(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div ref={itemRef} className="group bg-secondary p-4 rounded-lg border border-border-color transition-shadow duration-300 hover:shadow-2xl min-h-[150px]">
      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="flex-shrink-0 w-full sm:w-48">
          {isVisible && (
            (article.imageUrl && !imageError) ? (
              <a 
                href={article.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={`Read more about ${article.title}`}
                className="block rounded-lg overflow-hidden shadow-md transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:scale-105"
              >
                <img
                  src={article.imageUrl}
                  alt=""
                  className="w-full h-full object-cover aspect-video sm:aspect-square"
                  loading="lazy"
                  onError={() => setImageError(true)}
                />
              </a>
            ) : (
              <ImagePlaceholder />
            )
          )}
        </div>
        <div className="flex flex-col flex-grow">
          <div className="flex justify-between items-start">
              <div className="flex-grow pr-2">
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-text-primary hover:text-accent transition-colors duration-200"
                  >
                    {showTranslation && translation ? translation.title : article.title}
                  </a>
              </div>
              <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent flex-shrink-0">
                  <ExternalLinkIcon className="w-5 h-5" />
              </a>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            {formatDate(article.pubDate)}
          </p>
          <div className="mt-3">
              {showTranslation && translation ? (
                <p className="text-text-secondary text-sm">{translation.description}</p>
              ) : (
                <p 
                    className="text-text-secondary text-sm"
                    dangerouslySetInnerHTML={{ __html: article.description }} 
                />
              )}
          </div>

          {isTranslating && (
              <div className="mt-4 p-3 bg-secondary rounded-md border border-border-color text-sm text-text-secondary animate-pulse">
                  翻譯中...
              </div>
          )}
          {translationError && <div className="mt-4 p-3 bg-error-bg text-error rounded-md border border-error-border text-sm">{translationError}</div>}


          {isSummarizing && (
              <div className="mt-4 p-3 bg-secondary rounded-md border border-border-color text-sm text-text-secondary animate-pulse">
                  正在生成 AI 摘要...
              </div>
          )}
          {summaryError && <div className="mt-4 p-3 bg-error-bg text-error rounded-md border border-error-border text-sm">{summaryError}</div>}
          {summary && (
              <div className="mt-4 p-3 bg-accent2/20 rounded-md border border-accent2/50 text-sm">
                  <p className="font-bold text-accent2 mb-2 flex items-center"><SparklesIcon className="w-4 h-4 mr-2" /> AI 摘要</p>
                  <p className="text-text-primary whitespace-pre-wrap">{summary}</p>
              </div>
          )}

          <div className="flex items-center space-x-6 mt-4 pt-3 border-t border-border-color">
            <button onClick={handleLike} className="flex items-center space-x-2 text-text-secondary hover:text-red-500 transition-colors duration-200">
              <HeartIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{likes}</span>
            </button>
            <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-2 text-text-secondary hover:text-accent transition-colors duration-200">
              <CommentIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{comments.length}</span>
            </button>
            <button onClick={handleSummarize} disabled={isSummarizing} className="flex items-center space-x-2 text-text-secondary hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
              <SparklesIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{summary ? '隱藏摘要' : '摘要'}</span>
            </button>
            {canTranslate && (
              <button onClick={handleTranslate} disabled={isTranslating} className="flex items-center space-x-2 text-text-secondary hover:text-accent2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                  <TranslateIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">
                      {isTranslating ? '翻譯中...' : (showTranslation ? '顯示原文' : '翻譯')}
                  </span>
              </button>
            )}
          </div>
        </div>
      </div>
      {showComments && <CommentSection comments={comments} onAddComment={handleAddComment} />}
    </div>
  );
};
