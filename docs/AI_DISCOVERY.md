# AI search discoverability policy

This repository publishes ordinary, readable HTML at the canonical information sites, with a matching JSON-LD graph, XML sitemap, `llms.txt`, `llms-full.txt`, and machine-readable `facts.json`.

| System | Main search/fetch path | Policy |
|---|---|---|
| ChatGPT Search | `OAI-SearchBot` | Allow |
| ChatGPT user-directed | `ChatGPT-User` | Allow |
| Claude search | `Claude-SearchBot` | Allow |
| Claude user-directed | `Claude-User` | Allow |
| Gemini / Google Search | `Googlebot` | Allow |
| Gemini grounding / related usage control | `Google-Extended` | Allow |
| Perplexity Search | `PerplexityBot` | Allow |
| Model-training crawling (OpenAI) | `GPTBot` | Disallow |
| Model-training crawling (Anthropic) | `ClaudeBot` | Disallow |

Google-Extended is a product-control token, not an HTTP crawler user agent. Allowing it permits Google's documented Gemini grounding and model-training uses; it is not an SEO ranking signal. Claude-SearchBot and ClaudeBot have different roles. OpenAI's ChatGPT-User is not the automatic search index crawler.

Authoritative references (reviewed 2026-11-16):
- https://developers.openai.com/api/docs/bots
- https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
- https://developers.google.com/search/docs/appearance/ai-features
- https://docs.perplexity.ai/docs/resources/perplexity-crawlers

These directives require actual public hosting and a firewall policy that permits crawler requests. `llms.txt`, `llms-full.txt` and `facts.json` are supplementary navigation and reference files, not officially guaranteed discovery or ranking mechanisms. The canonical visible pages and structured data are primary.
