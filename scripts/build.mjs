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
 const nav=site.pages.map(p=>`<a href="${escapeHtml(absolute(site,p.path))}"${p.path===page.path?' aria-current="page"':""}>${escapeHtml(p.path?p.h1:"Home")}</a>`).join("");
 const sections=page.sections.map((s,i)=>`<section class="section"><span class="section-num" aria-hidden="true">${String(i+1).padStart(2,"0")}</span><div><h2>${escapeHtml(s.heading)}</h2>${s.paragraphs.map(p=>`<p>${escapeHtml(p)}</p>`).join("")}${s.links?.length?`<p class="links">${s.links.map(([label,href])=>`<a href="${escapeHtml(href.startsWith("/")?site.origin+href:href)}">${escapeHtml(label)} ↗</a>`).join(" &nbsp; ")}</p>`:""}</div></section>`).join("\n");
 const ld=JSON.stringify(makeSchema(site,page)).replace(/</g,"\\u003c");
 return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="color-scheme" content="light">\n<title>${escapeHtml(page.title)}</title>\n<meta name="description" content="${escapeHtml(page.description)}">\n${verificationTags(site)}<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">\n<link rel="canonical" href="${escapeHtml(url)}">\n<meta property="og:type" content="${site.kind==="company"?"website":"profile"}">\n<meta property="og:locale" content="en_US">\n<meta property="og:site_name" content="${escapeHtml(site.name)}">\n<meta property="og:title" content="${escapeHtml(page.title)}"><meta property="og:description" content="${escapeHtml(page.description)}">\n<meta property="og:url" content="${escapeHtml(url)}">\n<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escapeHtml(page.title)}">\n<meta name="twitter:description" content="${escapeHtml(page.description)}">\n<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/style.css">\n<script type="application/ld+json">${ld}</script></head><body>\n<a class="skip" href="#main">Skip to content</a>\n<header class="header"><div class="wrap header-row"><a class="logo" href="${site.origin}/"><span class="logo-square">${site.kind==="company"?"A":site.kind==="person"?"S":"M"}</span>${escapeHtml(site.name)}</a><nav aria-label="Main">${nav}</nav></div></header>\n<main class="wrap" id="main"><div class="hero"><p class="eyebrow">${site.kind==="company"?"ACTAROOT · COMPANY":"MIN SIHU · FOUNDER"}</p><h1>${escapeHtml(page.h1)}</h1><p class="lead">${escapeHtml(page.intro)}</p></div>${sections}</main>\n<footer class="footer"><div class="wrap"><strong>Official network</strong><p><a href="https://actaroot.com/">ActaRoot</a> · <a href="https://msihu.com/">Min Sihu</a> · <a href="https://ohwut.com/">OHWUT</a></p></div></footer></body></html>`;
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
 return JSON.stringify({site:site.name,canonicalOrigin:site.origin,summary:site.tagline,primaryEntityId:site.kind==="company"?"https://actaroot.com/#organization":"https://msihu.com/#person",entityIdentifiers:{person:"https://msihu.com/#person",organization:"https://actaroot.com/#organization",brand:"https://actaroot.com/#brand-ohwut"},officialDomains:{company:"https://actaroot.com/",founder:"https://msihu.com/",brand:"https://ohwut.com/"},pages:site.pages.map(p=>({url:absolute(site,p.path),title:p.title,description:p.description,sections:p.sections.map(s=>s.heading)}))},null,2);
}

function renderFavicon(site){
 const t=site.kind==="company"?"AR":site.kind==="person"?"MS":"MIN";
 return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect x="0" y="0" width="64" height="64" rx="12" fill="#111827"/><text x="32" y="39" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="${t.length===3?20:26}" fill="white">${t}</text></svg>`;
}

function render404(site){
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | ${escapeHtml(site.name)}</title><link rel="canonical" href="${site.origin}/"><link rel="stylesheet" href="/style.css"></head><body><main class="wrap"><h1>Page not found</h1><p>This address is not a published page.</p><a href="${site.origin}/">Return home</a></main></body></html>`;
}
const style=":root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;color:#172132;background:#fff;font-synthesis:none}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;line-height:1.72}a{color:inherit;text-underline-offset:4px}a:focus-visible{outline:3px solid #5484cf;outline-offset:3px}.wrap{width:min(1060px,calc(100% - 48px));margin:auto}.skip{position:absolute;left:-9999px;top:8px;background:#fff;padding:10px 14px}.skip:focus{left:8px}.header{border-bottom:1px solid #e4e8ee}.header-row{display:flex;gap:24px;align-items:center;justify-content:space-between;padding:19px 0}.logo{display:inline-flex;align-items:center;gap:12px;text-decoration:none;font-size:16px;font-weight:750}.logo-square{display:grid;place-items:center;width:36px;height:36px;border-radius:8px;background:#10192c;color:#fff}.header nav{display:flex;flex-wrap:wrap;gap:10px 17px}.header nav a{font-size:13px;color:#58647a;text-decoration:none}.header nav a[aria-current=page],.header nav a:hover{color:#10192c;text-decoration:underline}.hero{padding:92px 0 69px}.eyebrow{font-size:11px;font-weight:750;letter-spacing:.17em;color:#506da0;margin:0 0 19px}.hero h1{font-size:clamp(3.15rem,8vw,6.4rem);letter-spacing:-.075em;line-height:1.05;margin:0 0 25px;max-width:900px}.lead{font-size:clamp(1.25rem,2.6vw,1.7rem);letter-spacing:-.025em;color:#4b5a71;max-width:650px;margin:0}.section{display:grid;grid-template-columns:140px minmax(0,1fr);gap:32px;padding:47px 0;border-top:1px solid #e6eaf0}.section-num{color:#8f9aae;font-size:12px;letter-spacing:.07em}.section div{max-width:710px}.section h2{font-size:clamp(1.45rem,3vw,2rem);letter-spacing:-.05em;line-height:1.22;margin:0 0 20px}.section p{font-size:15.5px;line-height:1.82;color:#47566b;margin:0 0 16px}.section p.links{margin-top:26px;display:flex;flex-wrap:wrap;gap:6px 20px}.links a{font-size:13px;color:#214b88;font-weight:700;text-decoration:none;border-bottom:1px solid #b7cbe7}.links a:hover{color:#0c2e61}.footer{background:#101929;color:#e9effb;padding:45px 0;margin-top:66px}.footer strong{font-size:12px;letter-spacing:.1em;text-transform:uppercase}.footer p{font-size:14px;color:#bfccdd}.footer a{text-decoration:none;color:#f1f4f9}.footer a:hover{text-decoration:underline}@media(max-width:700px){.wrap{width:calc(100% - 32px)}.header-row{align-items:flex-start;flex-direction:column;gap:16px}.header nav{gap:9px 13px}.hero{padding:58px 0 41px}.section{grid-template-columns:30px minmax(0,1fr);gap:10px;padding:31px 0}.section p{font-size:14.5px}}";
const outputRoot=join(root,"sites");
rmSync(outputRoot,{recursive:true,force:true});
mkdirSync(outputRoot,{recursive:true});
writeFileSync(join(outputRoot,".gitkeep"),"# Build outputs are committed under sites/<domain>/.\n","utf8");
for(const [domain,site] of Object.entries(config)){
 const dir=join(outputRoot,domain);mkdirSync(dir,{recursive:true});
 const write=(path,text)=>{const destination=join(dir,path);mkdirSync(dirname(destination),{recursive:true});writeFileSync(destination,text+"\n","utf8")};
 for(const page of site.pages)write(page.path?page.path+"/index.html":"index.html",renderHtml(site,page));
 write("sitemap.xml",renderSitemap(site));write("robots.txt",renderRobots(site));write("llms.txt",renderLlms(site));write("llms-full.txt",renderFull(site));write("facts.json",renderFacts(site));
 write("404.html",render404(site));write("favicon.svg",renderFavicon(site));write("style.css",style);
}
console.log("Built "+Object.keys(config).join(", ")+" static sites.");
