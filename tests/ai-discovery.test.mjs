import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";
const text=p=>readFileSync(join(process.cwd(),p),"utf8");
const sites=JSON.parse(text("content/sites.json"));

test("AI discovery: OpenAI, Claude, Gemini and Perplexity search bots are enabled",()=>{
 for(const domain of Object.keys(sites)){
  const robots=text("sites/"+domain+"/robots.txt");
  for(const bot of ["OAI-SearchBot","ChatGPT-User","Claude-SearchBot","Claude-User","Googlebot","Google-Extended","PerplexityBot"])
   assert.ok(robots.includes("User-agent: "+bot+"\\nAllow: /"),domain+" "+bot);
  for(const bot of ["GPTBot","ClaudeBot"])
   assert.ok(robots.includes("User-agent: "+bot+"\\nDisallow: /"),domain+" "+bot);
  const full=text("sites/"+domain+"/llms-full.txt"),facts=JSON.parse(text("sites/"+domain+"/facts.json"));
  assert.equal(facts.pages.length,sites[domain].pages.length);
  assert.ok(full.includes("https://ohwut.com/"));
  for(const page of sites[domain].pages)assert.ok(full.includes(sites[domain].origin+"/"+(page.path?page.path+"/":"")));
 }
});
test("public pages contain professional verified copy without operational status disclaimers",()=>{
 const banned=/\\b(?:demo|test(?:ing)?|under construction|coming soon|in development|no orders?|zero sales?|unverified|not verified|prototype)\\b/i;
 for(const [domain,site] of Object.entries(sites))for(const page of site.pages){
  const pagePath="sites/"+domain+"/"+(page.path?page.path+"/":"")+"index.html";
  const h=text(pagePath),ld=JSON.parse(h.match(/<script type="application\\/ld\\+json">([\\s\\S]*?)<\\/script>/)[1]);
  assert.ok(!banned.test(h),pagePath);
  const obj=ld["@graph"].find(x=>x["@id"]===site.origin+"/"+(page.path?page.path+"/")+"#webpage");
  if(page.path==="faq"){assert.equal(obj["@type"],"FAQPage");assert.equal(obj.mainEntity.length,page.sections.length)}
 }
});
