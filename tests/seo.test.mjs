import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync,readdirSync} from "node:fs";
import {join} from "node:path";
const root=process.cwd();
const read=p=>readFileSync(join(root,p),"utf8");
const exists=p=>existsSync(join(root,p));
const sites=JSON.parse(read("content/sites.json"));
test("ActaRoot is the only content-publishing site; others have empty, nonindexable output",()=>{
 assert.deepEqual(Object.keys(sites).sort(),["actaroot.com","min.ventures","msihu.com"]);
 for(const domain of ["min.ventures","msihu.com"]){
  const base="sites/"+domain+"/";
  assert.deepEqual(readdirSync(join(root,base)).sort(),["404.html","_headers","_worker.js","index.html","robots.txt"]);
  for(const file of ["index.html","404.html"]){
   const html=read(base+file);
   assert.match(html,/<!doctype html>/i);
   assert.match(html,/noindex,nofollow,noarchive,nosnippet/);
   assert.match(html,/<body><\/body>/);
   assert.ok(!html.includes("<title>"));
   assert.ok(!html.includes("canonical"));
  }
  assert.ok(read(base+"_worker.js").includes("status: 410"));
  assert.ok(read(base+"_worker.js").includes("X-Robots-Tag"));
  assert.ok(read(base+"robots.txt").includes("Allow: /"));
  assert.ok(!exists(base+"sitemap.xml"));
 }
});
test("company site retains page-level canonical SEO, structured facts, and published sitemap",()=>{
 const site=sites["actaroot.com"],titles=new Set();
 for(const page of site.pages){
  const url=site.origin+"/"+(page.path?page.path+"/":"");
  const p="sites/actaroot.com/"+(page.path?page.path+"/":"")+"index.html";
  assert.ok(exists(p),p);
  const html=read(p);
  assert.ok(html.includes('<link rel="canonical" href="'+url+'">'));
  assert.ok(html.includes('<meta property="og:url" content="'+url+'">'));
  assert.ok(html.includes("https://ohwut.com/"));
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1];assert.ok(title);assert.ok(!titles.has(title));titles.add(title);
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
  assert.ok(graph.some(x=>x["@id"]===url+"#webpage"));
 }
 const base="sites/actaroot.com/";
 const sitemap=read(base+"sitemap.xml");
 const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
 assert.deepEqual(urls,site.pages.map(p=>site.origin+"/"+(p.path?p.path+"/":"")));
 assert.ok(read(base+"robots.txt").includes("Sitemap: "+site.origin+"/sitemap.xml"));
 assert.ok(exists(base+"facts.json"));
 assert.ok(exists(base+"llms.txt"));
 assert.ok(exists(base+"favicon.svg"));
});
test("independent Workers, approved output directories and no legacy root are unchanged",()=>{
 assert.deepEqual(readdirSync(join(root,"sites")).sort(),[".gitkeep","actaroot.com","min.ventures","msihu.com"]);
 assert.ok(exists("workers/wut-sale/src/index.mjs"));
 assert.ok(exists("workers/oh-tienda/src/index.mjs"));
 for(const p of ["index.html","framerusercontent.com","fonts.gstatic.com"])assert.equal(exists(p),false,p);
});
