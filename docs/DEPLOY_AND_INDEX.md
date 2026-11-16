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


## New: min.ventures Cloudflare Pages (manual provisioning)

After the PR is reviewed and manually merged, create a **new** Cloudflare Pages project; do not reuse, delete or alter the existing ActaRoot/msihu.com projects.

- Project name: `min-ventures`
- Repository: `iseig513-ux/actaroot-website`
- Production branch: `main`
- Framework preset: `None`
- Build command: `npm run build`
- Build output directory: `sites/min.ventures`
- Root directory: repository root (default)
- Node.js: 20 or later (22 recommended)
- Connect the `min.ventures` custom domain only after the Pages project is ready, using Cloudflare's offered DNS records. Do not change existing domain or email records.
- Verify `https://min.ventures/`, `/ventures/`, `/about/`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, and `/facts.json` and inspect live HTTP statuses and JSON-LD.
- Add `https://min.ventures/sitemap.xml` to Google Search Console and Bing Webmaster Tools after the actual host serves these pages. Inspect real canonical and indexing reports.
- After the host is live, link back from `msihu.com` and the relevant ActaRoot founder page via a separately reviewed minimal cross-site update; avoid a broad content rewrite.

## New: oh.tienda Cloudflare Worker (manual provisioning)

The source is under `workers/oh-tienda` and does not bind any route automatically.

- Connect GitHub repository `iseig513-ux/actaroot-website` in Cloudflare Workers Builds, or manually deploy from the directory after PR merge.
- Root directory: `workers/oh-tienda`
- Build command: none (pure JavaScript Worker)
- Deploy command: `npx wrangler@4 deploy`
- Wrangler file: `workers/oh-tienda/wrangler.toml`; `workers_dev=false`, no automatic routes.
- Confirm deployed Worker is healthy in the Cloudflare dashboard **before** attaching custom domains.
- Attach `oh.tienda` and `www.oh.tienda` to this Worker using Cloudflare's Custom Domains workflow, setting DNS only as instructed by Cloudflare. Avoid collisions with an existing route or hostname.
- Verify HTTPS GET and HEAD root return `301 Location: https://ohwut.com/`. Check an unknown path and a foreign host return 404; POST root returns 405. Root query strings do not influence the target.
- Do not route or modify `ohwut.com`, `wut.sale`, or any existing Worker. The new domain serves no independent HTML, sitemap, or canonical pages.

The GitHub PR prepares source code only. Actual Cloudflare configuration, deployment, DNS attachment, live URL response checks and search-console submission remain manual.
