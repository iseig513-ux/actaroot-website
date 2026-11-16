// Corporate alias for ActaRoot, Inc.: consolidate canonical information at actaroot.com.
const HOSTS = new Set(["acr.business", "www.acr.business"]);
const PATHS = new Set(["/", "/about/", "/brands/", "/founder/", "/faq/"]);
const DESTINATION = "https://actaroot.com";
const reject = () => new Response("Not found", {
  status: 404,
  headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" },
});
export function handleRequest(request) {
  const url = new URL(request.url);
  if (url.protocol !== "https:" || url.port || !HOSTS.has(url.hostname.toLowerCase())) return reject();
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", {
    status: 405, headers: { Allow: "GET, HEAD" },
  });
  if (url.pathname === "/robots.txt") return new Response("User-agent: *\nAllow: /\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
  const path = url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "") + "/";
  if (!PATHS.has(path)) return reject();
  return new Response(null, { status: 301, headers: {
    Location: DESTINATION + path,
    "Cache-Control": "public, max-age=3600",
    "X-Robots-Tag": "noindex",
  } });
}
export default { fetch: handleRequest };
