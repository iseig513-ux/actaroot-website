import test from "node:test";import assert from "node:assert/strict";import {readFileSync,existsSync,readdirSync} from "node:fs";import {resolve,join} from "node:path";
const root=resolve(".");const sites=JSON.parse(readFileSync(join(root,"content/sites.json"),"utf8"));
const text=p=>readFileSync(join(root,p),"utf8");
test("exactly two indexable official sites with unique canonical metadata and valid JSON-LD",()=>{
 assert.deepEqual(Object.keys(sites).sort(),["actaroot.com","msihu.com"]);
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
 const allowed=new Set(["actaroot.com","msihu.com","ohwut.com"]);
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

test("only the approved built sites and wut.sale Worker remain",()=>{
 assert.deepEqual(readdirSync(join(root,"sites")).sort(),[".gitkeep","actaroot.com","msihu.com"]);
 assert.equal(existsSync(join(root,"workers","oh-tin")),false);
 assert.ok(existsSync(join(root,"workers","wut-sale","src","index.mjs")));
 for(const [domain,site] of Object.entries(sites)){
  const facts=JSON.parse(text("sites/"+domain+"/facts.json"));
  assert.deepEqual(Object.keys(facts.officialDomains).sort(),["brand","company","founder"]);
  assert.equal(facts.entityIdentifiers.person,"https://msihu.com/#person");
  assert.equal(facts.entityIdentifiers.organization,"https://actaroot.com/#organization");
  assert.equal(facts.entityIdentifiers.brand,"https://actaroot.com/#brand-ohwut");
  assert.equal(facts.canonicalOrigin,site.origin);
 }
});
test("deprecated domains never appear in site outputs or editable source",()=>{
 const retired=["min."+"tienda","oh."+"tin"];
 const paths=["content/sites.json","scripts/build.mjs","README.md","docs/DEPLOY_AND_INDEX.md","docs/ENTITY_AND_CONTENT.md","docs/PUBLIC_COPY_POLICY.md"];
 for(const [domain,site] of Object.entries(sites)){
  const files=["index.html","404.html","facts.json","robots.txt","sitemap.xml","llms.txt","llms-full.txt",...site.pages.filter(p=>p.path).map(p=>p.path+"/index.html")];
  for(const path of files)paths.push("sites/"+domain+"/"+path);
 }
 for(const path of paths)for(const old of retired)assert.ok(!text(path).includes(old),path+": "+old);
});
test("all official cross-site HTML links lead to published pages; no unapproved personal sameAs",()=>{
 const published=new Set(Object.values(sites).flatMap(site=>site.pages.map(page=>site.origin+"/"+(page.path?page.path+"/":""))));
 for(const [domain,site] of Object.entries(sites))for(const page of site.pages){
  const html=text("sites/"+domain+"/"+(page.path?page.path+"/":"")+"index.html");
  const raw=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(raw);
  const graph=JSON.parse(raw)["@graph"];
  const person=graph.find(e=>e["@id"]==="https://msihu.com/#person");
  assert.equal(person.url,"https://msihu.com/");
  assert.ok(!person.sameAs||person.sameAs.length===0);
  for(const match of html.matchAll(/href="(https:\/\/[^"]+)"/g)){
   const link=new URL(match[1]);
   if(Object.hasOwn(sites,link.hostname))assert.ok(published.has(link.origin+link.pathname),"broken official link: "+match[1]);
  }
 }
});
