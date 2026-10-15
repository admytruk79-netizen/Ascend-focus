import {createServer} from "node:http";
import {createHash,randomBytes} from "node:crypto";
import {HttpError,validateCatalog,ownerPrincipal} from "./validation.mjs";
const hash=v=>createHash("sha256").update(v).digest("hex");
export function createApi({db,baseline,authUrl,ownerEmail,origins,fetcher=fetch}){
 const allowed=new Set(origins);
 let apkCache=null;
 async function auth(path,body,cookies){
  const response=await fetcher(authUrl+"/"+path,{method:body?"POST":"GET",headers:{"content-type":"application/json",...(cookies?{cookie:cookies}:{}),origin:origins[0]},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new HttpError(response.status===429?429:400,"Authentication failed. Check your details and try again.");
  const cookieValues=response.headers.getSetCookie?.()??[];
  const cookie=cookieValues.map(c=>c.split(";")[0]).join("; ");
  return {data,cookie};
 }
 async function bodyOf(req){
  let body="",bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>150000)throw new HttpError(413,"Request too large.");body+=chunk.toString();}
  try{return JSON.parse(body||"{}");}catch{throw new HttpError(400,"Invalid request.");}
 }
 async function limited(req,email){
  // Render appends the client IP; do not trust the first user-supplied proxy entry.
  const forwarded=String(req.headers["x-forwarded-for"]??"").split(",").map(x=>x.trim());
  const ip=forwarded.at(-1)||req.socket.remoteAddress||"unknown";
  for(const [key,max] of [[hash("ip:"+ip),30],[hash("email:"+email),12]]){
   const r=await db.query("INSERT INTO focus_auth_attempts(key_hash,attempts,window_end) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key_hash) DO UPDATE SET attempts=CASE WHEN focus_auth_attempts.window_end<now() THEN 1 ELSE focus_auth_attempts.attempts+1 END,window_end=CASE WHEN focus_auth_attempts.window_end<now() THEN now()+interval '15 minutes' ELSE focus_auth_attempts.window_end END RETURNING attempts",[key]);
   if(r.rows[0].attempts>max)throw new HttpError(429,"Too many attempts. Try again in 15 minutes.");
  }
 }
 async function principal(req){
  const token=/^Bearer ([A-Za-z0-9_-]{43})$/.exec(String(req.headers.authorization??""))?.[1];
  if(!token)throw new HttpError(401,"Admin login required.");
  const r=await db.query("SELECT auth_cookies,email FROM focus_admin_sessions WHERE token_hash=$1 AND expires_at>now()",[hash(token)]);
  if(!r.rows[0])throw new HttpError(401,"Your admin session has expired. Sign in again.");
  let data;try{({data}=await auth("get-session",null,r.rows[0].auth_cookies));}catch{throw new HttpError(401,"Your admin session has expired. Sign in again.");}
  const user=ownerPrincipal(data,ownerEmail);return {user,token};
 }
 const server=createServer(async(req,res)=>{
  const send=(status,data)=>{res.writeHead(status,{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","referrer-policy":"no-referrer"});res.end(JSON.stringify(data));};
  try{
   const origin=req.headers.origin;
   if(origin&&!allowed.has(origin))throw new HttpError(403,"Origin is not allowed.");
   if(origin){res.setHeader("access-control-allow-origin",origin);res.setHeader("vary","Origin");}
   res.setHeader("access-control-allow-headers","Content-Type,Authorization");
   res.setHeader("access-control-allow-methods","GET,POST,PUT,OPTIONS");
   if(req.method==="OPTIONS"){res.writeHead(204);res.end();return;}
   const path=new URL(req.url,"http://localhost").pathname;
   if(path==="/downloads/ASCEND-Focus.apk"&&(req.method==="GET"||req.method==="HEAD")){
    const expected="8831f5f2ce12bca604488d9231f6cb68fe942f188c8efe8e0f20d8dcb1d80f32";
    if(!apkCache){
     const upstream=await fetch("https://github.com/admytruk79-netizen/Ascend-focus/releases/download/focus-preview-35/ASCEND-Focus.apk",{signal:AbortSignal.timeout(60000)});
     if(!upstream.ok)throw new HttpError(503,"APK download is temporarily unavailable.");
     const bytes=Buffer.from(await upstream.arrayBuffer());
     if(bytes.length!==3216098||createHash("sha256").update(bytes).digest("hex")!==expected)throw new HttpError(503,"APK integrity verification failed. No file was sent.");
     apkCache=bytes;
    }
    res.writeHead(200,{"content-type":"application/vnd.android.package-archive","content-disposition":'attachment; filename="ASCEND-Focus-1.1.1.apk"',"content-length":apkCache.length,"cache-control":"no-store","x-content-type-options":"nosniff","x-apk-sha256":expected});
    res.end(req.method==="HEAD"?undefined:apkCache);return;
   }
   if(path==="/health"&&req.method==="GET"){await db.query("SELECT 1");return send(200,{ok:true});}
   if(path==="/api/catalog"&&req.method==="GET"){const r=await db.query("SELECT revision,exercises FROM focus_catalog WHERE singleton=true");return send(200,r.rows[0]??{revision:1,exercises:baseline});}
   if(path.startsWith("/api/admin/auth/")&&req.method==="POST"){
    const body=await bodyOf(req),email=typeof body.email==="string"?body.email.trim().toLowerCase():"";
    await limited(req,email);
    if(email!==ownerEmail.toLowerCase())throw new HttpError(403,"This account does not have admin access.");
    const action=path.split("/").at(-1);
    if(action==="send-code"){await auth("email-otp/send-verification-otp",{email,type:"email-verification"});return send(200,{ok:true});}
    if(action==="verify-code"){if(!/^\d{6}$/.test(body.otp??""))throw new HttpError(400,"Enter the six-digit email code.");await auth("email-otp/verify-email",{email,otp:body.otp});return send(200,{ok:true});}
    if(action==="sign-up"){
     if(typeof body.password!=="string"||body.password.length<12||body.password.length>128)throw new HttpError(400,"Use a password with 12–128 characters.");
     await auth("sign-up/email",{email,password:body.password,name:"ASCEND Focus Admin"});
     return send(200,{ok:true,message:"Account created. Sign in, then verify your email."});
    }
    if(action==="sign-in"){
     if(typeof body.password!=="string"||!body.password||body.password.length>128)throw new HttpError(400,"Enter your password.");
     const {cookie}=await auth("sign-in/email",{email,password:body.password});
     if(!cookie)throw new HttpError(502,"Authentication session unavailable. Try again.");
     const {data}=await auth("get-session",null,cookie);const user=ownerPrincipal(data,ownerEmail);
     const token=randomBytes(32).toString("base64url");
     await db.query("INSERT INTO focus_admin_sessions(token_hash,auth_cookies,email,expires_at) VALUES($1,$2,$3,now()+interval '8 hours')",[hash(token),cookie,user.email]);
     return send(200,{token,email:user.email});
    }
    throw new HttpError(404,"Unknown authentication action.");
   }
   if(path==="/api/admin/me"&&req.method==="GET"){const {user}=await principal(req);return send(200,{email:user.email});}
   if(path==="/api/admin/sign-out"&&req.method==="POST"){const {token}=await principal(req);await db.query("DELETE FROM focus_admin_sessions WHERE token_hash=$1",[hash(token)]);return send(200,{ok:true});}
   if(path==="/api/admin/catalog"&&req.method==="PUT"){
    const {user}=await principal(req),body=await bodyOf(req);
    if(!Number.isInteger(body.revision)||body.revision<1)throw new HttpError(400,"Invalid catalog revision.");
    const exercises=validateCatalog(body.exercises,baseline),client=await db.connect();
    try{
     await client.query("BEGIN");
     const current=(await client.query("SELECT revision,exercises FROM focus_catalog WHERE singleton=true FOR UPDATE")).rows[0];
     if(current.revision!==body.revision)throw new HttpError(409,"The catalog changed elsewhere. Reload before publishing.");
     const revision=current.revision+1;
     await client.query("INSERT INTO focus_catalog_audit(revision,actor_email,previous_exercises,published_exercises) VALUES($1,$2,$3,$4)",[revision,user.email,JSON.stringify(current.exercises),JSON.stringify(exercises)]);
     await client.query("UPDATE focus_catalog SET revision=$1,exercises=$2,updated_at=now() WHERE singleton=true",[revision,JSON.stringify(exercises)]);
     await client.query("COMMIT");return send(200,{revision,exercises});
    }catch(error){await client.query("ROLLBACK");throw error;}finally{client.release();}
   }
   throw new HttpError(404,"Not found.");
  }catch(error){const known=error instanceof HttpError;if(!known)console.error("API request failed:",error.name);send(known?error.status:503,{error:known?error.message:"Service temporarily unavailable. Your offline practices still work.",...(error.code?{code:error.code}:{})});}
 });
 return server;
}

