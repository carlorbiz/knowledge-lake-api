export interface Env {
  GEMINI_API_KEY: string;
  ALLOWED_ORIGINS?: string;
}

function corsHeaders(origin: string | null, allowed: string | undefined) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (allowed && allowed.trim().length > 0) {
    const list = allowed.split(",").map(s => s.trim());
    if (origin && list.includes(origin)) headers["Access-Control-Allow-Origin"] = origin;
  } else {
    headers["Access-Control-Allow-Origin"] = origin ?? "*";
  }
  return headers;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin, env.ALLOWED_ORIGINS) });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin, env.ALLOWED_ORIGINS) },
      });
    }

    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Server misconfigured: missing GEMINI_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin, env.ALLOWED_ORIGINS) },
      });
    }

    if (url.pathname !== "/generate") {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin, env.ALLOWED_ORIGINS) },
      });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin, env.ALLOWED_ORIGINS) },
      });
    }

    const model = body?.model;
    const contents = body?.contents;
    const config = body?.config;
    if (!model || !contents) {
      return new Response(JSON.stringify({ error: "'model' and 'contents' are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin, env.ALLOWED_ORIGINS) },
      });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
    const payload = { contents, generationConfig: config };

    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        status: resp.status,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin, env.ALLOWED_ORIGINS) },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e?.message || String(e) }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin, env.ALLOWED_ORIGINS) },
      });
    }
  },
};

