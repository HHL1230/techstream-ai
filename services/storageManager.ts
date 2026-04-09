
import { Comment, Translation, Article, DailyNewsData, UserProfile } from '../types';

const LIKES_PREFIX = 'techstream_likes_';
const COMMENTS_PREFIX = 'techstream_comments_';
const TRANSLATION_PREFIX = 'techstream_translation_';
const ARTICLES_PREFIX = 'techstream_articles_';
const USER_PROFILE_KEY = 'techstream_user_profile';

const fetchGet = async (key: string): Promise<any> => {
  try {
    const res = await fetch(`/api/storage/${key}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    return null;
  }
};

const fetchPut = async (key: string, value: any): Promise<void> => {
  try {
    await fetch(`/api/storage/${key}`, {
      method: "PUT",
      body: JSON.stringify(value)
    });
  } catch (error) {
    console.error(`Error putting ${key}:`, error);
  }
};

const fetchDelete = async (key: string): Promise<void> => {
  try {
    await fetch(`/api/storage/${key}`, {
      method: "DELETE"
    });
  } catch (error) {
    console.error(`Error deleting ${key}:`, error);
  }
};

// User Profile Management
export const setUserProfile = async (profile: UserProfile): Promise<void> => {
  await fetchPut(USER_PROFILE_KEY, profile);
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  return await fetchGet(USER_PROFILE_KEY);
};

export const removeUserProfile = async (): Promise<void> => {
  await fetchDelete(USER_PROFILE_KEY);
};

// Likes Management
export const getLikes = async (articleId: string): Promise<number> => {
  const likes = await fetchGet(`${LIKES_PREFIX}${articleId}`);
  return typeof likes === 'number' ? likes : 0;
};

export const setLikes = async (articleId: string, likes: number): Promise<void> => {
  await fetchPut(`${LIKES_PREFIX}${articleId}`, likes);
};

// Comments Management
export const getComments = async (articleId: string): Promise<Comment[]> => {
  const comments = await fetchGet(`${COMMENTS_PREFIX}${articleId}`);
  return Array.isArray(comments) ? comments : [];
};

export const setComments = async (articleId: string, comments: Comment[]): Promise<void> => {
  await fetchPut(`${COMMENTS_PREFIX}${articleId}`, comments);
};

// Translation Management
export const getTranslation = async (articleId: string): Promise<Translation | null> => {
  return await fetchGet(`${TRANSLATION_PREFIX}${articleId}`);
};

export const setTranslation = async (articleId: string, translation: Translation): Promise<void> => {
  await fetchPut(`${TRANSLATION_PREFIX}${articleId}`, translation);
};

// Article & RSS Caching Management
export const getNewsDataForDate = async (dateKey: string): Promise<DailyNewsData | null> => {
    const parsedData = await fetchGet(`${ARTICLES_PREFIX}${dateKey}`);
    if (!parsedData) return null;
    
    // Backward compatibility for old format
    if (Array.isArray(parsedData)) {
        return {
            articles: parsedData,
            rawFeeds: {}
        };
    }
    return parsedData as DailyNewsData;
};

export const setNewsDataForDate = async (dateKey: string, data: DailyNewsData): Promise<void> => {
    await fetchPut(`${ARTICLES_PREFIX}${dateKey}`, data);
};

export const getArchivedDates = async (): Promise<string[]> => {
    try {
        const res = await fetch(`/api/storage?prefix=${ARTICLES_PREFIX}`);
        if (!res.ok) return [];
        const keys: string[] = await res.json();
        
        return keys.map(key => key.replace(ARTICLES_PREFIX, ''))
            .sort((a, b) => b.localeCompare(a));
    } catch (error) {
        console.error("Failed to get archived dates", error);
        return [];
    }
};