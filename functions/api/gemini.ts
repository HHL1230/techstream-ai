import { GoogleGenAI, Type } from "@google/genai";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function retryWithBackoff(fn, retries = 3, delay = 1000, jitter = 200) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (error.toString().includes('429') || error.toString().includes('RESOURCE_EXHAUSTED')) {
        if (i < retries - 1) {
          const backoffDelay = delay * Math.pow(2, i) + Math.random() * jitter;
          console.warn(`Rate limit hit. Retrying in ${Math.round(backoffDelay)}ms...`);
          await sleep(backoffDelay);
        }
      } else {
        throw error;
      }
    }
  }
  throw lastError;
}

export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const apiKey = env.API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : undefined);

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Gemini API key is not configured." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    if (body.action === 'summarize') {
      const prompt = `
        請針對以下科技新聞文章，提供一段簡潔、中立的繁體中文摘要。
        請專注於關鍵資訊和發布的內容。

        標題: "${body.title}"
        
        文章內容: "${body.content}"

        摘要:
      `;

      const response = await retryWithBackoff(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      }));
      
      const summaryText = response.text;
      if (!summaryText) {
        throw new Error("Received an empty response from Gemini API.");
      }
      
      return new Response(JSON.stringify({ result: summaryText.trim() }), {
        headers: { "Content-Type": "application/json" }
      });
      
    } else if (body.action === 'translate') {
      const prompt = `Translate the following title and description to Traditional Chinese.
      Title: "${body.title}"
      Description: "${body.description}"
      `;

      const response = await retryWithBackoff(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    translatedTitle: {
                        type: Type.STRING,
                        description: 'The translated title in Traditional Chinese.'
                    },
                    translatedDescription: {
                        type: Type.STRING,
                        description: 'The translated description in Traditional Chinese.'
                    }
                },
                required: ['translatedTitle', 'translatedDescription']
            },
        },
      }));
      
      const jsonString = response.text.trim();
      if (!jsonString) {
        throw new Error("Received an empty response from Gemini API.");
      }
      
      return new Response(jsonString, {
        headers: { "Content-Type": "application/json" }
      });

    } else if (body.action === 'comprehensive') {
      const feedContent = Object.entries(body.rawFeeds)
        .map(([sourceName, xml]) => `--- START ${sourceName} RSS --- \n${xml}\n--- END ${sourceName} RSS ---`)
        .join('\n\n');

      const prompt = `
          你是一位專業的科技新聞編輯。請分析以下來自多個來源的 RSS feed 內容（XML 格式）。
          你的任務是：
          1. 找出被兩個或更多新聞來源共同報導的關鍵新聞事件或主題。
          2. 針對每一個共同報導的事件，撰寫一段約 50-100 字的繁體中文摘要。摘要需中立、客觀地整合各方資訊。
          3. 彙整最多 5 個這樣的事件。如果沒有任何被重複報導的事件，則返回空陣列。
          4. 為每個事件摘要附上所有相關的原始文章連結與標題。

          請嚴格只根據我提供的 RSS 內容進行分析，不要添加外部資訊。

          RSS Feeds 內容:
          ${feedContent}
      `;

      const response = await retryWithBackoff(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                description: "一個包含最多五個綜合新聞摘要的陣列。",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        summary: {
                            type: Type.STRING,
                            description: '關於此新聞事件的繁體中文摘要。'
                        },
                        links: {
                            type: Type.ARRAY,
                            description: '與此事件相關的原始文章連結列表。',
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: {
                                        type: Type.STRING,
                                        description: '原始文章的標題。'
                                    },
                                    url: {
                                        type: Type.STRING,
                                        description: '原始文章的 URL 連結。'
                                    }
                                },
                                required: ['title', 'url']
                            }
                        }
                    },
                    required: ['summary', 'links']
                },
            },
        },
      }));

      const jsonString = response.text.trim();
      if (!jsonString) {
        throw new Error("Received an empty response from Gemini API for summary.");
      }
      
      return new Response(jsonString, {
        headers: { "Content-Type": "application/json" }
      });
      
    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400 });
    }
  } catch (error) {
    console.error("Error in gemini endpoint:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
