import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const config=JSON.parse(readFileSync(join(root,"content","sites.json"),"utf8"));
s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")

s=>escapeHtml(s)

function absolute(site,path=""){return site.origin+"/"+(path?path+"/":"")}

function makeSchema(site,page){
 const personId="https://msihu.com/#person", orgId="https://actaroot.com/#organization", brandId="https://actaroot.com/#brand-ohwut";
 const person={"@type":"Person","@id":personId,name:"Min Sihu",alternateName:["Sihu Min","민시후","Min","SIHU","M. Sihu"],url:"https://msihu.com/",sameAs:["https://min.tienda/"],description:"Founder of ActaRoot, Inc. and OHWUT, based in South Korea.",homeLocation:{"@type":"Country",name:"South Korea"},affiliation:{"@id":orgId}};
 const org={"@type":"Organization","@id":orgId,name:"ActaRoot",legalName:"ActaRoot, Inc.",alternateName:"ActaRoot, Inc.",url:"https://actaroot.com/",description:"U.S. corporation behind the OHWUT shopping brand.",founder:{"@id":personId},brand:{"@id":brandId}};
 const brand={"@type":"Brand","@id":brandId,name:"OHWUT",alternateName:"ohwut",url:"https://ohwut.com/",description:"Online shopping brand serving U.S. customers with ordinary shopping and participation-based price reductions."};
 const website={"@type":"WebSite","@id":site.origin+"/#website",name:site.name,url:site.origin+"/",publisher:{"@id":site.kind==="company"?orgId:personId},inLanguage:"en"};
 const url=absolute(site,page.path);
 const webpage={"@type":site.kind==="company"?(page.path==="about"?"AboutPage":"WebPage"):(page.path==="projects"?"CollectionPage":"ProfilePage"),"@id":url+"#webpage",url,name:page.title,description:page.description,isPartOf:{"@id":website["@id"]},inLanguage:"en",about:{"@id":site.kind==="company"?orgId:personId}};
 if(webpage["@type"]==="ProfilePage")webpage.mainEntity={"@id":personId};
 if(page.path){
  webpage.breadcrumb={"@id":url+"#breadcrumb"};
 }
 const nodes=[person,org,brand,website,webpage];
 if(page.path)nodes.push({"@type":"BreadcrumbList","@id":url+"#breadcrumb",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:site.origin+"/"},{"@type":"ListItem",position:2,name:page.h1,item:url}]});
 return {"@context":"https://schema.org","@graph":nodes};
}

function renderHtml(site,page){
 const url=absolute(site,page.path),nav=site.pages.map(p=>`<a href="${escapeHtml(absolute(site,p.path))}"${p.path===page.path?' aria-current="page"':""}>${escapeHtml(p.path?p.h1:"Home")}</a>`).join("");
 const sections=page.sections.map(s=>`<section><h2>${escapeHtml(s.heading)}</h2>${(s.paragraphs||[]).map(p=>`<p>${escapeHtml(p)}</p>`).join("")}${(s.links||[]).length?`<p class="links">${s.links.map(([label,href])=>`<a href="${escapeHtml(href.startsWith("/")?site.origin+href:href)}">${escapeHtml(label)}</a>`).join(" · ")}</p>`:""}</section>`).join("\n");
 const ld=JSON.stringify(makeSchema(site,page)).replace(/</g,"\\u003c");
 return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(page.title)}</title>
<meta name="description" content="${escapeHtml(page.description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${escapeHtml(url)}">
<meta property="og:type" content="${site.kind==="company"?"website":"profile"}">
<meta property="og:locale" content="en_US"><meta property="og:site_name" content="${escapeHtml(site.name)}">
<meta property="og:title" content="${escapeHtml(page.title)}"><meta property="og:description" content="${escapeHtml(page.description)}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escapeHtml(page.title)}">
<meta name="twitter:description" content="${escapeHtml(page.description)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="stylesheet" href="/style.css">
<script type="application/ld+json">${ld}</script>
</head><body><header class="wrap"><p class="brand"><a href="${escapeHtml(site.origin)}/">${escapeHtml(site.name)}</a></p><nav aria-label="Main navigation">${nav}</nav></header>
<main class="wrap"><p class="eyebrow">Official ${site.kind==="company"?"company information":"founder profile"}</p><h1>${escapeHtml(page.h1)}</h1><p class="intro">${escapeHtml(page.intro)}</p>${sections}</main>
<footer class="wrap"><p>Official information: <a href="https://actaroot.com/">ActaRoot</a> · <a href="https://msihu.com/">Min Sihu</a> · <a href="https://min.tienda/">Min</a> · <a href="https://ohwut.com/">OHWUT</a></p><p class="small">This page states publicly identified facts; no customer numbers, investor claims or unverified partnerships are presented.</p></footer></body></html>`;
}

function renderSitemap(site){
 return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${site.pages.map(p=>`  <url><loc>${escapeXml(absolute(site,p.path))}</loc></url>`).join("\n")}\n</urlset>`;
}

function renderRobots(site){
 return `User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n\nSitemap: ${site.origin}/sitemap.xml`;
}

function renderLlms(site){
 return `# ${site.name}\n\n> ${site.tagline}\n\nPrimary pages:\n${site.pages.map(p=>`- [${p.title}](${absolute(site,p.path)})`).join("\n")}\n\nRelated primary sources:\n- [ActaRoot official company source](https://actaroot.com/)\n- [Min Sihu official profile](https://msihu.com/)\n- [OHWUT official shopping source](https://ohwut.com/)\n\nThis optional discovery file is not a ranking directive. Follow actual page content and canonical URLs.`;
}

function renderFavicon(site){
 const t=site.kind==="company"?"AR":site.kind==="person"?"MS":"MIN";
 return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect x="0" y="0" width="64" height="64" rx="12" fill="#111827"/><text x="32" y="39" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="${t.length===3?20:26}" fill="white">${t}</text></svg>`;
}

function render404(site){
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | ${escapeHtml(site.name)}</title><link rel="canonical" href="${site.origin}/"><link rel="stylesheet" href="/style.css"></head><body><main class="wrap"><h1>Page not found</h1><p>This address is not a published page.</p><a href="${site.origin}/">Return home</a></main></body></html>`;
}
const style=":root{font-family:system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;color:#17202b;background:#fff;font-synthesis:none}*{box-sizing:border-box}body{margin:0;line-height:1.7}.wrap{width:min(780px,calc(100% - 40px));margin:auto}header{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:24px 0;border-bottom:1px solid #e4e7eb}.brand{margin:0;font-weight:750}a{color:#204c8c;text-decoration-thickness:1px;text-underline-offset:3px}nav{display:flex;gap:12px;flex-wrap:wrap}nav a{font-size:14px}.eyebrow{margin:54px 0 4px;color:#667085;font-size:13px;letter-spacing:.09em;text-transform:uppercase}h1{font-size:clamp(2.2rem,6vw,3.5rem);line-height:1.1;letter-spacing:-.035em;margin:0 0 23px}h2{font-size:1.35rem;letter-spacing:-.02em;margin:0 0 10px}.intro{font-size:1.15rem;color:#344054;line-height:1.7;margin:0 0 50px}section{padding:24px 0;border-top:1px solid #eaecf0}section p{margin:8px 0 14px}.links a{font-weight:650}footer{border-top:1px solid #e5e7eb;padding:24px 0 38px;margin-top:48px;color:#475467}.small{font-size:12px;color:#667085}@media(max-width:650px){header{align-items:flex-start;flex-direction:column}.eyebrow{margin-top:36px}}";
const outputRoot=join(root,"sites");
rmSync(outputRoot,{recursive:true,force:true});
for(const [domain,site] of Object.entries(config)){
 const dir=join(outputRoot,domain);mkdirSync(dir,{recursive:true});
 const write=(path,text)=>{const destination=join(dir,path);mkdirSync(dirname(destination),{recursive:true});writeFileSync(destination,text+"\n","utf8")};
 for(const page of site.pages)write(page.path?page.path+"/index.html":"index.html",renderHtml(site,page));
 write("sitemap.xml",renderSitemap(site));write("robots.txt",renderRobots(site));write("llms.txt",renderLlms(site));
 write("404.html",render404(site));write("favicon.svg",renderFavicon(site));write("style.css",style);
}
console.log("Built "+Object.keys(config).join(", ")+" static sites.");
