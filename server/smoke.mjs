import assert from "node:assert/strict";
const base="https://ascend-focus-api.onrender.com";
async function call(path,options={}){return fetch(base+path,{...options,signal:AbortSignal.timeout(60000)});}
let health;for(let i=0;i<5;i++){try{health=await call("/health");if(health.ok)break;}catch{}await new Promise(r=>setTimeout(r,10000));}
assert.ok(health?.ok,"API health check failed");
const catalog=await (await call("/api/catalog")).json();assert.equal(catalog.exercises.length,29);assert.ok(catalog.revision>=1);
assert.equal((await call("/api/admin/me")).status,401);
assert.equal((await call("/api/admin/catalog",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({revision:1,exercises:[]})})).status,401);
assert.equal((await call("/api/admin/auth/sign-in",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:"not-admin@example.invalid",password:"not-a-real-password"})})).status,403);
const auth="https://ep-rapid-cell-baeces0e.neonauth.c-8.eu-central-1.aws.neon.tech/ascend_focus/auth";
const response=await fetch(auth+"/open-api/generate-schema",{signal:AbortSignal.timeout(30000)});assert.ok(response.ok,"Managed Auth schema unavailable");
const schema=await response.json();
for(const path of ["/sign-in/email","/sign-up/email","/get-session","/email-otp/send-verification-otp","/email-otp/verify-email"]){assert.ok(schema.paths[path],"Required auth route missing: "+path);}
console.log("Live API health, 29-exercise catalog, anonymous write denial, owner restriction and Managed Auth route checks passed.");
