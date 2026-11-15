import test from "node:test";import assert from "node:assert/strict";import {handleRequest as oh} from "../workers/oh-tin/src/index.mjs";import {handleRequest as wut} from "../workers/wut-sale/src/index.mjs";import {resolveApprovedLink} from "../workers/wut-sale/src/registry.mjs";
const req=(u,method="GET")=>new Request(u,{method,redirect:"manual"});
test("oh.tin root permanently redirects with canonical target",()=>{
 for(const host of ["oh.tin","www.oh.tin"]){const r=oh(req("https://"+host+"/"));assert.equal(r.status,301);assert.equal(r.headers.get("Location"),"https://ohwut.com/")}
 assert.equal(oh(req("https://oh.tin/other")).status,404);
 assert.equal(oh(req("https://malicious.example/")).status,404);
 assert.equal(oh(req("https://oh.tin/","POST")).status,405);
});
test("wut.sale root redirects; unused paths and open redirect inputs cannot redirect",()=>{
 for(const h of ["wut.sale","www.wut.sale"]){const r=wut(req("https://"+h+"/"));assert.equal(r.status,301);assert.equal(r.headers.get("Location"),"https://ohwut.com/")}
 for(const p of ["/p/example","/s/example","/c/example","/?url=https://bad.example"]) {
  const r=wut(req("https://wut.sale"+p));
  if(p.startsWith("/?"))assert.equal(r.status,301);else assert.equal(r.status,404);
 }
 assert.equal(wut(req("https://fake.example/p/a")).status,404);
});
test("approved future links accept official HTTPS only and remain temporary redirects",()=>{
 const links={"/approved":"https://ohwut.com/products/example","/attack":"https://evil.example/","/port":"https://ohwut.com:444/x","/login":"https://ohwut.com/checkout/x","/cred":"https://user@ohwut.com/path"};
 assert.equal(resolveApprovedLink("/approved",links),"https://ohwut.com/products/example");
 for(const p of ["/attack","/port","/login","/cred","/unknown"])assert.equal(resolveApprovedLink(p,links),null,p);
 const r=wut(req("https://wut.sale/approved"),links);assert.equal(r.status,302);assert.equal(r.headers.get("Location"),links["/approved"]);
 assert.equal(r.headers.get("Cache-Control"),"no-store");
});
