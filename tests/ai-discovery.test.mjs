import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";
const read=p=>readFileSync(join(process.cwd(),p),"utf8");
const sites=JSON.parse(read("content/sites.json"));
test("ActaRoot remains discoverable and maintains approved crawler policies",()=>{
 const domain="actaroot.com",site=sites[domain];
 const robots=read("sites/"+domain+"/robots.txt");
 for(const agent of ["Googlebot","Google-Extended","OAI-SearchBot","ChatGPT-User","Claude-SearchBot","Claude-User","PerplexityBot","Perplexity-User"])assert.ok(robots.includes("User-agent: "+agent+"\nAllow: /"),agent);
 for(const agent of ["GPTBot","ClaudeBot"])assert.ok(robots.includes("User-agent: "+agent+"\nDisallow: /"),agent);
 const facts=JSON.parse(read("sites/"+domain+"/facts.json"));
 assert.equal(facts.pages.length,site.pages.length);
 const full=read("sites/"+domain+"/llms-full.txt");
 assert.ok(full.includes("https://ohwut.com/"));
 for(const p of site.pages)assert.ok(full.includes(site.origin+"/"+(p.path?p.path+"/":"")));
});
test("ActaRoot published copy keeps valid, non-promissory schema",()=>{
 const banned=/\b(?:demo|test(?:ing)?|under construction|coming soon|in development|no orders?|zero sales?|unverified|not verified|prototype)\b/i;
 const site=sites["actaroot.com"];
 for(const page of site.pages){
  const path="sites/actaroot.com/"+(page.path?page.path+"/":"")+"index.html";
  const html=read(path);
  assert.ok(!banned.test(html),path);
  const match=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match,path);
  const graph=JSON.parse(match[1])["@graph"];
  const url=site.origin+"/"+(page.path?page.path+"/":"");
  const node=graph.find(n=>n["@id"]===url+"#webpage");
  assert.ok(node,path);
  if(page.path==="faq")assert.equal(node.mainEntity.length,page.sections.length);
 }
});
