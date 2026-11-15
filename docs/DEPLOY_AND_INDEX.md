# Deployment and search registration — manual approvals

## Build
- Requirements: Node.js >=20; no dependency installation or paid service.
- From repository root: `npm run check`. `npm run build` generates exactly `sites/actaroot.com`, `sites/msihu.com`, `sites/min.tienda` from structured content; CI verifies deterministic outputs and redirects.
- Generated HTML is readable without JavaScript. Favicon is a neutral initial-letter placeholder, not a verified registered logo.

## Cloudflare Pages (do not deploy until approved)
Create **three separate Pages projects** attached to this repo, each with build command `npm run build` and output directory:
- actaroot.com: `sites/actaroot.com`
- msihu.com: `sites/msihu.com`
- min.tienda: `sites/min.tienda`

For each, attach only the named apex domain as custom domain after checking DNS ownership, and configure www-to-apex 301 rules limited to that hostname. Confirm SSL/TLS certificates.

### Optional HTML verification meta tags
Google domain ownership via DNS TXT remains the preferred first step. If a site-specific HTML meta method is required, set the following environment variables in the **matching site's** Pages build settings (never commit actual tokens):
- `GOOGLE_SITE_VERIFICATION_ACTAROOT_COM`, `BING_SITE_VERIFICATION_ACTAROOT_COM`
- `GOOGLE_SITE_VERIFICATION_MSIHU_COM`, `BING_SITE_VERIFICATION_MSIHU_COM`
- `GOOGLE_SITE_VERIFICATION_MIN_TIENDA`, `BING_SITE_VERIFICATION_MIN_TIENDA`

The generator emits Google's `google-site-verification` and Bing's `msvalidate.01` tags only when their respective variables are present. CI uses no tokens and never prints them.
 Make no changes to ohwut.com or other Cloudflare zones. The Pages projects and DNS have **not** been created by this commit.

## Redirect Workers (do not deploy until approved)
- Two independent Worker projects: `workers/oh-tin` and `workers/wut-sale`.
- The Wrangler configs specify code only, no routes. Manually bind each Worker to its own apex and www custom domains if ownership/DNS permits, and validate TLS before activating.
- oh.tin root: 301 to `https://ohwut.com/`; non-root unknown paths 404.
- wut.sale root: 301 to `https://ohwut.com/`; share paths return 404 until a real approved link mapping is added. No product pages or sitemaps for redirect domains.
- Inspect any existing traffic and Cloudflare rules before attaching Worker routes so a live service is never overwritten. No production API or checkout routing is modified.

## Google Search Console
1. For each **indexable** site (actaroot.com, msihu.com, min.tienda), add a Domain property at https://search.google.com/search-console/ .
2. Place Google's exact verification TXT record in only that site's DNS zone; verify after the site is served via HTTPS.
3. Under Sitemaps, submit `https://<domain>/sitemap.xml` (actual domains only).
4. Use URL Inspection for each real page and check HTTP 200, no `noindex`, the rendered content, user-declared canonical vs Google-selected canonical, and Coverage/Page indexing report.
5. Submit indexing requests for actual eligible public pages; a successful request is not an indexing confirmation.
6. Do not submit oh.tin and wut.sale as separate sitemap sites; their root permanent redirect is the signal.

## Bing Webmaster Tools
1. Add and verify the three indexable domains via https://www.bing.com/webmasters/ using Google Search Console import or DNS verification.
2. Submit each sitemap; inspect crawl/indexing and SEO reports. Optional future IndexNow requires a site-specific ownership key and actual changed URLs; do not commit fabricated keys.

## ChatGPT Search and AI crawlers
- robots.txt explicitly permits OAI-SearchBot, while blocking GPTBot (model-training crawler); Googlebot/Bingbot use the public allow section.
- Check Cloudflare Bot Management/WAF and published searchbot IP ranges, if currently configured, before claiming live accessibility: https://developers.openai.com/api/docs/bots and https://openai.com/searchbot.json . These settings are not changed in this repo.
- `llms.txt` is optional contextual navigation; it is not treated as an official ranking signal. No fabricated AI-specific ranking tags.
- Verify real public 200 pages and public crawler access after deployment; source code does not establish crawling or citations.

## Diagnostics
- Use `curl -I https://actaroot.com/`, `curl -I https://msihu.com/`, `curl -I https://min.tienda/`, and retrieve their live robots/sitemap; verify 200 + correct MIME.
- Use `curl -I https://oh.tin/` and `curl -I https://wut.sale/` to verify 301 exact `Location: https://ohwut.com/`; unknown paths 404.
- For duplicate canonical issues, compare live response code, canonical HTML, internal links, sitemap, www/HTTP forwarding and Google-selected canonical. Remove inconsistent signals, not robots-blocked copies.
- Re-run CI and then use Google URL Inspection/Bing URL Inspection; log confirmed index statuses, never predict them.

## Not performed by this task
No DNS edits, Cloudflare binding, paid service, actual deployment, Google/Bing registration, Search Console verification, live crawling or indexing.
