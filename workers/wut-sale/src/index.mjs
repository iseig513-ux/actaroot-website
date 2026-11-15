import {approvedLinks,resolveApprovedLink} from "./registry.mjs";
const ALLOWED_HOSTS=new Set(["wut.sale","www.wut.sale"]);
export function handleRequest(request,links=approvedLinks){
 const url=new URL(request.url);
 if(!ALLOWED_HOSTS.has(url.hostname.toLowerCase()))return new Response("Not found",{status:404,headers:{"X-Robots-Tag":"noindex"}});
 if(!["GET","HEAD"].includes(request.method))return new Response("Method not allowed",{status:405,headers:{Allow:"GET, HEAD"}});
 if(url.pathname==="/robots.txt")return new Response("User-agent: *\nAllow: /\n",{headers:{"Content-Type":"text/plain; charset=utf-8"}});
 if(url.pathname==="/")return new Response(null,{status:301,headers:{Location:"https://ohwut.com/","Cache-Control":"public, max-age=3600"}});
 const target=resolveApprovedLink(url.pathname,links);
 if(!target)return new Response("Share link not found",{status:404,headers:{"X-Robots-Tag":"noindex","Content-Type":"text/plain; charset=utf-8"}});
 return new Response(null,{status:302,headers:{Location:target,"Cache-Control":"no-store"}});
}
export default {fetch:handleRequest};
