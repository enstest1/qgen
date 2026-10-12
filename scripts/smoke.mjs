/** Start the real process and probe safety invariants, then always terminate it. */
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { strict as assert } from 'node:assert';
const tmp=mkdtempSync(join(tmpdir(),'qg-smoke-'));
const port=48000+Math.floor(Math.random()*10000);
const base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['src/server.mjs'],{env:{...process.env,HOST:'127.0.0.1',PORT:String(port),CHAIN_MODE:'demo',DB_PATH:join(tmp,'registry.sqlite'),MAINNET_MINT_ENABLED:'false'},stdio:'ignore'});
try{
 let online=false;
 for(let i=0;i<40;i++){
  if(child.exitCode!==null)throw Error('server exited during startup');
  try { const r=await fetch(base+'/api/health');if(r.ok){online=true;break;}}catch{}
  await delay(125);
 }
 assert(online,'server did not become healthy');
 const get=async(url)=>{const r=await fetch(base+url);assert(r.ok,url+' HTTP '+r.status);return r;};
 let h=await(await get('/api/health')).json();assert.equal(h.mintReady,false);
 let c=await(await get('/api/config')).json();assert.equal(c.supply,256);assert.equal(c.mode,'demo');assert.equal(c.mintReady,false);
 let r=await get('/art/17.svg');assert.match(r.headers.get('content-type'),/image\/svg\+xml/);assert(Buffer.byteLength(await r.text())<=960);
 let result=await fetch(base+'/api/mint/prepare',{method:'POST',headers:{'content-type':'application/json'},body:'{"edition":17}'});assert.equal(result.status,503);
 let x=await(await get('/api/gallery')).json();assert.equal(x.items.length,16);
 let page=await(await get('/')).text();assert.match(page,/reactorButton/);
 console.log('SMOKE PASS: health, demo-only, 256 supply, SVG, mint disabled, gallery, reactor');
}finally{child.kill('SIGTERM');rmSync(tmp,{recursive:true,force:true});}
