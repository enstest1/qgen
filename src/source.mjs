import { digest } from './engine.mjs';
const H=/^(?:0x)?[a-f0-9]{64}$/i;
export function createSource(env=process.env) {
 const mode=env.CHAIN_MODE||'demo';
 const anchor=Number(env.COLLECTION_ANCHOR_HEIGHT||200000);
 if(!Number.isSafeInteger(anchor)||anchor<257) throw Error('bad collection anchor height');
 const genesis=env.EXPECTED_MAINNET_GENESIS || (mode==='demo'?'DEMO-NOT-MAINNET':'');
 if(mode!=='demo'&&mode!=='live')throw Error('CHAIN_MODE must be demo or live');
 if(mode==='live'&&(!H.test(genesis)||!env.QUANTUS_BLOCK_URL_TEMPLATE||!env.QUANTUS_STATUS_URL))throw Error('Live mode requires pinned genesis and trusted block/status URLs');
 async function getStatus(){
  if(mode==='demo')return {mode,head:anchor+40,finalized:anchor+20,genesis,network:'DEMO ONLY',ok:true};
  const r=await fetch(env.QUANTUS_STATUS_URL,{signal:AbortSignal.timeout(6500),headers:{accept:'application/json'}});
  if(!r.ok)throw Error('trusted chain status unavailable');
  const s=await r.json();
  const head=Number(s.head??s.bestHeight??s.height);const finalized=Number(s.finalized??s.finalizedHeight);
  if(!Number.isSafeInteger(head)||!Number.isSafeInteger(finalized)||finalized>head||s.genesis?.toLowerCase()!==genesis.toLowerCase())throw Error('invalid live chain status or genesis mismatch');
  return {mode,head,finalized,genesis,network:'Quantus mainnet',ok:true};
 }
 async function getBlock(height){
  if(!Number.isSafeInteger(height)||height<0)throw Error('invalid block height');
  if(mode==='demo')return {height,hash:digest('DEMO-NOT-REAL-QUANTUS:'+height),timestamp:1760000000+height*15,finalized:true};
  const status=await getStatus();
  if(height>status.finalized)throw Error('source block is not finalized');
  const url=env.QUANTUS_BLOCK_URL_TEMPLATE.replace('{height}',String(height));
  if(!url.startsWith('https://'))throw Error('live endpoint must be HTTPS');
  const r=await fetch(url,{signal:AbortSignal.timeout(6500),headers:{accept:'application/json'}});
  if(!r.ok)throw Error('trusted block unavailable');
  const data=await r.json(), b=data.block??data;
  if(Number(b.height)!==height||!H.test(b.hash??'')||b.finalized===false)throw Error('invalid block proof');
  return {height,hash:b.hash,timestamp:Number(b.timestamp??0),finalized:true};
 }
 return {mode,genesis,anchor,getStatus,getBlock,getEditionBlock:(edition)=>getBlock(anchor+edition-1)};
}
