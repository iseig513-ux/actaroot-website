import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {join} from "node:path";

test("msihu.com Cloudflare Pages redirects every path to Min Ventures, without touching other domains",()=>{
 const root=process.cwd();
 const read=readFileSync(join(root,"sites/msihu.com/_redirects"),"utf8");
 assert.equal(read,"/* https://min.ventures/ 301\n");
 assert.ok(!read.includes(":splat"));
 assert.ok(!read.includes("url="));
 for(const domain of ["actaroot.com","min.ventures"])assert.equal(existsSync(join(root,"sites",domain,"_redirects")),false);
});

test("existing msihu content source stays present for later decisions or rollback",()=>{
 const cfg=JSON.parse(readFileSync("content/sites.json","utf8"));
 assert.deepEqual(cfg["msihu.com"].pages.map(p=>p.path),["","about","projects","faq"]);
 assert.deepEqual(cfg["min.ventures"].pages.map(p=>p.path),["","ventures","about"]);
});
