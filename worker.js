export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const target = url.pathname.slice(1) + url.search;

      if (!target.startsWith("http://") && !target.startsWith("https://")) {
        return new Response("Usage: /https://example.com", { status: 400 });
      }

      const resp = await fetch(target, {
        method: request.method,
        headers: request.headers,
        body: request.method !== "GET" && request.method !== "HEAD"
          ? await request.arrayBuffer()
          : undefined,
      });

      const headers = new Headers(resp.headers);
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "*");

      return new Response(resp.body, {
        status: resp.status,
        headers,
      });

    } catch (err) {
      return new Response("Proxy Error: " + err.message, { status: 500 });
    }
  }
};
