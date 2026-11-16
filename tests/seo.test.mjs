import test from "node:test";import assert from "node:assert/strict";import {readFileSync,existsSync,readdirSync} from "node:fs";import {resolve,join} from "node:path";
const root=resolve(".");const sites=JSON.parse(readFileSync(join(root,"content/sites.json"),"utf8"));
const text=p=>readFileSync(join(root,p),"utf8");
test("only three indexable canonical domains, each with distinct page metadata and valid JSON-LD",()=>{
 assert.deepEqual(Object.keys(sites).sort(),["actaroot.com","min.tienda","msihu.com"]);
 const titles=new Set();
 for(const [domain,site] of Object.entries(sites)){for(const page of site.pages){
  const p="sites/"+domain+"/"+(page.path?page.path+"/":"")+"index.html";assert.ok(existsSync(join(root,p)),p);
  const html=text(p),url=site.origin+"/"+(page.path?page.path+"/":"");
  assert.match(html,/<!doctype html>/i);assert.match(html,/<html lang="en">/);
  assert.ok(html.includes('<link rel="canonical" href="'+url+'">'),p);
  assert.ok(html.includes('<meta property="og:url" content="'+url+'">'),p);
  assert.match(html,/<meta name="twitter:card" content="summary">/);
  assert.match(html,/<meta name="description" content="[^"]+">/);
  assert.equal((html.match(/<h1>/g)||[]).length,1,p);
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1];assert.ok(title);
  assert.ok(!titles.has(title),"duplicate title: "+title);titles.add(title);
  const raw=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(raw,p);const graph=JSON.parse(raw)["@graph"];assert.ok(graph.length>=5);
  const ids=new Set(graph.map(x=>x["@id"]));assert.equal(ids.size,graph.length);
  assert.ok(ids.has("https://actaroot.com/#organization"));
  assert.ok(ids.has("https://msihu.com/#person"));
  assert.ok(ids.has("https://actaroot.com/#brand-ohwut"));
  assert.ok(ids.has(url+"#webpage"));
  assert.ok(html.includes("https://ohwut.com/"));
  assert.ok(!/private phone|school name|2026-12-\d\d/i.test(html));
 } }
});
test("sitemaps match real HTML and canonical only; robots separate search and training",()=>{
 for(const [domain,site] of Object.entries(sites)){
  const base="sites/"+domain+"/";const sitemap=text(base+"sitemap.xml"),robots=text(base+"robots.txt");
  assert.match(sitemap,/xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
  const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
  assert.equal(urls.length,site.pages.length);
  assert.deepEqual(urls,site.pages.map(p=>site.origin+"/"+(p.path?p.path+"/":"")));
  assert.ok(urls.every(u=>u.startsWith(site.origin+"/")));
  assert.ok(robots.includes("User-agent: OAI-SearchBot\nAllow: /"));
  assert.ok(robots.includes("User-agent: GPTBot\nDisallow: /"));
  assert.ok(robots.includes("Sitemap: "+site.origin+"/sitemap.xml"));
  assert.ok(text(base+"404.html").includes('content="noindex"'));
  assert.ok(existsSync(join(root,base+"favicon.svg")));
  assert.ok(existsSync(join(root,base+"llms.txt")));
 }
});
test("published internal HTML links resolve and no unapproved domains are built",()=>{
 const allowed=new Set(["actaroot.com","msihu.com","min.tienda","ohwut.com"]);
 for(const [domain,site] of Object.entries(sites))for(const page of site.pages){
  const html=text("sites/"+domain+"/"+(page.path?page.path+"/":"")+"index.html");
  for(const m of html.matchAll(/href="(https:\/\/[^"]+)"/g)){
   const url=new URL(m[1]);assert.ok(allowed.has(url.hostname),"unexpected domain: "+url.hostname);
   if(url.hostname===domain && url.pathname!=="/style.css"){
    const dest="sites/"+domain+(url.pathname==="/"?"/index.html":url.pathname+"index.html");
    assert.ok(existsSync(join(root,dest)),"broken internal link "+m[1]);
   }
  }
 }
});
test("old Framer exported site files are excluded from replacement tree",()=>{
 for(const p of ["index.html","framerusercontent.com","fonts.gstatic.com"]){assert.equal(existsSync(join(root,p)),false,"legacy root still present: "+p)}
});
