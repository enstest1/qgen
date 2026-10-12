import test from 'node:test';
import assert from 'node:assert/strict';
import {Registry} from '../src/registry.mjs';
const owner='0x'+'ab'.repeat(32),digest='d'.repeat(64);
const receipt=(n=100,dx=digest)=>({hash:'0x'+'a'.repeat(63)+(n%10),quarkNumber:n,creator:owner,sha256:dx,nativeSuccess:true,final:true});
test('reservation is exclusive and expired reservations can be reclaimed',()=>{
 let time=1_000_000;const r=new Registry(':memory:',()=>time);
 const a=r.reserve(1,owner,digest,10);assert.ok(a.token);assert.equal(a.token.length,64);
 assert.equal(r.reserve(1,owner,digest,10),null);assert.equal(r.stats().reserved,1);
 time+=600_001;const b=r.reserve(1,owner,digest,10);assert.ok(b.token);assert.notEqual(b.token,a.token);
 assert.equal(r.finalize(1,a.token,receipt()),false);
 assert.equal(r.finalize(1,b.token,receipt()),true);
 assert.equal(r.stats().finalized,1);assert.equal(r.reserve(1,owner,digest,10),null);r.close();
});
test('false receipt, nonfinal, different creator, wrong digest, expired token all fail',()=>{
 const r=new Registry(':memory:');const a=r.reserve(4,owner,digest,10);
 assert.equal(r.finalize(4,'f'.repeat(64),receipt()),false);
 assert.equal(r.finalize(4,a.token,{...receipt(),final:false}),false);
 assert.equal(r.finalize(4,a.token,{...receipt(),creator:'0x'+'ff'.repeat(32)}),false);
 assert.equal(r.finalize(4,a.token,receipt(100,'e'.repeat(64))),false);
 assert.equal(r.finalize(4,a.token,receipt()),true);
 assert.equal(r.finalize(4,a.token,receipt()),false);r.close();
});
test('same chain tx and quark number cannot finalize twice',()=>{
 const r=new Registry(':memory:');const a=r.reserve(10,owner,digest,1),b=r.reserve(11,owner,digest,2);
 assert.equal(r.finalize(10,a.token,receipt(105)),true);
 assert.equal(r.finalize(11,b.token,receipt(105)),false);assert.equal(r.get(11).status,'reserved');r.close();
});
test('malformed and out-of-range inputs rejected',()=>{
 const r=new Registry(':memory:');for(const n of [-2,0,257,'1'])assert.throws(()=>r.reserve(n,owner,digest,0));assert.throws(()=>r.reserve(2,'bad',digest,0));assert.throws(()=>r.reserve(2,owner,'bad',0));r.close();
});
