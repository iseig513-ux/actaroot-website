const ALLOWED_HOSTS=new Set(["oh.tienda","www.oh.tienda"]);
const DESTINATION="https://ohwut.com/";
export function handleRequest(request){
 const url=new URL(request.url);
 if(url.protocol!=="https:"||url.port!==""||!ALLOWED_HOSTS.has(url.hostname.toLowerCase()))return new Response("Not found",{status:404,headers:{"Content-Type":"text/plain; charset=utf-8","X-Robots-Tag":"noindex"}});
 if(!["GET","HEAD"].includes(request.method))return new Response("Method not allowed",{status:405,headers:{Allow:"GET, HEAD"}});
 if(url.pathname!=="/")return new Response("Not found",{status:404,headers:{"Content-Type":"text/plain; charset=utf-8","X-Robots-Tag":"noindex"}});
 return new Response(null,{status:301,headers:{Location:DESTINATION,"Cache-Control":"public, max-age=3600","X-Robots-Tag":"noindex"}});
}
export default {fetch:handleRequest};
