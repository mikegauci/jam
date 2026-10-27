import sharp from 'sharp';
import fs from 'node:fs/promises';
const dir='public/assets/';
const images={'team':'lets-jam-1.jpeg','wedding-wide':'1-1.jpeg','wedding-2':'2-2.jpeg','wedding-3':'3-3.jpeg','wedding-4':'4-4.jpeg','wedding-2025-wide':'1.jpg','wedding-2025-2':'2.jpg','wedding-2025-3':'3.jpg','wedding-2025-4':'4.jpg','rings':'RINGS-02.jpg','vimeo-poster':'vimeo-poster.jpg'};
for(let i=1;i<=8;i++)images['package-'+i]=i===1?'Jam-Wedding-Package-2026.jpg':i<5?`${i}-1.jpg`:`${i}.jpg`;
const manifest={};
for(const [name,source]of Object.entries(images)){
 const meta=await sharp(dir+source).metadata();
 const options=name.startsWith('package')?{lossless:true}:{quality:94};
 manifest[name]={width:meta.width,height:meta.height};
 await sharp(dir+source).webp(options).toFile(dir+name+'-hq.webp');
 for(const w of [480,800,1200,1920].filter(w=>w<=meta.width))await sharp(dir+source).resize({width:w}).webp(options).toFile(`${dir}${name}-hq-${w}.webp`);
 if(name.startsWith('package'))await fs.copyFile(dir+source,dir+name+'.jpg');
 console.log(name,meta.width,meta.height);
}
await fs.writeFile('src/data/media.json',JSON.stringify(manifest,null,2)+'\n');
await sharp(dir+'1-1.jpeg').resize(1200,630,{fit:'cover'}).jpeg({quality:86}).toFile(dir+'social.jpg');
const tiles=await Promise.all(Array.from({length:8},async(_,i)=>({input:await sharp(dir+`package-${i+1}.jpg`).resize(595,421).toBuffer(),left:(i%2)*595,top:Math.floor(i/2)*421})));
await sharp({create:{width:1190,height:1684,channels:3,background:'#fff'}}).composite(tiles).png().toFile('/tmp/jam-packages.png');
