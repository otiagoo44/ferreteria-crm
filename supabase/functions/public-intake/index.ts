import {createClient} from 'npm:@supabase/supabase-js@2.78.0';
import {boundedBody,validateIntake} from '../_shared/intake.ts';
// No client-supplied organization, routing, role or actor is accepted.
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get('origin');
 const allow=(Deno.env.get('INTAKE_ALLOWED_ORIGINS')||'').split(',').map(x=>x.trim()).filter(Boolean);
 const cors: Record<string,string>={'Vary':'Origin','Cache-Control':'no-store'};
 if(origin&&allow.includes(origin)){cors['Access-Control-Allow-Origin']=origin;cors['Access-Control-Allow-Methods']='POST, OPTIONS';cors['Access-Control-Allow-Headers']='content-type, apikey, x-client-info';}
 const reply=(status:number,body:unknown,headers:Record<string,string>={})=>new Response(JSON.stringify(body),{status,headers:{...cors,...headers,'Content-Type':'application/json'}});
 if(origin&&!allow.includes(origin))return reply(403,{error:'origin_not_allowed'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST')return reply(405,{error:'method_not_allowed'},{Allow:'POST, OPTIONS'});
 if(!req.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return reply(422,{error:'invalid_content_type'});
 const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),org=Deno.env.get('OCCIDENTAL_ORGANIZATION_ID'),salt=Deno.env.get('INTAKE_RATE_SALT');
 if(!url||!key||!org||!salt)return reply(503,{error:'unavailable'});
 let payload:unknown;try{payload=await boundedBody(req);}catch{return reply(422,{error:'invalid_or_oversized_body'});}
 if(!validateIntake(payload))return reply(422,{error:'invalid_payload'});
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 try{
  const hashed=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${salt}:${payload.phone}`)))).map(x=>x.toString(16).padStart(2,'0')).join('');
  // Durable global + per-phone budget. Caller IP headers are not trusted.
  for(const [bucket,limit] of [['endpoint',120],[`phone:${hashed}`,10]] as const){
   const {data,error}=await db.rpc('consume_intake_rate',{p_org:org,p_bucket:bucket,p_limit:limit});
   if(error)return reply(503,{error:'unavailable'});
   if(data!==true)return reply(429,{error:'rate_limited'},{'Retry-After':'3600'});
  }
  const {data,error}=await db.rpc('receive_intake',{p_org:org,p_payload:payload});
  if(error){if(error.code==='P0002')return reply(409,{error:'submission_conflict'});if(error.code==='22023')return reply(422,{error:'invalid_payload'});return reply(503,{error:'unavailable'});}
  if(!data?.reference||!data?.received_at)return reply(503,{error:'unavailable'});
  return reply(data.replayed?200:201,{status:'received',reference:data.reference,received_at:data.received_at});
 }catch{return reply(503,{error:'unavailable'});}
});
