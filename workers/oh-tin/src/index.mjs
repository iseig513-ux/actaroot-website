const ALLOWED_HOSTS = new Set(["oh.tin","www.oh.tin"]);
export function handleRequest(request) {
 const url=new URL(request.url);
 if(!ALLOWED_HOSTS.has(url.hostname.toLowerCase()))return new Response("Not found",{status:404,headers:{"X-Robots-Tag":"noindex"}});
 if(!["GET","HEAD"].includes(request.method))return new Response("Method not allowed",{status:405,headers:{Allow:"GET, HEAD"}});
 if(url.pathname==="/robots.txt")return new Response("User-agent: *\nAllow: /\n",{headers:{"Content-Type":"text/plain; charset=utf-8"}});
 if(url.pathname!=="/")return new Response("Not found",{status:404,headers:{"X-Robots-Tag":"noindex","Content-Type":"text/plain; charset=utf-8"}});
 return new Response(null,{status:301,headers:{Location:"https://ohwut.com/","Cache-Control":"public, max-age=3600"}});
}
export default {fetch:handleRequest};
