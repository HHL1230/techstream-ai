
export interface Article {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  sourceName: string;
  sourceLink: string;
  imageUrl?: string;
}

export interface Comment {
  id: number;
  author: string;
  text: string;
  timestamp: string;
}

export interface GroupedArticles {
  [sourceName: string]: Article[];
}

export interface Translation {
  title: string;
  description: string;
}

export interface ComprehensiveSummaryItem {
  summary: string;
  links: {
    title: string;
    url: string;
  }[];
}

export type ComprehensiveSummaryData = ComprehensiveSummaryItem[];


export interface DailyNewsData {
  articles: Article[];
  rawFeeds: Record<string, string>;
  summary?: ComprehensiveSummaryData | null;
}

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}