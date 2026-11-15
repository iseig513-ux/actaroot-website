import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";

const text = path => readFileSync(join(process.cwd(),path),"utf8");
const sites = JSON.parse(text("content/sites.json"));

test("AI discovery agents are explicitly configured by purpose", () => {
  for (const [domain,site] of Object.entries(sites)) {
    const robots = text("sites/"+domain+"/robots.txt");
    for (const agent of ["Googlebot","Google-Extended","OAI-SearchBot","ChatGPT-User","Claude-SearchBot","Claude-User","PerplexityBot","Perplexity-User"]) {
      assert.ok(robots.includes("User-agent: "+agent+"\nAllow: /"),domain+" "+agent);
    }
    for (const agent of ["GPTBot","ClaudeBot"]) {
      assert.ok(robots.includes("User-agent: "+agent+"\nDisallow: /"),domain+" "+agent);
    }
    const full = text("sites/"+domain+"/llms-full.txt");
    const facts = JSON.parse(text("sites/"+domain+"/facts.json"));
    assert.equal(facts.pages.length,site.pages.length);
    assert.ok(full.includes("https://ohwut.com/"));
    for (const p of site.pages) {
      assert.ok(full.includes(site.origin+"/"+(p.path?p.path+"/":"")));
    }
  }
});

test("public copy excludes stage and operational disclaimers", () => {
  const banned = /\b(?:demo|test(?:ing)?|under construction|coming soon|in development|no orders?|zero sales?|unverified|not verified|prototype)\b/i;
  for (const [domain,site] of Object.entries(sites)) {
    for (const page of site.pages) {
      const url = site.origin+"/"+(page.path?page.path+"/":"");
      const file = "sites/"+domain+"/"+(page.path?page.path+"/":"")+"index.html";
      const html = text(file);
      assert.ok(!banned.test(html),file);
      const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      assert.ok(m,file);
      const graph = JSON.parse(m[1])["@graph"];
      const pageNode = graph.find(n => n["@id"]===url+"#webpage");
      assert.ok(pageNode,file);
      if (page.path === "faq") {
        assert.equal(pageNode["@type"],"FAQPage");
        assert.equal(pageNode.mainEntity.length,page.sections.length);
      }
    }
  }
});
