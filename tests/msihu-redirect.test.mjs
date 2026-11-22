import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {join} from "node:path";
import minWorker from "../sites/min.ventures/_worker.js";
import personWorker from "../sites/msihu.com/_worker.js";
const root=process.cwd(),read=p=>readFileSync(join(root,p),"utf8");
test("both retired domains return an empty 410 for all methods and all routes",async()=>{
 for(const [domain,worker] of [["min.ventures",minWorker],["msihu.com",personWorker]]){
  for(const path of ["/","/about/","/faq/","/ventures/","/projects/","/sitemap.xml","/llms.txt","/facts.json","/robots.txt","/unknown"]){
   const response=await worker.fetch(new Request("https://"+domain+path));
   assert.equal(response.status,410,domain+path);
   assert.equal(response.headers.get("X-Robots-Tag"),"noindex, nofollow, noarchive, nosnippet");
   assert.equal(await response.text(),"",domain+path);
  }
  assert.equal(existsSync(join(root,"sites",domain,"_redirects")),false,domain);
  assert.equal(existsSync(join(root,"sites",domain,"sitemap.xml")),false,domain);
  assert.equal(existsSync(join(root,"sites",domain,"llms.txt")),false,domain);
  assert.equal(existsSync(join(root,"sites",domain,"facts.json")),false,domain);
  const html=read("sites/"+domain+"/index.html");
  assert.match(html,/<body><\/body>/);
  assert.match(html,/name="robots" content="noindex/);
  assert.ok(!/<main|<h1|application\/ld\+json/.test(html));
  assert.ok(read("sites/"+domain+"/_headers").includes("X-Robots-Tag: noindex"));
 }
});
test("source content retained in the generator for future restoration",()=>{
 const sites=JSON.parse(read("content/sites.json"));
 assert.deepEqual(sites["msihu.com"].pages.map(p=>p.path),["","about","projects","faq"]);
 assert.deepEqual(sites["min.ventures"].pages.map(p=>p.path),["","ventures","about"]);
});
