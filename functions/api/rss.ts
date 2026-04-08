export async function onRequestGet(context) {
  const url = new URL(context.request.url).searchParams.get("url");
  if (!url) {
    return new Response(JSON.stringify({ error: "URL is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
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
    return new Response(xml, {
      headers: { 
        "Content-Type": "application/xml",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error(`Proxy error for ${url}:`, error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
