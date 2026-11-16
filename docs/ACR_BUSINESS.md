# acr.business — ActaRoot official corporate alias

`acr.business` is a secondary owned company domain. Its canonical corporate information remains at `https://actaroot.com/`.

The Worker redirects the root and verified existing corporate paths (`/about/`, `/brands/`, `/founder/`, `/faq/`) with HTTP 301 to the matching ActaRoot pages. It does not publish duplicate corporate articles. Other paths return 404. Query-string redirect targets are ignored.

## Cloudflare setup (after PR merge and approval)
- Workers & Pages → Create application → Continue with GitHub.
- Repository: `iseig513-ux/actaroot-website`; production branch `main`.
- Project: `acr-business-redirect`; Root/Path: `/workers/acr-business`.
- Build command: blank. Deploy command: `npx wrangler@4 deploy`.
- Once the Worker is deployed, attach **only** `acr.business` and `www.acr.business` as Custom Domains.
- Inspect existing Cloudflare routes before replacing a binding. Preserve all email MX/TXT records and the existing ActaRoot Pages site.
- Verify `curl -I https://acr.business/` yields 301 with `Location: https://actaroot.com/`. Verify `/about/` maps to `https://actaroot.com/about/` and an unknown path returns 404.

**Search:** `actaroot.com` remains the indexable canonical host. Submit `https://actaroot.com/sitemap.xml` in its Search Console/Bing property. A separate `acr.business` sitemap is unnecessary; permanent redirect signals consolidate toward the primary site. Google/AI indexing cannot be confirmed from GitHub alone.

No DNS, Worker route, live site, or search-console property is modified by the PR.
