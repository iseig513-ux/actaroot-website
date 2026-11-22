# ActaRoot websites and redirects

The repository maintains three Cloudflare Pages build targets. As of 2026-11-22, only `actaroot.com` remains a published information site. Both `min.ventures` and `msihu.com` are intentionally retired from public display and search indexing.

| Domain | Production output | Behavior |
| --- | --- | --- |
| actaroot.com | `sites/actaroot.com` | Original company pages and search metadata, unchanged |
| min.ventures | `sites/min.ventures` | Blank body, HTTP 410 Gone for every route |
| msihu.com | `sites/msihu.com` | Blank body, HTTP 410 Gone for every route (previous 301 removed) |

Run `npm run check` to regenerate the output and test it. The two retired domains use Cloudflare Pages advanced-mode `_worker.js` with `410` and `X-Robots-Tag: noindex`, including previously published page URLs and SEO resources. A minimal blank HTML file with `noindex` is also generated as a fallback, and no sitemap or metadata feed is published for them.

The original content and page models remain in `content/sites.json`, so this change is reversible in Git. The original `actaroot.com` deployment, workers and OHWUT production website are outside this change. Cloudflare Pages must deploy the `main` branch before the public domains will reflect the new behavior. Google and other search engines may take time to remove previously indexed results; their URL removal consoles can accelerate that process.
