# ActaRoot / Min Sihu / Min Ventures — official sites and sharing domains

This repository builds the ActaRoot information site, the Min Ventures founder portfolio, a permanent redirect from msihu.com to min.ventures, and separately deployable redirect Workers. Existing production domains, DNS/email records, Pages bindings, and the OHWUT shopping service are not changed by this code-only PR.

| Current domain | Purpose | Artifact |
|---|---|---|
| actaroot.com | ActaRoot, Inc. company, founder, brand and FAQ (5 pages) | `sites/actaroot.com` |
| msihu.com | 301 redirect to `https://min.ventures/` (source pages retained for rollback) | `sites/msihu.com/_redirects` |
| min.ventures | Min Sihu founder portfolio (Home, Ventures, About) | `sites/min.ventures` |\n| oh.tienda | OHWUT fixed redirect, root only | `workers/oh-tienda` |\n| wut.sale | OHWUT root redirect and safe future sharing links | `workers/wut-sale` |

OHWUT's official shopping service stays at `https://ohwut.com/` and is **only referenced**, not modified. All other domains are outside this repository's current build and deployment scope.

## Build and test

```bash
npm run build
npm run check
```

Node 20+ is required; no third-party npm packages. `npm run build` generates three committed `sites/<domain>` directories for Cloudflare Pages output directory compatibility. CI runs tests and verifies reproducible build output.

The existing `msihu.com` Cloudflare Pages project can serve a root-targeting `301` for all paths via its generated `_redirects` rule. `min.ventures` is left unchanged so its landing page can be replaced later. The redirect takes effect only after the `msihu.com` Pages project deploys the updated build output; GitHub alone does not change live traffic.

## Included SEO/GEO features

- Twelve readable, responsive pages with unique titles, headings, descriptions, self-canonicals, Open Graph, Twitter cards and real noindex 404s.
- Person `https://msihu.com/#person`, Organization `https://actaroot.com/#organization`, and OHWUT Brand `https://actaroot.com/#brand-ohwut` with interconnected Schema.org markup, WebPage types, breadcrumb and FAQPage entities.
- Per-site XML sitemaps and robots.txt directives for Google, Bing, ChatGPT Search, Claude Search, Perplexity, plus independent training-crawler controls.
- Public `llms.txt`, `llms-full.txt` and `facts.json` generated from visible source content.
- `wut.sale` Worker using fail-closed approved-link lookup (no arbitrary off-site redirect).\n- `oh.tienda` Worker permanently redirecting only its own HTTPS root to `https://ohwut.com/`.

Relevant technical and editorial documentation: `docs/ENTITY_AND_CONTENT.md`, `docs/AI_DISCOVERY.md`, `docs/PUBLIC_COPY_POLICY.md`, `docs/SHARE_LINKS.md`, and `docs/DEPLOY_AND_INDEX.md`.

The new site uses a distinct editorial layout; `min.ventures` describes founder-led ventures, not a copy of `msihu.com`.\n\nNo auto-deploy or automatic PR merge is configured.
