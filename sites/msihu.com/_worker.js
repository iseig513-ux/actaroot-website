// Intentionally blank: this domain is retired from public display and indexing.
export default {
  async fetch() {
    return new Response(null, {
      status: 410,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
        "Cache-Control": "no-store"
      }
    });
  }
};
