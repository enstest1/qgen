import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { randomInt } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { artwork } from './engine.mjs';
import { Registry } from './registry.mjs';
import { feeQuote } from './fees.mjs';
import { createSource } from './source.mjs';

const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const env=process.env;
const source=createSource(env);
const dbPath=env.DB_PATH?path.resolve(env.DB_PATH):path.join(root,'data/registry.sqlite');
fs.mkdirSync(path.dirname(dbPath),{recursive:true});
const registry=new Registry(dbPath);
const port=Number(env.PORT||3000);
const host=env.HOST||'0.0.0.0';
const devFeeUsd=Number(env.DEV_FEE_USD||3);
const publicOrigin=env.PUBLIC_ORIGIN||'https://qgen.lol';
const mintReady=false; // HARD STOP: Qlyphs public inscribe command has no atomic developer fee output.
const blockCache=new Map();
async function art(i){
 if(!Number.isInteger(i)||i<1||i>256)throw new ClientError(400,'Invalid edition');
 const block=await source.getEditionBlock(i);
 const item=artwork(block,i,source.genesis);
 if(source.mode==='live'&&!block.finalized)throw Error('Unfinalized chain source');
 blockCache.set(i,item);
 return item;
}
class ClientError extends Error {constructor(status,message){super(message);this.status=status;}}
const MIME={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.ico':'image/x-icon','.png':'image/png'};
function headers(extra={}) {return {'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Cache-Control':'no-store','Cross-Origin-Resource-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",...extra};}
function send(res,status,data,extra={}){const body=JSON.stringify(data);res.writeHead(status,headers({'Content-Type':'application/json; charset=utf-8',...extra}));res.end(body);}
const rate=new Map();
function limited(req){const ip=req.socket.remoteAddress||'?';const now=Date.now();const x=rate.get(ip)||{at:now,n:0};if(now-x.at>60000){x.at=now;x.n=0;}x.n++;rate.set(ip,x);return x.n>60;}
async function body(req){
 if(req.headers['content-type']?.split(';')[0]!=='application/json')throw new ClientError(415,'JSON required');
 const chunks=[];let size=0;
 for await(const chunk of req){size+=chunk.length;if(size>8192)throw new ClientError(413,'Body too large');chunks.push(chunk);}
 try {return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new ClientError(400,'Invalid JSON');}
}
function protectWrite(req){if(limited(req))throw new ClientError(429,'Rate limited');const origin=req.headers.origin;const host=req.headers.host;if(origin&&new URL(origin).host!==host)throw new ClientError(403,'Origin mismatch');}
export function makeServer(){const httpServer=http.createServer(async(req,res)=>{
 try{
  if(!['GET','POST','HEAD'].includes(req.method))throw new ClientError(405,'Method not allowed');
  const url=new URL(req.url,'http://localhost');const p=url.pathname;
  if(req.method==='GET'&&p==='/api/health')return send(res,200,{ok:true,mode:source.mode,mintReady:false,walletSigning:false});
  if(req.method==='GET'&&p==='/api/config'){
   const s=await source.getStatus();return send(res,200,{name:'QGEN',version:'QG1',publicOrigin,supply:256,mode:source.mode,chain:s,devFeeUsd,mintReady,activationBlock:218350,render:'onchain SVG only',wallet:'Qlyphs (integration pending)',knownBlocker:'Qlyphs inscribe command cannot atomically include the $3 creator fee. Paid minting is disabled.'});
  }
  if(req.method==='GET'&&p==='/api/gallery'){
   const page=Math.max(1,Math.min(16,Number(url.searchParams.get('page')||1)||1));
   const rows=registry.list();return send(res,200,{page,pages:16,limit:16,stats:registry.stats(),items:rows.slice((page-1)*16,page*16)});
  }
  if(req.method==='GET'&&p==='/api/activity')return send(res,200,{items:registry.db.prepare('SELECT edition,kind,at FROM activity ORDER BY id DESC LIMIT 12').all(),demo:source.mode==='demo'});
  const match=p.match(/^\/api\/edition\/(\d+)$/);
  if(req.method==='GET'&&match){const i=Number(match[1]),a=await art(i),row=registry.get(i);return send(res,200,{item:{...a,svg:undefined,contentHex:undefined},status:row.status==='reserved'&&row.expires<Date.now()?'available':row.status,owner:row.owner,quarkNumber:row.quark_number,txHash:row.tx_hash,mode:source.mode});}
  const svgMatch=p.match(/^\/art\/(\d+)\.svg$/);
  if(req.method==='GET'&&svgMatch){let a=await art(Number(svgMatch[1]));res.writeHead(200,headers({'Content-Type':'image/svg+xml; charset=utf-8','Content-Security-Policy':"default-src 'none'; style-src 'none'; script-src 'none'; sandbox",'Cache-Control':'public, max-age=120'}));return res.end(a.svg);}
  if(req.method==='GET'&&p==='/api/fees'){
   const status=await source.getStatus();const qtcUsd=Number(url.searchParams.get('illustrativeQtcUsd')||0);
   return send(res,200,{...feeQuote({height:status.head,qtcUsd,devFeeUsd}),currentHeight:status.head,mode:source.mode});
  }
  if(req.method==='GET'&&p==='/api/mint-status')return send(res,200,{enabled:false,reason:'Public Qlyphs wallet API does not support an atomic custom developer payout with inscribe. Origin allowlisting and onchain receipt verification also require approval.',readOnly:true});
  if(req.method==='POST'){
   protectWrite(req);
   if(p==='/api/mint/prepare')return send(res,503,{ok:false,code:'MINT_DISABLED',message:'No funds accepted. Atomic developer split unavailable; mainnet launch blocked.'});
   if(source.mode!=='demo')throw new ClientError(403,'Demo routes not available on mainnet');
   if(p==='/api/demo/mystery'){
    const b=await body(req);
    if(b && (typeof b!=='object'||Array.isArray(b)||Object.keys(b).length))throw new ClientError(400,'No client seed or edition accepted');
    const owner='0x'+'ab'.repeat(32);
    const available=registry.list().filter(r=>r.status==='available').map(r=>r.edition);
    // Cryptographic server-side assignment; caller cannot select the number or DNA.
    while(available.length){
     const pick=randomInt(available.length);
     const edition=available.splice(pick,1)[0];
     const a=await art(edition);
     const booking=registry.reserve(edition,owner,a.sha256,a.blockHeight);
     if(booking)return send(res,200,{ok:true,mode:'DEMO ONLY — NO QTC CHARGED',assignment:{edition,expires:booking.expires,token:booking.token,digest:a.sha256,bytes:a.bytes,sourceHeight:a.blockHeight}});
    }
    return send(res,409,{ok:false,message:'No unreserved demo editions remain'});
   }
   if(p==='/api/demo/reserve'){
    const b=await body(req),i=b.edition;let a=await art(i);
    const owner='0x'+'ab'.repeat(32);
    const booking=registry.reserve(i,owner,a.sha256,a.blockHeight);
    if(!booking)return send(res,409,{ok:false,message:'Edition reserved or already finalized'});
    return send(res,200,{ok:true,mode:'DEMO — NO ONCHAIN TRANSACTION',booking:{edition:i,token:booking.token,expires:booking.expires},art:{bytes:a.bytes,sha256:a.sha256,sourceHeight:a.blockHeight},fee:'SIMULATED — NO FUNDS COLLECTED'});
   }
   if(p==='/api/demo/confirm'){
    const b=await body(req),i=b.edition;let a=await art(i);
    const receipt={hash:'0x'+a.sha256,quarkNumber:100000+i,final:true,nativeSuccess:true,creator:'0x'+'ab'.repeat(32),sha256:a.sha256};
    const ok=registry.finalize(i,b.token,receipt);
    if(!ok)return send(res,409,{ok:false,message:'Reservation expired, invalid or already finalized'});
    return send(res,200,{ok:true,edition:i,mode:'DEMO ONLY — NOT A REAL QUARK',note:'No wallet was charged and no inscription exists on Quantus.'});
   }
  }
  if(req.method!=='GET'&&req.method!=='HEAD')throw new ClientError(405,'Method not allowed');
  let rel=p==='/'?'index.html':p.slice(1);
  if(!/^[\w.\-/]+$/.test(rel)||rel.includes('..'))throw new ClientError(404,'Not found');
  let file=path.resolve(root,'public',rel);
  if(!file.startsWith(path.join(root,'public')+path.sep))throw new ClientError(404,'Not found');
  let stat;try{stat=fs.statSync(file);}catch{throw new ClientError(404,'Not found');}
  if(!stat.isFile())throw new ClientError(404,'Not found');
  res.writeHead(200,headers({'Content-Type':MIME[path.extname(file)]||'application/octet-stream','Cache-Control': 'public, max-age=120'}));
  if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
 }catch(e){send(res,e.status||503,{ok:false,error:e.status?e.message:'Unavailable: trusted source or internal system failed', ...(source.mode==='demo'&&!e.status?{debug:e.message}:{})});}
 });httpServer.on('close',()=>registry.db.close());return httpServer;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 makeServer().listen(port,host,()=>console.log(`QGEN ${source.mode} http://${host}:${port} — live mint disabled`));
}
