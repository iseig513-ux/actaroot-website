import {renderVentureHtml, ventureStyle} from "./venture-site.mjs";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const config=JSON.parse(readFileSync(join(root,"content","sites.json"),"utf8"));
const escapeHtml=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")

const escapeXml=s=>escapeHtml(s)

function absolute(site,path=""){return site.origin+"/"+(path?path+"/":"")}

function makeSchema(site,page){
 const personId="https://msihu.com/#person",orgId="https://actaroot.com/#organization",brandId="https://actaroot.com/#brand-ohwut";
 const person={"@type":"Person","@id":personId,name:"Min Sihu",alternateName:["Sihu Min","민시후","Min","SIHU","M. Sihu"],url:"https://msihu.com/",description:"Founder of ActaRoot, Inc. and OHWUT, based in South Korea.",homeLocation:{"@type":"Country",name:"South Korea"},affiliation:{"@id":orgId}};
 const org={"@type":"Organization","@id":orgId,name:"ActaRoot",legalName:"ActaRoot, Inc.",alternateName:"ActaRoot, Inc.",url:"https://actaroot.com/",description:"U.S. corporation behind the OHWUT shopping brand.",founder:{"@id":personId},brand:{"@id":brandId}};
 const brand={"@type":"Brand","@id":brandId,name:"OHWUT",alternateName:"ohwut",url:"https://ohwut.com/",description:"Online shopping brand serving U.S. customers with ordinary shopping and participation-based price reductions."};
 const website={"@type":"WebSite","@id":site.origin+"/#website",name:site.name,url:site.origin+"/",publisher:{"@id":site.kind==="company"?orgId:personId},inLanguage:"en"};
 const url=absolute(site,page.path);
 const type=page.path==="faq"?"FAQPage":site.kind==="company"?(page.path==="about"?"AboutPage":"WebPage"):(page.path==="projects"?"CollectionPage":"ProfilePage");
 const webpage={"@type":type,"@id":url+"#webpage",url,name:page.title,description:page.description,isPartOf:{"@id":website["@id"]},inLanguage:"en",about:{"@id":site.kind==="company"?orgId:personId}};
 if(type==="ProfilePage"||page.path==="founder")webpage.mainEntity={"@id":personId};
 if(site.kind==="company"&&page.path==="brands")webpage.mainEntity={"@id":brandId};
 if(type==="FAQPage")webpage.mainEntity=page.sections.map(s=>({"@type":"Question",name:s.heading,acceptedAnswer:{"@type":"Answer",text:s.paragraphs.join(" ")}}));
 if(page.path)webpage.breadcrumb={"@id":url+"#breadcrumb"};
 const graph=[person,org,brand,website,webpage];
 if(page.path)graph.push({"@type":"BreadcrumbList","@id":url+"#breadcrumb",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:site.origin+"/"},{"@type":"ListItem",position:2,name:page.h1,item:url}]});
 return {"@context":"https://schema.org","@graph":graph};
}

function verificationTags(site){
 const suffix=site.origin.replace("https://","").replace(/[^a-zA-Z0-9]/g,"_").toUpperCase();
 const google=process.env["GOOGLE_SITE_VERIFICATION_"+suffix];
 const bing=process.env["BING_SITE_VERIFICATION_"+suffix];
 const tags=[];
 if(google)tags.push('<meta name="google-site-verification" content="'+escapeHtml(google)+'">');
 if(bing)tags.push('<meta name="msvalidate.01" content="'+escapeHtml(bing)+'">');
 return tags.length?tags.join("\n")+"\n":"";
}
function renderHtml(site,page){
 const url=absolute(site,page.path);
 const menu=site.pages.map(p=>`<a href="${escapeHtml(absolute(site,p.path))}"${p.path===page.path?' aria-current="page"':""}>${escapeHtml(p.path?({"about":"Company","brands":"Brands","founder":"Founder","faq":"FAQ","projects":"Projects"}[p.path]||p.h1):"Home")}</a>`).join("");
 const rows=page.sections.map(s=>`<section class="info-row"><h2>${escapeHtml(s.heading)}</h2><div class="info-content">${s.paragraphs.map(p=>`<p>${escapeHtml(p)}</p>`).join("")}${s.links?.length?`<div class="info-links">${s.links.map(([label,href])=>`<a href="${escapeHtml(href.startsWith("/")?site.origin+href:href)}">${escapeHtml(label)}</a>`).join("")}</div>`:""}</div></section>`).join("\n");
 const ld=JSON.stringify(makeSchema(site,page)).replace(/</g,"\\u003c");
 return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(page.title)}</title>
<meta name="description" content="${escapeHtml(page.description)}">
${verificationTags(site)}<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<link rel="canonical" href="${escapeHtml(url)}">
<meta property="og:type" content="${site.kind==="company"?"website":"profile"}">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="${escapeHtml(site.name)}">
<meta property="og:title" content="${escapeHtml(page.title)}"><meta property="og:description" content="${escapeHtml(page.description)}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escapeHtml(page.title)}">
<meta name="twitter:description" content="${escapeHtml(page.description)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/style.css">
<script type="application/ld+json">${ld}</script></head><body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap site-header-inner"><a class="brand" href="${site.origin}/">${escapeHtml(site.name)}</a><nav class="site-nav" aria-label="Main navigation">${menu}</nav></div></header>
<main class="wrap" id="main"><div class="page-heading"><h1>${escapeHtml(page.h1)}</h1><p class="lead">${escapeHtml(page.intro)}</p></div><div class="info-list">${rows}</div></main>
<footer class="site-footer"><div class="wrap site-footer-inner"><span>${escapeHtml(site.name)}</span><nav aria-label="Related sites"><a href="https://actaroot.com/">ActaRoot</a><a href="https://msihu.com/">Min Sihu</a><a href="https://ohwut.com/">OHWUT</a></nav></div></footer></body></html>`;
}

function renderSitemap(site){
 return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${site.pages.map(p=>`  <url><loc>${escapeXml(absolute(site,p.path))}</loc></url>`).join("\n")}\n</urlset>`;
}

function renderRobots(site){
 const agents=["Googlebot","Google-Extended","OAI-SearchBot","ChatGPT-User","Claude-SearchBot","Claude-User","PerplexityBot","Perplexity-User","Bingbot"];
 return "User-agent: *\nAllow: /\n\n"+agents.map(x=>"User-agent: "+x+"\nAllow: /").join("\n\n")+"\n\nUser-agent: GPTBot\nDisallow: /\n\nUser-agent: ClaudeBot\nDisallow: /\n\nSitemap: "+site.origin+"/sitemap.xml";
}

function renderLlms(site){
 return `# ${site.name}\n\n> ${site.tagline}\n\n## Official pages\n${site.pages.map(p=>`- [${p.title}](${absolute(site,p.path)}): ${p.description}`).join("\n")}\n\n## Related official sources\n- [ActaRoot, Inc.](https://actaroot.com/)\n- [Min Sihu](https://msihu.com/)\n- [OHWUT](https://ohwut.com/)\n\n## Reference files\n- [Full public page text](${site.origin}/llms-full.txt)\n- [Structured site facts](${site.origin}/facts.json)`;
}

function renderFull(site){
 return `# ${site.name}\n\n${site.tagline}\n\n${site.pages.map(p=>`## ${p.h1}\n\nOfficial page: ${absolute(site,p.path)}\n\n${p.intro}\n\n${p.sections.map(s=>`### ${s.heading}\n\n${s.paragraphs.join("\n\n")}${s.links?.length?"\n\n"+s.links.map(([label,href])=>`- ${label}: ${href.startsWith("/")?site.origin+href:href}`).join("\n"):""}`).join("\n\n")}`).join("\n\n---\n\n")}\n\n## Official destinations\n- Company: https://actaroot.com/\n- Founder: https://msihu.com/\n- Shopping brand: https://ohwut.com/`;
}

function renderFacts(site){
 return JSON.stringify({site:site.name,canonicalOrigin:site.origin,summary:site.tagline,primaryEntityId:site.kind==="company"?"https://actaroot.com/#organization":"https://msihu.com/#person",entityIdentifiers:{person:"https://msihu.com/#person",organization:"https://actaroot.com/#organization",brand:"https://actaroot.com/#brand-ohwut"},officialDomains:{company:"https://actaroot.com/",founder:"https://msihu.com/",brand:"https://ohwut.com/"},pages:site.pages.map(p=>({url:absolute(site,p.path),title:p.title,description:p.description,sections:p.sections.map(s=>s.heading)})),...(site.kind==="ventures"?{venturePortfolio:site.ventures.map(v=>({name:v.name,description:v.description,relationship:v.relationship,officialSite:v.url,entityId:v.entityId}))}:{})},null,2);
}

function renderFavicon(site){
 const t=site.kind==="company"?"AR":site.kind==="person"?"MS":"MIN";
 return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect x="0" y="0" width="64" height="64" rx="12" fill="#111827"/><text x="32" y="39" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="${t.length===3?20:26}" fill="white">${t}</text></svg>`;
}

function render404(site){
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | ${escapeHtml(site.name)}</title><link rel="canonical" href="${site.origin}/"><link rel="stylesheet" href="/style.css"></head><body><main class="wrap"><h1>Page not found</h1><p>This address is not a published page.</p><a href="${site.origin}/">Return home</a></main></body></html>`;
}
const style=":root{font-family:Arial,Helvetica,ui-sans-serif,system-ui,sans-serif;font-synthesis:none;color:#1a1a1a;background:#fff;--line:#e4e4e4;--muted:#585858}\n*{box-sizing:border-box}\nbody{margin:0;font-size:15px;line-height:1.6}\na{color:inherit;text-underline-offset:3px}\na:focus-visible{outline:2px solid #1b5bb8;outline-offset:4px}\n.wrap{width:min(920px,calc(100% - 56px));margin-inline:auto}\n.skip{position:absolute;top:0;left:-9999px;padding:10px 14px;background:#fff;z-index:10}.skip:focus{left:8px}\n.site-header{border-bottom:1px solid var(--line)}\n.site-header-inner{min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:18px}\n.brand{font-size:17px;font-weight:700;letter-spacing:-.02em;text-decoration:none}\n.site-nav{display:flex;flex-wrap:wrap;gap:10px 23px}\n.site-nav a{font-size:13px;color:#555;text-decoration:none}\n.site-nav a[aria-current=page]{color:#111;font-weight:700}\n.site-nav a:hover{text-decoration:underline}\n.page-heading{padding:65px 0 45px;border-bottom:1px solid var(--line)}\n.page-heading h1{font-size:clamp(31px,5vw,49px);font-weight:700;letter-spacing:-.04em;line-height:1.16;margin:0 0 16px}\n.lead{color:var(--muted);max-width:660px;font-size:17px;line-height:1.65;margin:0}\n.info-list{padding-bottom:45px}\n.info-row{display:grid;grid-template-columns:210px minmax(0,1fr);gap:30px;padding:31px 0;border-bottom:1px solid var(--line)}\n.info-row h2{font-size:15px;font-weight:700;line-height:1.5;margin:0}\n.info-content p{margin:0 0 11px;color:#484848;line-height:1.75}\n.info-content p:last-child{margin-bottom:0}\n.info-links{display:flex;flex-wrap:wrap;gap:8px 22px;margin-top:15px}\n.info-links a{font-size:13px;font-weight:600;text-decoration:underline}\n.site-footer{border-top:1px solid var(--line);margin-top:35px}\n.site-footer-inner{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:24px 0;font-size:12px;color:#666}\n.site-footer-inner nav{display:flex;flex-wrap:wrap;gap:8px 18px}\n.site-footer-inner a{color:#444;text-decoration:none}\n.site-footer-inner a:hover{text-decoration:underline}\n.portfolio-list{margin-top:0}\n.venture-row{border-bottom:1px solid var(--line);padding:27px 0;display:grid;grid-template-columns:210px 1fr auto;gap:30px}\n.venture-row h2{font-size:17px;margin:0;font-weight:700}\n.venture-row p{color:#555;line-height:1.75;margin:0}\n.venture-row .relation{font-size:12px;margin-top:8px}\n.venture-link{font-size:13px;font-weight:600;white-space:nowrap}\n.portfolio-title{font-size:14px;margin:45px 0 0;font-weight:700}\n@media(max-width:720px){\n.wrap{width:calc(100% - 36px)}\n.site-header-inner{padding:17px 0;min-height:auto;align-items:flex-start;flex-direction:column;gap:12px}\n.site-nav{gap:8px 18px}\n.page-heading{padding:44px 0 31px}\n.page-heading h1{font-size:35px}\n.lead{font-size:15px}\n.info-row{display:block;padding:25px 0}\n.info-row h2{margin-bottom:9px}\n.info-content p{font-size:14px}\n.venture-row{display:block}\n.venture-row h2{margin-bottom:8px}\n.venture-row .venture-link{display:inline-block;margin-top:13px}\n.site-footer-inner{align-items:flex-start;flex-direction:column;gap:11px}\n}\n";
const outputRoot=join(root,"sites");
rmSync(outputRoot,{recursive:true,force:true});
mkdirSync(outputRoot,{recursive:true});
writeFileSync(join(outputRoot,".gitkeep"),"# Build outputs are committed under sites/<domain>/.\n","utf8");
for(const [domain,site] of Object.entries(config)){
 const dir=join(outputRoot,domain);mkdirSync(dir,{recursive:true});
 const write=(path,text)=>{const destination=join(dir,path);mkdirSync(dirname(destination),{recursive:true});writeFileSync(destination,text+"\n","utf8")};
 for(const page of site.pages)write(page.path?page.path+"/index.html":"index.html",site.kind==="ventures"?renderVentureHtml(site,page):renderHtml(site,page));
 write("sitemap.xml",renderSitemap(site));write("robots.txt",renderRobots(site));write("llms.txt",renderLlms(site));write("llms-full.txt",renderFull(site));write("facts.json",renderFacts(site));
 write("404.html",render404(site));write("favicon.svg",renderFavicon(site));write("style.css",site.kind==="ventures"?ventureStyle:style);
}
console.log("Built "+Object.keys(config).join(", ")+" static sites.");
