/** Read-only remote verification of the separately deployed Railway Function preview.
 * Does NOT imply live wallet, DB, or blockchain readiness. Opt-in: npm run smoke:preview
 */
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const base = process.env.PREVIEW_URL || 'https://qgen.up.railway.app';
const timeoutMs = 12000;
async function get(path) {
  const r = await fetch(new URL(path,base),{signal:AbortSignal.timeout(timeoutMs)});
  return r;
}
const health=await (await get('/api/health')).json();
assert.equal(health.ok,true);
assert.equal(health.mintReady,false);
assert.equal(health.wallet,false);
assert.equal(health.chainSource,'simulated');
const home = await get('/');
assert.equal(home.status,200);
const html = await home.text();
for (const x of ['COLLAPSE','WALLET INTEGRATION PENDING','DEMO BUILD','reactor']) assert.ok(html.includes(x),`missing ${x}`);
const hashes = new Set();
let largest=0;
for (let i=1;i<=256;i++) {
  const [svgResponse, jsonResponse] = await Promise.all([get(`/art/${i}.svg`),get(`/api/art/${i}`)]);
  assert.equal(svgResponse.status,200); assert.equal(jsonResponse.status,200);
  const [svg, meta] = await Promise.all([svgResponse.text(), jsonResponse.json()]);
  assert.ok(svg.startsWith('<svg ') && svg.endsWith('</svg>'));
  const bytes = Buffer.byteLength(svg,'utf8');
  assert.ok(bytes<=960, `edition ${i} exceeded budget`);
  assert.equal(bytes,meta.bytes);
  assert.equal(createHash('sha256').update(svg).digest('hex'),meta.sha256);
  assert.ok(!hashes.has(meta.sha256),`duplicate ${i}`);
  hashes.add(meta.sha256); largest=Math.max(largest,bytes);
}
assert.equal((await get('/art/257.svg')).status,404);
console.log(JSON.stringify({pass:true,readOnly:true,artworksVerified:hashes.size,maxBytes:largest,base},null,2));
