import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const data=JSON.parse(read("content/sites.json"))["min.ventures"];
test("private source retains the verified venture portfolio for future restoration",()=>{
 assert.equal(data.kind,"ventures");
 assert.deepEqual(data.ventures.map(v=>v.name),["ActaRoot, Inc.","OHWUT"]);
 assert.deepEqual(data.ventures.map(v=>v.url),["https://actaroot.com/","https://ohwut.com/"]);
 assert.deepEqual(data.pages.map(p=>p.path),["","ventures","about"]);
 assert.equal(data.founder.age.value,13);
 assert.equal(data.founder.age.asOf,"2026-11");
});
test("retired portfolio homepage exposes no public venture content",()=>{
 const html=read("sites/min.ventures/index.html");
 assert.ok(!html.includes("OHWUT"));
 assert.ok(!html.includes("ActaRoot"));
 assert.ok(!html.includes("<main>"));
 assert.ok(html.includes("noindex"));
});
