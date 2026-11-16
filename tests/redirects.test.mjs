import test from "node:test";import {handleRequest as tienda} from "../workers/oh-tienda/src/index.mjs";import assert from "node:assert/strict";import {handleRequest as wut} from "../workers/wut-sale/src/index.mjs";import {resolveApprovedLink} from "../workers/wut-sale/src/registry.mjs";
const req=(u,method="GET")=>new Request(u,{method,redirect:"manual"});
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

test("wut.sale rejects unsupported methods, hosts, unregistered paths and malicious target origins",()=>{
 assert.equal(wut(req("https://wut.sale/","POST")).status,405);
 assert.equal(wut(req("https://other.example/")).status,404);
 assert.equal(wut(req("https://wut.sale/not-registered")).headers.get("X-Robots-Tag"),"noindex");
 const links={
  "/external":"https://malicious.example/path",
  "/insecure":"http://ohwut.com/item",
  "/credentials":"https://user:pass@ohwut.com/path",
  "/fragment":"https://ohwut.com/path#frag",
  "/admin":"https://ohwut.com/admin",
  "/valid":"https://ohwut.com/products/sample"
 };
 for(const path of ["/external","/insecure","/credentials","/fragment","/admin"])assert.equal(wut(req("https://wut.sale"+path),links).status,404,path);
 assert.equal(wut(req("https://wut.sale/valid"),links).headers.get("Location"),links["/valid"]);
});

test("oh.tienda and www root redirect permanently to fixed official OHWUT URL",()=>{
 for(const host of ["oh.tienda","www.oh.tienda"]){for(const suffix of ["/","/?to=https://evil.example/","/?next=%2f%2fevil.example"]){const r=tienda(req("https://"+host+suffix));assert.equal(r.status,301);assert.equal(r.headers.get("Location"),"https://ohwut.com/");}}
});
test("oh.tienda fails closed for paths, non-HTTPS hosts and methods",()=>{
 for(const u of ["https://oh.tienda/x","https://www.oh.tienda/products/1","https://oh.tienda//evil.example","https://untrusted.example/","http://oh.tienda/","https://oh.tienda:444/"]){const r=tienda(req(u));assert.equal(r.status,404,u);assert.equal(r.headers.get("X-Robots-Tag"),"noindex");}
 for(const m of ["POST","PUT","DELETE"]){assert.equal(tienda(req("https://oh.tienda/",m)).status,405);}
 assert.equal(tienda(req("https://oh.tienda/","HEAD")).status,301);
});
