import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'qgen-test-'));
process.env.DB_PATH=path.join(temp,'test.sqlite');process.env.CHAIN_MODE='demo';
const {makeServer}=await import('../src/server.mjs');
const server=makeServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const get=(p)=>fetch(base+p);const post=(p,body,headers={})=>fetch(base+p,{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify(body)});
test.after(async()=>{await new Promise(r=>server.close(r));fs.rmSync(temp,{recursive:true,force:true});});
test('serves UI, safe headers and read-only configuration',async()=>{
 const r=await get('/');assert.equal(r.status,200);assert.match(await r.text(),/THE BLOCK/);assert.match(r.headers.get('content-security-policy'),/script-src 'self'/);
 const cfg=await (await get('/api/config')).json();assert.equal(cfg.mintReady,false);assert.equal(cfg.supply,256);assert.equal(cfg.mode,'demo');
});
test('renders a real self-contained SVG under budget',async()=>{
 const r=await get('/art/7.svg');assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/image\/svg\+xml/);const svg=await r.text();assert.ok(Buffer.byteLength(svg)<960);assert.match(svg,/<svg /);assert.match(r.headers.get('content-security-policy'),/sandbox/);
});
test('gallery endpoint and deterministic provenance',async()=>{
 const g=await (await get('/api/gallery?page=1')).json();assert.equal(g.items.length,16);assert.equal(g.stats.available,256);
 const a=await (await get('/api/edition/2')).json(),b=await (await get('/api/edition/2')).json();assert.deepEqual(a,b);assert.equal(a.item.bytes>0,true);
});
test('mainnet signing is hard disabled, regardless of caller',async()=>{
 const r=await post('/api/mint/prepare',{edition:1,owner:'test'});assert.equal(r.status,503);assert.equal((await r.json()).code,'MINT_DISABLED');
});
test('rejects cross-site writes and oversized payloads',async()=>{
 let r=await post('/api/demo/reserve',{edition:1},{origin:'https://malicious.example'});assert.equal(r.status,403);
 r=await post('/api/demo/reserve',{edition:1,junk:'x'.repeat(9000)});assert.equal(r.status,413);
});
test('demo reserve -> verify -> finalize, with duplicate prevention',async()=>{
 let r=await post('/api/demo/reserve',{edition:5});assert.equal(r.status,200);const d=await r.json();assert.equal(d.ok,true);assert.match(d.mode,/DEMO/);
 r=await post('/api/demo/reserve',{edition:5});assert.equal(r.status,409);
 r=await post('/api/demo/confirm',{edition:5,token:'a'.repeat(64)});assert.equal(r.status,409);
 r=await post('/api/demo/confirm',{edition:5,token:d.booking.token});assert.equal(r.status,200);assert.match((await r.json()).mode,/NOT A REAL QUARK/);
 const edition=await(await get('/api/edition/5')).json();assert.equal(edition.status,'finalized');
});
test('invalid paths and ids are not served',async()=>{
 assert.equal((await get('/art/257.svg')).status,400);assert.equal((await get('/api/edition/0')).status,400);
 assert.equal((await get('/src/server.mjs')).status,404);
});
test('20 parallel clients cannot reserve the same edition twice',async()=>{
 const result=await Promise.all(Array.from({length:20},()=>post('/api/demo/reserve',{edition:9})));
 assert.equal(result.filter(r=>r.status===200).length,1);
 assert.equal(result.filter(r=>r.status===409).length,19);
});

test('mystery reactor assignment is server-selected and one active reservation only',async()=>{
 const bad=await post('/api/demo/mystery',{edition:17});assert.equal(bad.status,400);
 const first=await post('/api/demo/mystery',{});assert.equal(first.status,200);
 const assignment=(await first.json()).assignment;
 assert.ok(assignment.edition>=1&&assignment.edition<=256);
 assert.match(assignment.digest,/^[a-f0-9]{64}$/);
 const art=await(await get('/api/edition/'+assignment.edition)).json();assert.equal(art.item.sha256,assignment.digest);
 const invalid=await post('/api/demo/confirm',{edition:assignment.edition,token:'0'.repeat(64)});assert.equal(invalid.status,409);
 const done=await post('/api/demo/confirm',{edition:assignment.edition,token:assignment.token});assert.equal(done.status,200);
 const updated=await(await get('/api/edition/'+assignment.edition)).json();assert.equal(updated.status,'finalized');
});
test('reactor UI is present, script loads and content is not minter-initiated',async()=>{
 const html=await(await get('/')).text();assert.match(html,/id="reactorButton"/);assert.match(html,/id="reactorNarration"/);
 const script=await(await get('/app.js')).text();assert.match(script,/api\/demo\/mystery/);
 const css=await(await get('/styles.css')).text();assert.match(css,/prefers-reduced-motion/);assert.match(css,/reactor-band/);
});
