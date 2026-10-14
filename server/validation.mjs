export class HttpError extends Error { constructor(status,message,code){super(message);this.status=status;this.code=code;} }
const disciplines=new Set(["Attention","Will","Imagination","Mental Rapport"]);
export function validateCatalog(value,baseline){
 if(!Array.isArray(value)||value.length!==baseline.length)throw new HttpError(400,"Keep the existing exercise inventory.");
 const ids=new Set(baseline.map(e=>e.id)),seen=new Set();
 return value.map(e=>{
  if(!e||typeof e!=="object"||!ids.has(e.id)||seen.has(e.id))throw new HttpError(400,"Exercise IDs must be unique and match the existing catalog.");
  seen.add(e.id);
  for(const [key,max] of Object.entries({title:160,lesson:20,pdfPages:180,history:12000,notice:2000})){
   if(typeof e[key]!=="string"||!e[key].trim()||e[key].length>max)throw new HttpError(400,"Invalid "+key+" for "+e.id);
  }
  if(!disciplines.has(e.discipline)||!Number.isInteger(e.minutes)||e.minutes<1||e.minutes>120)throw new HttpError(400,"Invalid discipline or duration.");
  if(!Array.isArray(e.guided)||e.guided.length<2||e.guided.length>30||e.guided.some(s=>typeof s!=="string"||!s.trim()||s.length>2000))throw new HttpError(400,"Provide 2–30 non-empty guided steps.");
  const original=baseline.find(x=>x.id===e.id);
  // Provenance stays source-controlled; the editor changes content, not attribution.
  return {...original,title:e.title.trim(),discipline:e.discipline,minutes:e.minutes,guided:e.guided.map(s=>s.trim()),history:e.history.trim(),notice:e.notice.trim(),lesson:e.lesson.trim(),pdfPages:e.pdfPages.trim()};
 });
}
export function ownerPrincipal(data,ownerEmail){
 const user=data?.user;
 if(!user||typeof user.id!=="string"||user.email?.toLowerCase()!==ownerEmail.toLowerCase())throw new HttpError(403,"This account does not have admin access.");
 if(user.emailVerified!==true)throw new HttpError(403,"Verify your email before opening administration.","verification_required");
 return user;
}

