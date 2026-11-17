import test from "node:test";import assert from "node:assert/strict";import {readFileSync,existsSync} from "node:fs";import {join} from "node:path";
const root=process.cwd(),read=p=>readFileSync(join(root,p),"utf8");
const data=JSON.parse(read("content/sites.json"))["min.ventures"];
test("portfolio is data-led and contains exactly the two verified ventures",()=>{
 assert.equal(data.kind,"ventures");assert.deepEqual(data.ventures.map(v=>v.name),["ActaRoot, Inc.","OHWUT"]);
 assert.deepEqual(data.ventures.map(v=>v.url),["https://actaroot.com/","https://ohwut.com/"]);
 assert.deepEqual(data.pages.map(p=>p.path),["","ventures","about"]);
 assert.equal(data.founder.age.value,13);assert.equal(data.founder.age.asOf,"2026-11");
});
test("portfolio pages expose venture meaning, correct entity IDs, and distinct editorial design",()=>{
 for(const p of data.pages){const path="sites/min.ventures/"+(p.path?p.path+"/":"")+"index.html";assert.ok(existsSync(join(root,path)));
  const html=read(path);assert.ok(html.includes('class="venture-row"')||p.path==="about");
  assert.ok(html.includes('class="page-heading"'));assert.ok(html.includes("https://msihu.com/"));
  const ld=JSON.parse(html.split('<script type="application/ld+json">')[1].split('</script>')[0])["@graph"];
  assert.ok(ld.some(n=>n["@id"]==="https://msihu.com/#person"));
  assert.ok(ld.some(n=>n["@id"]==="https://actaroot.com/#organization"));
  assert.ok(ld.some(n=>n["@id"]==="https://actaroot.com/#brand-ohwut"));
  assert.equal(ld.find(n=>n["@id"]===data.origin+"/"+(p.path?p.path+"/":"")+"#webpage")["@type"],p.path==="ventures"?"CollectionPage":"ProfilePage");
  if(p.path)assert.ok(ld.some(n=>n["@type"]==="BreadcrumbList"));
  assert.ok(!/school|street address|full birth|private phone/i.test(html));
 }
 assert.ok(read("sites/min.ventures/style.css").includes(".venture-row"));
 const facts=JSON.parse(read("sites/min.ventures/facts.json"));assert.equal(facts.venturePortfolio.length,2);
});
