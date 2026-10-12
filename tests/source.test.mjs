import test from 'node:test';import assert from 'node:assert/strict';import {createSource} from '../src/source.mjs';
test('demo mode is visibly not the mainnet and returns synthetic finalized block fixtures',async()=>{
 const s=createSource({CHAIN_MODE:'demo'}),status=await s.getStatus(),b=await s.getEditionBlock(1);
 assert.equal(s.mode,'demo');assert.match(status.network,/DEMO/);assert.equal(b.finalized,true);assert.equal(b.hash.length,64);
});
test('live mode fails closed unless pinned with real chain endpoints',()=>{
 assert.throws(()=>createSource({CHAIN_MODE:'live'}));
 assert.throws(()=>createSource({CHAIN_MODE:'live',EXPECTED_MAINNET_GENESIS:'f'.repeat(64),QUANTUS_BLOCK_URL_TEMPLATE:'https://api.example/{height}'}));
 assert.throws(()=>createSource({CHAIN_MODE:'invalid'}));
});
test('malformed chain height rejected',()=>assert.throws(()=>createSource({CHAIN_MODE:'demo',COLLECTION_ANCHOR_HEIGHT:'foo'})));
