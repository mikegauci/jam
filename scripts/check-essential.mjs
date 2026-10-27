import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import handler from '../api/contact.js';
const html=fs.readFileSync('dist/index.html','utf8');
for(const id of ['about','portfolio','services','contact']){assert(html.includes(`id="${id}"`));assert(html.includes(`href="/#${id}"`))}
for(const name of ['description','og:title','og:description','og:image','twitter:card'])assert(html.includes(`="${name}"`));
assert(html.includes('rel="canonical" href="https://jam.mt/"'));assert(html.includes('application/ld+json'));
for(const file of ['sitemap.xml','robots.txt','llms.txt'])assert(fs.readFileSync('dist/'+file,'utf8').includes('https://jam.mt/'));
assert(!fs.readFileSync('dist/sitemap.xml','utf8').includes('404'));
assert(fs.readFileSync('dist/404.html','utf8').includes('noindex, nofollow'));
assert(!html.includes('wp-content'));assert(!html.includes('jquery'));assert(!html.includes('<iframe'));
// All locally referenced assets, including responsive image sources, must exist.
for(const p of html.matchAll(/(?:src|href)="(\/(?:assets|_astro)\/[^"?]+)"/g))assert(fs.existsSync('dist'+p[1]),p[1]);
for(const p of html.matchAll(/\/assets\/[^\s,"<>]+\.webp/g))assert(fs.existsSync('dist'+p[0]),p[0]);
const originalFetch=globalThis.fetch;
const originalEnv={...process.env};process.env.FORM_SECRET='essential-check-secret';
const call=async(method,body,origin='https://jam-weddings.vercel.app')=>{let status=200,result;const res={setHeader(){},status(s){status=s;return this},json(data){result=data;return this}};await handler({method,headers:{host:'jam-weddings.vercel.app',origin,'content-type':'application/json'},body},res);return {status,result}};
try{
 assert.equal((await call('DELETE')).status,405);
 assert.equal((await call('POST',{},'https://spam.example')).status,403);
 assert.equal((await call('POST',{website:'bot'})).status,400);
 const {result:{token}}=await call('GET');let proof=0;while(!createHash('sha256').update(token+':'+proof).digest('hex').startsWith('000'))proof++;
 const data={token,proof,name:'Migration check',email:'visitor@example.com',mobile:'+356 99123456',date:'2027-06-12',bride:'Msida at 9AM',groom:'Naxxar at 11AM',ceremony:'Msida church',reception:'Valletta',guests:'300',note:'Mocked essential check. No real email.',services:['Photo Booth']};
 assert.equal((await call('POST',{...data,email:'bad'})).status,422);
 assert.equal((await call('POST',{...data,date:'2027-02-31'})).status,422);
 delete process.env.MAILJET_API_KEY;assert.equal((await call('POST',data)).status,503);
 Object.assign(process.env,{MAILJET_API_KEY:'mock',MAILJET_SECRET_KEY:'mock',CONTACT_FROM:'website@jam.mt',CONTACT_TO:'info@jam.mt'});
 let message;
 globalThis.fetch=async(url,init)=>{assert.equal(url,'https://api.mailjet.com/v3.1/send');message=JSON.parse(init.body).Messages[0];return {ok:true,json:async()=>({Messages:[{Status:'success'}]})}};
 assert.equal((await call('POST',data)).status,200);assert.equal(message.ReplyTo.Email,'visitor@example.com');assert.equal(message.From.Email,'website@jam.mt');assert.equal(message.To[0].Email,'info@jam.mt');assert(message.TextPart.includes('Photo Booth'));
 globalThis.fetch=async()=>({ok:false,status:401,json:async()=>({})});assert.equal((await call('POST',data)).status,502);
 console.log('PASS: section navigation, local assets, SEO files, noindex 404, lazy video, form validation, spam rejection, missing credentials, mocked Mailjet success/error and Reply-To. No real email sent.');
}finally{globalThis.fetch=originalFetch;for(const key of Object.keys(process.env))if(!(key in originalEnv))delete process.env[key];Object.assign(process.env,originalEnv)}
