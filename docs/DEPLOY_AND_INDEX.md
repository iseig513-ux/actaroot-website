# Deployment and indexing — protect existing live services

## Cloudflare Pages (already connected)

Keep the existing `actaroot.com` and `msihu.com` Cloudflare Pages projects, DNS entries, MX/TXT records, custom domains and service bindings unchanged. This change only updates GitHub code.

| Official indexed website | Existing build command | Output directory |
|---|---|---|
| actaroot.com | `npm run build` | `sites/actaroot.com` |
| msihu.com | `npm run build` | `sites/msihu.com` |

Requirements: Node.js >=20, no npm dependencies. `npm run check` builds both sites and runs tests. Generated HTML works without client JavaScript. Published sitemap, robots.txt, self-referential canonicals, JSON-LD, FAQ, 404, metadata, AI-crawler access and alternate discovery files remain.

### Optional verification meta tags

Domain-property verification through Google DNS TXT is configured outside this repository. If an existing Pages project needs HTML verification, the generator supports these site-specific **build** environment variables (never commit tokens):

- `GOOGLE_SITE_VERIFICATION_ACTAROOT_COM`, `BING_SITE_VERIFICATION_ACTAROOT_COM`
- `GOOGLE_SITE_VERIFICATION_MSIHU_COM`, `BING_SITE_VERIFICATION_MSIHU_COM`

No additional Pages site is created here.

## wut.sale Worker (no route changes)

`workers/wut-sale` remains. Its Wrangler config has no automatic Worker route binding. The `wut.sale` and `www.wut.sale` root returns 301 to `https://ohwut.com/`. Approved share links may redirect temporarily (302) to verified OHWUT HTTPS URLs; unknown links return 404 and cannot redirect to attacker-controlled destinations. The registry starts empty. Do not change an existing Cloudflare Worker route or publish a new one as part of this PR; separate approval is needed for deployment. Refer to `docs/SHARE_LINKS.md`.

The OHWUT storefront, checkout, Stripe, backend, and UI are outside this repository's update scope.

## Google Search Console

1. Verify the two existing indexable domains at https://search.google.com/search-console/ if needed.
2. Submit `https://actaroot.com/sitemap.xml` and `https://msihu.com/sitemap.xml` only when these versions are served.
3. Check live URL Inspection, rendered content, HTTP 200, canonical selection, and Page Indexing reports.
4. Request recrawls of real published pages when appropriate. Submission does not itself mean successful indexing.

## Bing Webmaster Tools

Use https://www.bing.com/webmasters/ for the two indexable sites. Verify ownership, submit the same two sitemaps, and inspect crawler/index coverage. Do not commit fake IndexNow keys.

## AI search and crawler policy

Both sites' robots.txt allow `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`, `Googlebot`, `Google-Extended`, `PerplexityBot`, `Perplexity-User` and `Bingbot`. Training crawlers `GPTBot` and `ClaudeBot` are separately blocked. These rules do not edit Cloudflare WAF policies or guarantee ranking. HTML and JSON-LD are the primary indexed content; `llms.txt`, `llms-full.txt` and `facts.json` remain supplementary resources. See `docs/AI_DISCOVERY.md`.

## Manual post-merge checks

- Confirm live home, robots and sitemap responses on `https://actaroot.com/` and `https://msihu.com/`.
- Confirm the Person/Organization/Brand canonical IDs are correct on published HTML.
- If `wut.sale` is already deployed, check root 301 to `https://ohwut.com/` and unknown paths 404 without changing any route.
- Keep existing Pages configuration and domains untouched; verify the GitHub Actions CI and deterministic static generation before merge.

No live Cloudflare/DNS edit, Worker deploy, domain connection, Google/Bing registration, indexing confirmation, or production OHWUT code change is made by this PR.
