# ActaRoot & Min — five-domain SEO/GEO foundation

This branch **replaces the old Framer-exported ActaRoot website** and associated large assets with an accessible, fact-based, English-first **official company and founder knowledge foundation**. The replacement is confined to a GitHub work branch until reviewed. No Cloudflare/DNS/live deployment happens here.

| Domain | Purpose | Deployable artifact |
|---|---|---|
| actaroot.com | Official company, brand, founder, FAQ — 5 pages | `sites/actaroot.com` |
| msihu.com | Primary profile, about, projects and FAQ — 4 pages | `sites/msihu.com` |
| min.tienda | Distinct secondary profile for the same person — 1 page | `sites/min.tienda` |
| oh.tin | Root-only permanent redirect to ohwut.com | `workers/oh-tin` |
| wut.sale | Root-only redirect and safe future sharing foundation | `workers/wut-sale` |

**OHWUT official service source remains `https://ohwut.com/` and is not changed.** No other domain, Stripe logic, checkout, fulfillment, external DNS or brand configuration is modified.

## Run / validate
```bash
npm run check
# generated static sites available under sites/<domain>/
```

No npm dependencies. GitHub Actions executes the same tests and checks reproducible build output.

## Included
- Visible answer-first content and unique title/H1/descriptions on every indexed page
- Correct self-canonicals, Open Graph, Twitter cards, mobile styles, SVG initial favicons, real 404 pages
- Schema.org Organization/Person/Brand/WebSite/WebPage/ProfilePage/BreadcrumbList IDs and relationships
- Ten rich, public HTML pages with direct answer copy, consistent named entities and visible founder/brand relationships
- FAQPage schema on factual Q&A pages and connected JSON-LD entity identifiers
- Per-domain sitemap and robots.txt; ChatGPT Search, Claude Search, Google/Gemini and Perplexity access policies
- Separate search and training crawler preferences for GPTBot and ClaudeBot
- Per-site optional `llms.txt`, `llms-full.txt` and generated `facts.json`, all derived from verified public content
- Public editorial rules and crawler behavior documented in `docs/AI_DISCOVERY.md` and `docs/PUBLIC_COPY_POLICY.md`
- Two Cloudflare Worker implementations, fail-closed share mapping and redirect tests
- No auto-deploy: manual setup in `docs/DEPLOY_AND_INDEX.md`

Start with `docs/ENTITY_AND_CONTENT.md`, `docs/SHARE_LINKS.md`, and `docs/DEPLOY_AND_INDEX.md` for content, redirects and next steps.
