import {exercises as bundled,type Exercise} from "./exercises";
import {API_BASE_URL} from "./adminConfig";
export type Catalog={revision:number;exercises:Exercise[]};
export class ApiError extends Error{constructor(message:string,public code?:string,public status?:number){super(message)}}
const cacheKey="ascend-focus-catalog-v1";
export function validCatalog(data:unknown):data is Catalog{
 if(!data||typeof data!=="object")return false;const value=data as Catalog;
 if(!Number.isInteger(value.revision)||value.revision<1||!Array.isArray(value.exercises)||value.exercises.length!==bundled.length)return false;
 const ids=new Set(bundled.map(e=>e.id)),seen=new Set<string>();
 return value.exercises.every(e=>{if(!e||!ids.has(e.id)||seen.has(e.id))return false;seen.add(e.id);return typeof e.title==="string"&&typeof e.history==="string"&&typeof e.notice==="string"&&typeof e.lesson==="string"&&typeof e.pdfPages==="string"&&["Attention","Will","Imagination","Mental Rapport"].includes(e.discipline)&&Number.isInteger(e.minutes)&&e.minutes>0&&e.minutes<=120&&Array.isArray(e.guided)&&e.guided.length>=2&&e.guided.every(s=>typeof s==="string");});
}
export function cachedCatalog():Catalog{try{const data:unknown=JSON.parse(localStorage.getItem(cacheKey)??"null");if(validCatalog(data))return data;}catch{}return {revision:1,exercises:bundled};}
export function cacheCatalog(data:Catalog){try{localStorage.setItem(cacheKey,JSON.stringify(data));}catch{/* Practice still works for this session. */}}
export async function apiCall<T>(path:string,options:{method?:string;body?:unknown;token?:string;signal?:AbortSignal}={}):Promise<T>{
 if(!API_BASE_URL)throw new ApiError("Administration is not connected yet.");
 const response=await fetch(API_BASE_URL+path,{method:options.method??"GET",headers:{"content-type":"application/json",...(options.token?{Authorization:"Bearer "+options.token}:{})},body:options.body?JSON.stringify(options.body):undefined,signal:options.signal??AbortSignal.timeout(60000)});
 const data=await response.json();if(!response.ok)throw new ApiError(data.error??"Request failed.",data.code,response.status);return data as T;
}
