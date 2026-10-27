import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const values=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^(['"])(.*)\1$/,'$2')]}));
const keys=['MAILJET_API_KEY','MAILJET_SECRET_KEY','CONTACT_FROM','CONTACT_TO','FORM_SECRET'];
if(keys.some(k=>!values[k]))throw Error('Fill all five required values in .env first. No credentials were uploaded.');
for(const target of ['production','preview'])for(const key of keys){
 try{execFileSync('npx',['--yes','vercel','env','add',key,target,'--force','--scope','mikegaucis-projects'],{input:values[key]+'\n',stdio:['pipe','pipe','pipe']});console.log(`Stored ${key} for ${target}.`)}catch{throw Error(`Could not store ${key} for ${target}. Check Vercel CLI authentication and the linked project.`)}
}
console.log('Environment updated. Redeploy to apply it.');
