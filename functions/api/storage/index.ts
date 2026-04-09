interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const prefix = url.searchParams.get("prefix");

  try {
    let results: any[];
    if (prefix) {
      const res = await env.DB.prepare(
        "SELECT key FROM kv_store WHERE key LIKE ?"
      ).bind(`${prefix}%`).all();
      results = res.results;
    } else {
      const res = await env.DB.prepare(
        "SELECT key FROM kv_store"
      ).all();
      results = res.results;
    }
    
    // Extract just the keys
    const keys = results.map((row: any) => row.key);

    return new Response(JSON.stringify(keys), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
};
