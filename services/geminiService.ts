import { ComprehensiveSummaryData } from '../types';

export const summarizeText = async (title: string, content: string): Promise<string> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'summarize', title, content })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch from Gemini API");
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error calling Gemini Proxy:", error);
    throw error;
  }
};

export const translateArticle = async (title: string, description: string): Promise<{ title: string; description:string }> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'translate', title, description })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch from Gemini API");
    }

    const result = await response.json();
    return {
      title: result.translatedTitle,
      description: result.translatedDescription
    };
  } catch (error) {
    console.error("Error calling Gemini Proxy for translation:", error);
    throw error;
  }
};

export const generateComprehensiveSummary = async (rawFeeds: Record<string, string>): Promise<ComprehensiveSummaryData> => {
  try {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'comprehensive', rawFeeds })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch from Gemini API");
    }

    return await response.json() as ComprehensiveSummaryData;
  } catch (error) {
      console.error("Error calling Gemini Proxy for comprehensive summary:", error);
      throw error;
  }
};
