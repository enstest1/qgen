const $=(s)=>document.querySelector(s);
const $$=(s)=>Array.from(document.querySelectorAll(s));
let config=null,page=1,filter='all',selected=1,heroEdition=1,booking=null;
const short=(str,n=14)=>str?str.slice(0,n)+'…':'—';
const pad=(n)=>String(n).padStart(4,'0');
async function api(url,opts){const r=await fetch(url,opts);const obj=await r.json();if(!r.ok)throw Error(obj.message||obj.error||'Request failed');return obj;}
const post=(url,body)=>api(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
const clear=(n)=>n.replaceChildren();
function text(el,string){el.textContent=String(string);return el;}
function appendFields(target,items){clear(target);for(const [k,v] of items){const div=document.createElement('div'),a=document.createElement('span'),b=document.createElement('b');text(a,k);text(b,v);div.append(a,b);target.append(div);}}
async function loadEdition(i){return api('/api/edition/'+i);}
async function showHero(i){heroEdition=i;$('#heroImage').src='/art/'+i+'.svg';const {item}=await loadEdition(i);$('#heroHash').textContent=item.dna.slice(0,18)+'…';$('.art-bottom strong:last-of-type')?.textContent;$('.art-bottom div:nth-child(2) strong').textContent='#'+pad(i)+' / 0256';}
async function loadGallery(){
 const g=await api('/api/gallery?page='+page);$('#mintedNum').textContent=String(g.stats.finalized).padStart(3,'0');$('#galleryCount').textContent='// '+g.stats.available+' AVAILABLE';$('#pageText').textContent='PAGE '+String(page).padStart(2,'0')+' / 16';let items=g.items.filter(x=>filter==='all'||x.status===filter);
 const grid=$('#gallery');clear(grid);
 if(!items.length){const x=document.createElement('p');x.textContent='NO MATCHING ARTIFACTS ON THIS PAGE';x.style.padding='35px';grid.append(x);return;}
 for(const it of items){const button=document.createElement('button');button.type='button';button.className='gallery-card';button.setAttribute('aria-label','Inspect QGEN edition '+it.edition);const art=document.createElement('div');art.className='gallery-art';const image=document.createElement('img');image.src='/art/'+it.edition+'.svg';image.loading='lazy';image.alt='Geometric mask for edition '+it.edition;const tag=document.createElement('span');tag.className='gallery-tag'+(it.status==='finalized'?' minted':'');tag.textContent=it.status==='finalized'?'DEMO MINTED':it.status==='reserved'?'RESERVED':'GEN '+String(it.edition).padStart(3,'0');art.append(image,tag);const foot=document.createElement('div');foot.className='gallery-details';const name=document.createElement('b');name.textContent='Q//G #'+pad(it.edition);const info=document.createElement('span');info.textContent=it.status==='finalized'?'SOLD · DEMO':'INSPECT ↗';foot.append(name,info);button.append(art,foot);button.addEventListener('click',()=>openModal(it.edition));grid.append(button);}
}
async function showDna(i){const d=(await loadEdition(i)).item;$('#dnaEdition').textContent=String(i).padStart(3,'0');$('#dnaImage').src='/art/'+i+'.svg';$('#dnaDigest').textContent=d.sha256;appendFields($('#dnaFields'),[['PALETTE',d.traits.palette],['MASK',String(d.traits.shape).padStart(2,'0')],['EYES',String(d.traits.eye).padStart(2,'0')],['CROWN',String(d.traits.crown).padStart(2,'0')],['1-BITS',d.metrics.ones+'/ 256'],['SOURCE', '#'+d.blockHeight],['RARITY SIGNAL',d.rarity+'/ 99'],['SVG SIZE',d.bytes+' BYTES']]);}
async function openModal(i){selected=i;booking=null;try{const a=await loadEdition(i);const d=a.item;$('#modalTitle').textContent='QGEN #'+pad(i);$('#modalImage').src='/art/'+i+'.svg';$('#exportSvg').href='/art/'+i+'.svg';$('#exportSvg').download='qgen-'+pad(i)+'.svg';$('#modalDesc').textContent='Block '+d.blockHeight+' • DNA '+short(d.dna,21)+' • '+d.bytes+' byte self-contained SVG';appendFields($('#modalStats'),[['PALETTE',d.traits.palette],['RARITY SIGNAL',d.rarity+'/ 99'],['BIT DENSITY',d.metrics.ones],['STATUS',a.status.toUpperCase()]]);$('#simulateMint').disabled=a.status==='finalized'||config.mode!=='demo';$('#simulateMint').textContent=a.status==='finalized'?'ALREADY SIMULATED':'SIMULATE RESERVATION →';$('#modalResult').textContent='No money is transferred. Demonstration-only reservation.';$('#modalQuarkFee').textContent=config.chain.head>=218350?'$25 USD EQUIVALENT IN QTC':'0.1 QTC (before height 218,350)';$('#mintModal').classList.add('open');$('#mintModal').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';await showDna(i);}catch(e){alert(e.message);}}
function closeModal(){$('#mintModal').classList.remove('open');$('#mintModal').setAttribute('aria-hidden','true');document.body.style.overflow='';}
function log(s,kind=''){const div=document.createElement('p');const lead=document.createElement('span');lead.textContent='>';const val=document.createElement('b');val.className=kind;val.textContent=' '+s;div.append(lead,val);$('#terminalOutput').append(div);}
async function boot(){try{config=await api('/api/config');$('#chainStatus').textContent='● '+config.chain.network+' // '+config.mode.toUpperCase();$('#systemStatus').textContent=config.mode==='demo'?'SIMULATION // SAFE':'MAINNET READ ONLY';$('#heroMode').textContent=config.mode==='demo'?'DEMO BUILD':'READ ONLY';log('collection registry: QG1 / 256');log('source height: '+config.chain.head+', finalized '+config.chain.finalized,'ok');log('network source: '+config.chain.network,'ok');log('svg renderer: deterministic, content ≤960 bytes','ok');log('developer payout: atomic integration NOT supported','bad');log('paid mainnet mint: DISABLED / NO FUNDS ACCEPTED','bad');await Promise.all([loadGallery(),showHero(1),showDna(1)]);}catch(e){$('#chainStatus').textContent='● SOURCE UNAVAILABLE';$('#systemStatus').textContent='CHAIN SOURCE ERROR';log('error: '+e.message,'bad');}}
$('#cycleArt').addEventListener('click',()=>showHero(heroEdition%256+1));$('#prevPage').addEventListener('click',()=>{page=Math.max(1,page-1);loadGallery();});$('#nextPage').addEventListener('click',()=>{page=Math.min(16,page+1);loadGallery();});$$('.select').forEach(x=>x.addEventListener('click',()=>{$$('.select').forEach(b=>b.classList.remove('active'));x.classList.add('active');filter=x.dataset.filter;loadGallery();}));$('#heroMint').addEventListener('click',()=>openModal(heroEdition));$('#closeBackdrop').addEventListener('click',closeModal);$('#closeModal').addEventListener('click',closeModal);window.addEventListener('keydown',(e)=>{if(e.key==='Escape')closeModal();});$('#connectWallet').addEventListener('click',()=>openModal(heroEdition));
$('#simulateMint').addEventListener('click',async()=>{const b=$('#simulateMint');b.disabled=true;try{if(!booking){let r=await post('/api/demo/reserve',{edition:selected});booking=r.booking;b.textContent='COMPLETE DEMO MINT →';$('#modalResult').textContent='Edition #'+selected+' reserved in demo registry until '+new Date(booking.expires).toLocaleTimeString()+'. Click again to simulate completion. No QTC spent.';}else{await post('/api/demo/confirm',{edition:selected,token:booking.token});booking=null;b.textContent='DEMO MINT COMPLETED';$('#modalResult').textContent='SIMULATED ONLY. The edition now appears as demo minted; no onchain Quark exists.';await loadGallery();await showDna(selected);}}catch(e){b.disabled=false;b.textContent='RETRY DEMO RESERVATION';$('#modalResult').textContent=e.message;}finally{if(booking)b.disabled=false;}});

// The browser does not choose a winning edition. The server reserves the next
// mystery edition with crypto.randomInt. LIVE minting remains disabled.
let reactorBusy=false;
async function initiateCollapse(){
 if(reactorBusy || !config)return;
 if(config.mode!=='demo'){
  $('#reactorNarration').textContent='MAINNET MINT LOCKED: wallet integration and verified checkout required.';
  $('#reactorState').textContent='LOCKED';return;
 }
 reactorBusy=true;
 const area=$('#reactor-lab');area.classList.add('collapsing');
 $('#reactorState').textContent='COLLAPSING';
 $('#reactorNarration').textContent='Hashing a server-selected edition. Demo only: no Quark or payment.';
 let result;
 try{
  result=await post('/api/demo/mystery',{});
  // The visual effect is never used as randomness; it just reveals a server reservation.
  await new Promise(resolve=>setTimeout(resolve,matchMedia('(prefers-reduced-motion: reduce)').matches?50:2100));
  const a=result.assignment;
  await openModal(a.edition);
  booking={edition:a.edition,token:a.token,expires:a.expires};
  $('#simulateMint').textContent='COMPLETE DEMO CLAIM →';$('#simulateMint').disabled=false;
  $('#modalWarning').textContent='MYSTERY COLLAPSED // '+pad(a.edition)+' // SIMULATION ONLY. The image can be seen before signing in any real wallet. No QTC is charged.';
  $('#modalResult').textContent='DEMO reservation holds until '+new Date(a.expires).toLocaleTimeString()+'. Click COMPLETE DEMO CLAIM to test settlement; this does not inscribe anything.';
  $('#reactorState').textContent='#'+pad(a.edition);
  $('#reactorNarration').textContent='ASSIGNMENT '+pad(a.edition)+' // VERIFIED SHA-256 '+a.digest.slice(0,12)+'…';
 }catch(e){$('#reactorState').textContent='STANDBY';$('#reactorNarration').textContent='Could not reserve mystery edition: '+e.message;}
 finally{area.classList.remove('collapsing');reactorBusy=false;}
}
$('#reactorButton').addEventListener('click',initiateCollapse);
$('#reactorStart').addEventListener('click',initiateCollapse);

boot();
