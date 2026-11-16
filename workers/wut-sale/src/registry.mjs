// Empty by design. Share-link paths have not been approved or launched.
// Populate only with reviewed, internal paths and real canonical OHWUT destinations.
export const approvedLinks=Object.freeze({});
export function resolveApprovedLink(pathname,links=approvedLinks) {
 if(!Object.prototype.hasOwnProperty.call(links,pathname))return null;
 const raw=links[pathname];
 if(typeof raw!=="string")return null;
 let url;try{url=new URL(raw)}catch{return null}
 if(url.protocol!=="https:"||url.origin!=="https://ohwut.com"||url.username||url.password||url.hash)return null;
 if(url.pathname.startsWith("//")||/(?:^|\/)\.{1,2}(?:\/|$)/.test(url.pathname))return null;
 if(/^\/(api|admin|checkout|account|login)(\/|$)/i.test(url.pathname))return null;
 return url.toString();
}
