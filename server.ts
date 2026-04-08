import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Proxy for RSS feeds to bypass CORS and 403 blocks
  app.get("/api/rss", async (req, res) => {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });

      if (!response.ok) {
        throw new Error(`Status ${response.status}: ${response.statusText}`);
      }

      const xml = await response.text();
      res.set("Content-Type", "application/xml");
      res.send(xml);
    } catch (error: any) {
      console.error(`Proxy error for ${url}:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  app.use(express.json());

  app.post("/api/gemini", async (req, res) => {
    const body = req.body;
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is not configured locally." });
    }

    try {
      const { GoogleGenAI, Type } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      if (body.action === 'summarize') {
        const prompt = `請針對以下科技新聞文章，提供一段簡潔、中立的繁體中文摘要。\n請專注於關鍵資訊和發布的內容。\n\n標題: "${body.title}"\n文章內容: "${body.content}"\n\n摘要:`;
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
        res.json({ result: response.text?.trim() });
      } else if (body.action === 'translate') {
        const prompt = `Translate the following title and description to Traditional Chinese.\nTitle: "${body.title}"\nDescription: "${body.description}"`;
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    translatedTitle: { type: Type.STRING },
                    translatedDescription: { type: Type.STRING }
                },
                required: ['translatedTitle', 'translatedDescription']
            },
          },
        });
        res.json(JSON.parse(response.text?.trim() || "{}"));
      } else if (body.action === 'comprehensive') {
        const feedContent = Object.entries(body.rawFeeds).map(([name, xml]) => `--- START ${name} --- \n${xml}\n--- END ${name} ---`).join('\n\n');
        const prompt = `你是一位專業的科技新聞編輯。請分析以下來自多個來源的 RSS feed 內容（XML 格式）。\n你的任務是：\n1. 找出被兩個或更多新聞來源共同報導的關鍵新聞事件或主題。\n2. 針對每一個共同報導的事件，撰寫一段約 50-100 字的繁體中文摘要。摘要需中立、客觀地整合各方資訊。\n3. 彙整最多 5 個這樣的事件。如果沒有任何被重複報導的事件，則返回空陣列。\n4. 為每個事件摘要附上所有相關的原始文章連結與標題。\n請嚴格只根據我提供的 RSS 內容進行分析，不要添加外部資訊。\nRSS Feeds 內容:\n${feedContent}`;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING },
                            links: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: { title: { type: Type.STRING }, url: { type: Type.STRING } },
                                    required: ['title', 'url']
                                }
                            }
                        },
                        required: ['summary', 'links']
                    },
                },
            },
        });
        res.json(JSON.parse(response.text?.trim() || "[]"));
      } else {
        res.status(400).json({ error: "Unknown action" });
      }
    } catch (error: any) {
      console.error("Local Gemini Proxy Error:", error);
      res.status(500).json({ error: error.message || "Internal error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
