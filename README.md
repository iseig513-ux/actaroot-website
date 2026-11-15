# ActaRoot & Min — five-domain SEO/GEO foundation

This branch **replaces the old Framer-exported ActaRoot website** and associated large assets with a tiny, accessible, fact-based, multilingual-ready **English-first** technical SEO foundation. The replacement is confined to a GitHub work branch until reviewed. No Cloudflare/DNS/live deployment happens here.

| Domain | Purpose | Deployable artifact |
|---|---|---|
| actaroot.com | Official company, founder, OHWUT-brand relationship, FAQ | `sites/actaroot.com` |
| msihu.com | Primary personal profile, about, projects | `sites/msihu.com` |
| min.tienda | Distinct secondary profile for the same person | `sites/min.tienda` |
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
- Per-domain sitemap and robots.txt; independent OAI-SearchBot allow and GPTBot disallow
- Optional llms.txt; contact/SNS/press/news slot designs are documentation-only until verified
- Two Cloudflare Worker implementations, fail-closed share mapping and redirect tests
- No auto-deploy: manual setup in `docs/DEPLOY_AND_INDEX.md`

Start with `docs/ENTITY_AND_CONTENT.md`, `docs/SHARE_LINKS.md`, and `docs/DEPLOY_AND_INDEX.md` for content, redirects and next steps.
