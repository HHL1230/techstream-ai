interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const key = params.key as string;

  if (!key) {
    return new Response(JSON.stringify({ error: "Key is required" }), { status: 400 });
  }

  try {
    const { results } = await env.DB.prepare(
      "SELECT value FROM kv_store WHERE key = ?"
    ).bind(key).all();

    if (results.length === 0) {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }

    return new Response(results[0].value as string, {
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

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const key = params.key as string;

  if (!key) {
    return new Response(JSON.stringify({ error: "Key is required" }), { status: 400 });
  }

  try {
    const value = await request.text();
    
    await env.DB.prepare(
      "INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    ).bind(key, value).run();

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  const key = params.key as string;

  if (!key) {
    return new Response(JSON.stringify({ error: "Key is required" }), { status: 400 });
  }

  try {
    await env.DB.prepare(
      "DELETE FROM kv_store WHERE key = ?"
    ).bind(key).run();

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
};
