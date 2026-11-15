# wut.sale — future share link architecture (not launched)

## Current approved behavior
- `/` returns **301** to `https://ohwut.com/`.
- All unregistered paths return real **404** with `X-Robots-Tag: noindex`. They are **not** silently mapped to the homepage.
- There is **no sitemap**, duplicate shopping HTML, or canonical product page under wut.sale.
- `/p/`, `/s/`, `/c/` were examples in prior discussions, **not adopted route rules**. No namespace has been chosen.

## Extension contract
1. Decide actual stable path scheme and product landing URL shape from the current OHWUT router; do not assume `/products/` exists in production.
2. Populate `workers/wut-sale/src/registry.mjs` only after confirming real products or integrating a reviewed KV/D1 resolver. The initial registry is deliberately empty.
3. Every resolved URL must be absolute HTTPS at **exact origin** `https://ohwut.com`; never accept arbitrary `url=` or redirect to external hosts.
4. Use **302** on active links because campaigns, creators and attribution mappings may change; protect against spoofed attribution, loops, SSRF/open redirects, and malicious codes. Keep root **301**.
5. Link preview policy: attempt native final OHWUT product URL OG/Twitter metadata first, since most crawlers follow redirects. If verified platform requirements later demand per-share Open Graph, serve a human-visible 200 preview landing page to everyone with the same destination and an explicit continue link. Do not split crawler/human content.
6. Keep referral/creator identifiers off the canonical URL and avoid fragmenting search signals. Keep attribution on OHWUT's owned backend, subject to its approved policy. This repo does not implement tracking, cookies or creator accounting.
7. Use non-guessable codes, expiry/revocation rules, usage quotas and logging privacy before launch; write integration tests against actual production routing before deployment.
