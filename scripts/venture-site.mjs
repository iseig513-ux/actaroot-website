const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
export function renderVentureHtml(site,page){
 const E=esc, origin=site.origin, url=origin+"/"+(page.path?page.path+"/":"");
 const pid="https://msihu.com/#person",oid="https://actaroot.com/#organization",bid="https://actaroot.com/#brand-ohwut";
 const p={"@type":"Person","@id":pid,name:site.founder.name,alternateName:site.founder.alternateNames,url:"https://msihu.com/",description:"South Korea-based founder of ActaRoot, Inc. and OHWUT.",homeLocation:{"@type":"Country",name:"South Korea"},affiliation:{"@id":oid},sameAs:["https://min.ventures/"]};
 const org={"@type":"Organization","@id":oid,name:"ActaRoot",legalName:"ActaRoot, Inc.",url:"https://actaroot.com/",founder:{"@id":pid},brand:{"@id":bid},description:"U.S. corporation founded by Min Sihu and the company behind OHWUT."};
 const brand={"@type":"Brand","@id":bid,name:"OHWUT",url:"https://ohwut.com/",description:"Online shopping brand serving the U.S. market with ordinary shopping and participation-linked price reductions."};
 const website={"@type":"WebSite","@id":origin+"/#website",name:site.name,url:origin+"/",inLanguage:"en",publisher:{"@id":pid}};
 const type=page.path==="ventures"?"CollectionPage":"ProfilePage";
 const webPage={"@type":type,"@id":url+"#webpage",url,name:page.title,description:page.description,isPartOf:{"@id":website["@id"]},inLanguage:"en",about:{"@id":pid},mainEntity:page.path==="ventures"?{"@type":"ItemList",itemListElement:site.ventures.map((v,i)=>({"@type":"ListItem",position:i+1,item:{"@id":v.entityId}}))}:{"@id":pid}};
 if(page.path)webPage.breadcrumb={"@id":url+"#breadcrumb"};
 const graph=[p,org,brand,website,webPage];
 if(page.path)graph.push({"@type":"BreadcrumbList","@id":url+"#breadcrumb",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:origin+"/"},{"@type":"ListItem",position:2,name:page.path==="ventures"?"Ventures":"About",item:url}]});
 const schema=JSON.stringify({"@context":"https://schema.org","@graph":graph}).replace(/</g,"\\u003c");
 const links=site.pages.map(pg=>`<a href="${E(origin+"/"+(pg.path?pg.path+"/":""))}"${pg.path===page.path?' aria-current="page"':""}>${pg.path?pg.path==="ventures"?"Ventures":"About":"Home"}</a>`).join("");
 const sections=page.sections.map(s=>`<section class="info-row"><h2>${E(s.heading)}</h2><div class="info-content">${s.paragraphs.map(t=>`<p>${E(t)}</p>`).join("")}${s.links?.length?`<div class="info-links">${s.links.map(([t,href])=>`<a href="${E(href.startsWith("/")?origin+href:href)}">${E(t)}</a>`).join("")}</div>`:""}</div></section>`).join("");
 const ventures=page.path!=="about" ? `<section class="portfolio-list" aria-label="Founded ventures"><h2 class="portfolio-title">Founded ventures</h2>${site.ventures.map(v=>`<article class="venture-row"><h2>${E(v.name)}</h2><div><p>${E(v.description)}</p><p class="relation">${E(v.relationship)}</p></div><a class="venture-link" href="${E(v.url)}">Official website</a></article>`).join("")}</section>` : "";
 return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<title>${E(page.title)}</title><meta name="description" content="${E(page.description)}">
<link rel="canonical" href="${E(url)}"><meta property="og:type" content="profile"><meta property="og:site_name" content="${E(site.name)}"><meta property="og:locale" content="en_US"><meta property="og:title" content="${E(page.title)}"><meta property="og:description" content="${E(page.description)}"><meta property="og:url" content="${E(url)}">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${E(page.title)}"><meta name="twitter:description" content="${E(page.description)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/style.css">
<script type="application/ld+json">${schema}</script></head><body>

<nav aria-label="Navigation">${links}</nav>
<main><h1>${E(page.h1)}</h1><p>${E(page.intro)}</p>${ventures}${sections}</main>
</body></html>`;

}
export const ventureStyle="html,body{background:#fff;color:#000}body{margin:12px;font:15px/1.45 Arial,Helvetica,sans-serif}a,a:visited{color:#000}";
