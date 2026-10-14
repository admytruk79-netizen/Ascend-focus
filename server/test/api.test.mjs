import {test} from "node:test";
import assert from "node:assert/strict";
import {once} from "node:events";
import {readFile} from "node:fs/promises";
import {createApi} from "../app.mjs";
import {validateCatalog,ownerPrincipal} from "../validation.mjs";
const baseline=JSON.parse(await readFile(new URL("../catalog.json",import.meta.url),"utf8"));
async function request(server,path,method="GET",headers={},payload){
 const {Readable}=await import("node:stream");const req=Readable.from(payload?[JSON.stringify(payload)]:[]);req.url=path;req.method=method;req.headers=headers;req.socket={remoteAddress:"127.0.0.1"};
 return new Promise(resolve=>{const res={status:0,headers:{},setHeader(k,v){this.headers[k]=v;},writeHead(status,headers){this.status=status;Object.assign(this.headers,headers);},end(body){resolve({status:this.status,data:body?JSON.parse(body):null});}};server.emit("request",req,res);});
}
test("anonymous requests cannot read admin identity or publish content",async()=>{
 let touched=false;const db={query:async()=>{touched=true;throw Error("Database must not be touched");}};
 const server=createApi({db,baseline,authUrl:"https://auth.example",ownerEmail:"owner@example.com",origins:["https://app.example"]});
 for(const [path,method]of [["/api/admin/me","GET"],["/api/admin/catalog","PUT"]]){const r=await request(server,path,method);assert.equal(r.status,401);}assert.equal(touched,false);
});
test("untrusted origins cannot reach catalog",async()=>{
 const server=createApi({db:{},baseline,authUrl:"https://auth.example",ownerEmail:"owner@example.com",origins:["https://app.example"]});
 const r=await request(server,"/api/catalog","GET",{origin:"https://evil.example"});assert.equal(r.status,403);
});
test("expired sessions cannot publish",async()=>{
 const server=createApi({db:{query:async()=>({rows:[]})},baseline,authUrl:"https://auth.example",ownerEmail:"owner@example.com",origins:["https://app.example"]});
 const r=await request(server,"/api/admin/catalog","PUT",{authorization:"Bearer "+"a".repeat(43)});assert.equal(r.status,401);
});
test("conflicting publications roll back instead of overwriting",async()=>{
 const commands=[];const client={query:async sql=>{commands.push(sql);return {rows:sql.startsWith("SELECT")?[{revision:2,exercises:baseline}]:[]};},release(){}};
 const db={query:async()=>({rows:[{auth_cookies:"session=known",email:"owner@example.com"}]}),connect:async()=>client};
 const fetcher=async()=>new Response(JSON.stringify({user:{id:"u",email:"owner@example.com",emailVerified:true}}));
 const server=createApi({db,baseline,authUrl:"https://auth.example",ownerEmail:"owner@example.com",origins:["https://app.example"],fetcher});
 const r=await request(server,"/api/admin/catalog","PUT",{authorization:"Bearer "+"a".repeat(43)},{revision:1,exercises:baseline});assert.equal(r.status,409);assert.ok(commands.includes("ROLLBACK"));assert.ok(!commands.some(s=>s.startsWith("UPDATE")));
});
test("verified owner identity is required independent of frontend",()=>{
 assert.throws(()=>ownerPrincipal({user:{id:"u",email:"other@example.com",emailVerified:true}},"owner@example.com"),{status:403});
 assert.throws(()=>ownerPrincipal({user:{id:"u",email:"owner@example.com",emailVerified:false}},"owner@example.com"),{code:"verification_required"});
 assert.equal(ownerPrincipal({user:{id:"u",email:"owner@example.com",emailVerified:true}},"owner@example.com").id,"u");
});
test("publishing rejects missing steps, invalid durations and duplicate identifiers",()=>{
 for(const mutate of [es=>es[0].minutes=0,es=>es[0].guided=["one"],es=>es[1].id=es[0].id]){const es=structuredClone(baseline);mutate(es);assert.throws(()=>validateCatalog(es,baseline),{status:400});}
});
test("catalog updates cannot overwrite source-controlled provenance or add unexpected fields",()=>{
 const es=structuredClone(baseline);es[0].title="Updated title";es[0].sourceKind="invented";es[0].admin=true;const out=validateCatalog(es,baseline);assert.equal(out[0].title,"Updated title");assert.equal(out[0].sourceKind,baseline[0].sourceKind);assert.equal(out[0].admin,undefined);
});

