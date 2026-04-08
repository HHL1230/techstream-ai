
import { Comment, Translation, Article, DailyNewsData, UserProfile } from '../types';

const LIKES_PREFIX = 'techstream_likes_';
const COMMENTS_PREFIX = 'techstream_comments_';
const TRANSLATION_PREFIX = 'techstream_translation_';
const ARTICLES_PREFIX = 'techstream_articles_';
const USER_PROFILE_KEY = 'techstream_user_profile';

// User Profile Management
export const setUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Failed to set user profile in localStorage", error);
  }
};

export const getUserProfile = (): UserProfile | null => {
  try {
    const storedProfile = localStorage.getItem(USER_PROFILE_KEY);
    return storedProfile ? JSON.parse(storedProfile) : null;
  } catch (error) {
    console.error("Failed to get user profile from localStorage", error);
    return null;
  }
};

export const removeUserProfile = (): void => {
  try {
    localStorage.removeItem(USER_PROFILE_KEY);
  } catch (error) {
    console.error("Failed to remove user profile from localStorage", error);
  }
};


// Likes Management
export const getLikes = (articleId: string): number => {
  try {
    const storedLikes = localStorage.getItem(`${LIKES_PREFIX}${articleId}`);
    return storedLikes ? parseInt(storedLikes, 10) : 0;
  } catch (error) {
    console.error("Failed to get likes from localStorage", error);
    return 0;
  }
};

export const setLikes = (articleId: string, likes: number): void => {
  try {
    localStorage.setItem(`${LIKES_PREFIX}${articleId}`, likes.toString());
  } catch (error) {
    console.error("Failed to set likes in localStorage", error);
  }
};

// Comments Management
export const getComments = (articleId: string): Comment[] => {
  try {
    const storedComments = localStorage.getItem(`${COMMENTS_PREFIX}${articleId}`);
    return storedComments ? JSON.parse(storedComments) : [];
  } catch (error) {
    console.error("Failed to get comments from localStorage", error);
    return [];
  }
};

export const setComments = (articleId: string, comments: Comment[]): void => {
  try {
    localStorage.setItem(`${COMMENTS_PREFIX}${articleId}`, JSON.stringify(comments));
  } catch (error) {
    console.error("Failed to set comments in localStorage", error);
  }
};

// Translation Management
export const getTranslation = (articleId: string): Translation | null => {
  try {
    const storedTranslation = localStorage.getItem(`${TRANSLATION_PREFIX}${articleId}`);
    return storedTranslation ? JSON.parse(storedTranslation) : null;
  } catch (error) {
    console.error("Failed to get translation from localStorage", error);
    return null;
  }
};

export const setTranslation = (articleId: string, translation: Translation): void => {
  try {
    localStorage.setItem(`${TRANSLATION_PREFIX}${articleId}`, JSON.stringify(translation));
  } catch (error) {
    console.error("Failed to set translation in localStorage", error);
  }
};

// Article & RSS Caching Management
export const getNewsDataForDate = (dateKey: string): DailyNewsData | null => {
    try {
        const storedData = localStorage.getItem(`${ARTICLES_PREFIX}${dateKey}`);
        if (!storedData) return null;
        
        const parsedData = JSON.parse(storedData);

        // Backward compatibility for old format (which was just an object of articles)
        if (Array.isArray(parsedData)) {
            return {
                articles: parsedData,
                rawFeeds: {}
            };
        }

        return parsedData as DailyNewsData;
    } catch (error) {
        console.error("Failed to get news data from localStorage", error);
        return null;
    }
};

export const setNewsDataForDate = (dateKey: string, data: DailyNewsData): void => {
    try {
        localStorage.setItem(`${ARTICLES_PREFIX}${dateKey}`, JSON.stringify(data));
    } catch (error) {
        console.error("Failed to set news data in localStorage", error);
    }
};

export const getArchivedDates = (): string[] => {
    try {
        const keys = Object.keys(localStorage)
            .filter(key => key.startsWith(ARTICLES_PREFIX))
            .map(key => key.replace(ARTICLES_PREFIX, ''));
        
        // Sort dates descending (newest first)
        return keys.sort((a, b) => b.localeCompare(a));
    } catch (error) {
        console.error("Failed to get archived dates from localStorage", error);
        return [];
    }
};