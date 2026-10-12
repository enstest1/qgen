import test from 'node:test';
import assert from 'node:assert/strict';
import { artwork,derive,render,CONTENT_BUDGET,svgBytes } from '../src/engine.mjs';
import {createSource} from '../src/source.mjs';
const source=createSource({CHAIN_MODE:'demo',COLLECTION_ANCHOR_HEIGHT:'200000'});
test('every one of the 256 pieces is unique, deterministic and within conservative onchain content budget',async()=>{
 const hashes=new Set();let maximum=0;
 for(let i=1;i<=256;i++){
  const block=await source.getEditionBlock(i), a=artwork(block,i,source.genesis), b=artwork(block,i,source.genesis);
  assert.deepEqual(a,b);assert.equal(svgBytes(a.svg),a.bytes);assert.ok(a.bytes<=CONTENT_BUDGET);
  assert.match(a.svg,/^<svg /);assert.match(a.svg,/<\/svg>$/);assert.match(a.contentHex,/^0x[0-9a-f]+$/);
  assert.equal(Buffer.from(a.contentHex.slice(2),'hex').toString('utf8'),a.svg);
  assert.equal(a.blockHeight,source.anchor+i-1);
  assert.ok(!hashes.has(a.sha256),'collision at edition '+i);hashes.add(a.sha256);maximum=Math.max(maximum,a.bytes);
 }
 assert.equal(hashes.size,256);assert.ok(maximum<960);
});
test('same edition different block or genesis produces different DNA',async()=>{
 const b=await source.getEditionBlock(1);
 assert.notEqual(artwork(b,1,'A').sha256,artwork(b,1,'B').sha256);
 assert.notEqual(artwork(b,1,source.genesis).sha256,artwork({...b,hash:'f'.repeat(64)},1,source.genesis).sha256);
 assert.notEqual(artwork(b,1,source.genesis).sha256,artwork(b,2,source.genesis).sha256);
});
test('rejects invalid block, out-of-range supply and unsafe values',()=>{
 const b={height:2,hash:'a'.repeat(64)};
 for(const n of [0,-1,257,1.5,'1',NaN])assert.throws(()=>derive(b,n));
 for(const bad of [{height:-1,hash:'a'.repeat(64)},{height:2,hash:'arbitrary'},null])assert.throws(()=>derive(bad,1));
});
test('DNA metrics match block math and are bounded',()=>{
 const b={height:21,hash:'0'.repeat(64)},d=derive(b,1);
 assert.equal(d.metrics.ones,0);assert.equal(d.metrics.leadingZeros,64);assert.equal(d.rarity,99);
 assert.equal(d.values.palette>=0&&d.values.palette<6,true);
});
