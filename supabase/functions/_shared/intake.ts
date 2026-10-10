export const MAX_BODY_BYTES = 32768;
export type IntakePayload = {schema_version:1;submission_id:string;name:string;phone:string;message:string;items:{product_ref?:string;description:string;quantity:number;unit:string}[];contact_consent:true;consent_version:string;fulfilment_preference?:string;attribution?:{source?:string;campaign?:string}};
const isObject=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const exactKeys=(v:Record<string,unknown>,keys:string[])=>Object.keys(v).every(k=>keys.includes(k));
const bounded=(v:unknown,min:number,max:number)=>typeof v==='string'&&v.length>=min&&v.length<=max&&v===v.trim();
export function validateIntake(v:unknown): v is IntakePayload {
 if(!isObject(v)||!exactKeys(v,['schema_version','submission_id','name','phone','message','items','contact_consent','consent_version','fulfilment_preference','attribution']))return false;
 if(v.schema_version!==1||v.contact_consent!==true||typeof v.submission_id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.submission_id)||!bounded(v.name,2,100)||typeof v.phone!=='string'||!/^\+[1-9][0-9]{7,14}$/.test(v.phone))return false;
 if(typeof v.message!=='string'||v.message.length>2000||!Array.isArray(v.items)||v.items.length>50||(!bounded(v.message,8,2000)&&v.items.length===0)||!bounded(v.consent_version,1,50))return false;
 const units=['unidad','bolsa','kg','m','m2','m3','l','por_confirmar'];
 if(!v.items.every(item=>isObject(item)&&exactKeys(item,['product_ref','description','quantity','unit'])&&bounded(item.description,2,300)&&typeof item.quantity==='number'&&Number.isFinite(item.quantity)&&item.quantity>0&&item.quantity<=1000000&&typeof item.unit==='string'&&units.includes(item.unit)&&(!['unidad','bolsa'].includes(item.unit)||Number.isInteger(item.quantity))&&(item.product_ref===undefined||bounded(item.product_ref,1,100))))return false;
 if(v.fulfilment_preference!==undefined&&!['pickup','delivery','unsure'].includes(String(v.fulfilment_preference)))return false;
 if(v.attribution!==undefined&&(!isObject(v.attribution)||!exactKeys(v.attribution,['source','campaign'])||!Object.values(v.attribution).every(x=>typeof x==='string'&&x.length<=200)))return false;
 return true;
}
export function canonicalJSON(v:unknown):string {
 if(Array.isArray(v))return `[${v.map(canonicalJSON).join(',')}]`;
 if(isObject(v))return `{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${canonicalJSON(v[k])}`).join(',')}}`;
 return JSON.stringify(v);
}
export async function boundedBody(request:Request): Promise<unknown> {
 if(Number(request.headers.get('content-length')||0)>MAX_BODY_BYTES)throw new Error('size');
 const reader=request.body?.getReader();if(!reader)throw new Error('json');let size=0;const chunks:Uint8Array[]=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_BODY_BYTES){await reader.cancel();throw new Error('size');}chunks.push(value);}
 const all=new Uint8Array(size);let offset=0;for(const c of chunks){all.set(c,offset);offset+=c.length;}
 return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(all));
}
