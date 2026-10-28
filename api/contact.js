import { enquiryEmail, formatWeddingDate } from '../src/lib/enquiry-email.js';
import { createHmac, randomBytes, createHash, timingSafeEqual } from 'node:crypto';
const fields={name:'Name & Surname',email:'Email',mobile:'Mobile',date:'Date Getting Married',bride:'Location and Time of Bride',groom:'Location and Time of Groom',ceremony:'Location of Ceremony',reception:'Location of Reception',guests:'Number of Guests Invited'};
const choices=['Photography Package 01: Wedding Day','Photography Package 02: Pre-Wedding & Wedding Day','Pre Wedding photography','Post Wedding photography','Photo Booth','Videography package 01: Short film','Videography package 02: Full Wedding','Drone coverage','All raw footage'];
const recent=new Map();
const sign=(s)=>createHmac('sha256',process.env.FORM_SECRET).update(s).digest('hex');
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Robots-Tag','noindex');
 const reply=(status,message)=>res.status(status).json({message});
 if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return reply(405,'Method not allowed.');}
 if(!process.env.FORM_SECRET)return reply(503,'Our enquiry form is temporarily unavailable. Please email info@jam.mt.');
 if(req.method==='GET'){
  const value=Date.now()+'.'+randomBytes(20).toString('hex');
  return res.status(200).json({token:value+'.'+sign(value)});
 }
 const origin=req.headers.origin;const host=req.headers.host;
 if(!origin||!host||origin!==`https://${host}`&&!(process.env.NODE_ENV!=='production'&&origin===`http://${host}`))return reply(403,'Please submit the form from this website.');
 if(!req.headers['content-type']?.startsWith('application/json'))return reply(415,'Please submit the form from this website.');
 if(Number(req.headers['content-length'])>16000)return reply(413,'Your message is too long.');
 let data;try{data=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{return reply(400,'Your enquiry could not be read. Please try again.');}
 if(!data||typeof data!=='object'||JSON.stringify(data).length>16000)return reply(400,'Invalid enquiry.');
 if(data.website)return reply(400,'Spam protection rejected this enquiry. Please email info@jam.mt if this continues.');
 const token=String(data.token||'');const parts=token.split('.');const value=parts.slice(0,2).join('.');const signature=parts[2]||'';const age=Date.now()-Number(parts[0]);
 if(parts.length!==3||!/^[a-f0-9]{64}$/.test(signature)||!timingSafeEqual(Buffer.from(signature),Buffer.from(sign(value)))||age<0||age>1800000)return reply(400,'Your form session expired. Please submit again.');
 if(!/^\d{1,7}$/.test(String(data.proof))||!createHash('sha256').update(token+':'+data.proof).digest('hex').startsWith('000'))return reply(400,'Spam protection could not be completed. Please try again.');
 const clean={};
 for(const [key,label] of Object.entries(fields)){
  if(typeof data[key]!=='string'||!data[key].trim()||data[key].length>200||/[\r\n\x00-\x1f]/.test(data[key]))return reply(422,`Please enter a valid ${label.toLowerCase()}.`);
  clean[key]=data[key].trim();
 }
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)||clean.email.length>254)return reply(422,'Please enter a valid email address.');
 if(!/^[+\d()\s.-]{5,30}$/.test(clean.mobile))return reply(422,'Please enter a valid mobile number.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(clean.date)||Number.isNaN(Date.parse(clean.date))||new Date(clean.date).toISOString().slice(0,10)!==clean.date)return reply(422,'Please select a valid wedding date.');
 if(data.note!=null&&(typeof data.note!=='string'||data.note.length>2000))return reply(422,'Please keep your note under 2,000 characters.');
 if(!Array.isArray(data.services)||data.services.length>choices.length||data.services.some(s=>!choices.includes(s)))return reply(422,'Please choose services from the list.');
 const {MAILJET_API_KEY,MAILJET_SECRET_KEY,CONTACT_FROM,CONTACT_TO}=process.env;
 if(!MAILJET_API_KEY||!MAILJET_SECRET_KEY||!CONTACT_FROM||!CONTACT_TO)return reply(503,'Our enquiry form is temporarily unavailable. Please email info@jam.mt or call 79824401.');
 const now=Date.now();for(const [key,entry]of recent)if(entry.until<now)recent.delete(key);
 // Best-effort warm-instance limit; signed proof-of-work remains valid across serverless instances.
 const ip=String(req.headers['x-forwarded-for']||req.headers['x-real-ip']||'unknown').split(',')[0];const ipKey=createHash('sha256').update(ip).digest('hex');
 const entry=recent.get(ipKey)||{count:0,until:now+600000};if(entry.count>=5)return reply(429,'Too many enquiries. Please wait ten minutes or email info@jam.mt.');entry.count++;if(recent.size<10000)recent.set(ipKey,entry);
 const content=enquiryEmail(clean,data.services,data.note||'');
 try{
  const response=await fetch('https://api.mailjet.com/v3.1/send',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Basic '+Buffer.from(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`).toString('base64')},body:JSON.stringify({Messages:[{From:{Email:CONTACT_FROM,Name:'Jam Weddings website'},To:[{Email:CONTACT_TO}],ReplyTo:{Email:clean.email,Name:clean.name},Subject:`Wedding enquiry — ${clean.name} — ${formatWeddingDate(clean.date)}`,...content}]}),signal:AbortSignal.timeout(15000)});
  const result=await response.json();if(!response.ok||result.Messages?.[0]?.Status!=='success'){console.error('Mailjet enquiry rejected',response.status);return reply(502,'We couldn’t send your enquiry. Please try again or email info@jam.mt.');}
  return reply(200,'Thank you! Your enquiry has been sent to Jam Weddings. We’ll be in touch.');
 }catch{console.error('Mailjet enquiry request failed');return reply(502,'We couldn’t confirm your enquiry was sent. Please email info@jam.mt or call 79824401.');}
}
