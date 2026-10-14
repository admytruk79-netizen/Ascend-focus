import pg from "pg";
import {readFile} from "node:fs/promises";
import {createApi} from "./app.mjs";
const {DATABASE_URL,NEON_AUTH_BASE_URL,ADMIN_EMAIL,ALLOWED_ORIGINS}=process.env;
if(!DATABASE_URL||!NEON_AUTH_BASE_URL||!ADMIN_EMAIL||!ALLOWED_ORIGINS)throw new Error("Required server configuration is missing");
const db=new pg.Pool({connectionString:DATABASE_URL,max:5,connectionTimeoutMillis:10000,idleTimeoutMillis:30000});
const baseline=JSON.parse(await readFile(new URL("./catalog.json",import.meta.url),"utf8"));
await db.query(await readFile(new URL("./migrations/001-admin.sql",import.meta.url),"utf8"));
await db.query("INSERT INTO focus_catalog(singleton,revision,exercises) VALUES(true,1,$1) ON CONFLICT(singleton) DO NOTHING",[JSON.stringify(baseline)]);
const server=createApi({db,baseline,authUrl:NEON_AUTH_BASE_URL,ownerEmail:ADMIN_EMAIL,origins:ALLOWED_ORIGINS.split(",").map(s=>s.trim())});
server.listen(Number(process.env.PORT)||10000,"0.0.0.0");
process.on("SIGTERM",()=>server.close(()=>db.end().then(()=>process.exit(0))));

