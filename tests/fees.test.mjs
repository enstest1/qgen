import test from 'node:test';
import assert from 'node:assert/strict';
import {feeQuote,TRANSITION_HEIGHT} from '../src/fees.mjs';
test('legacy fee applies through last block before transition',()=>{
 const x=feeQuote({height:TRANSITION_HEIGHT-1,qtcUsd:140,devFeeUsd:3});
 assert.equal(x.phase,'legacy');assert.equal(x.protocolFee.qtc,0.1);assert.equal(x.protocolFee.usd,14);
 assert.equal(x.totalUsd,17.14);assert.equal(x.exact,false);
});
test('at transition, fee is $25, not 25 QTC, rate-derived in wallet',()=>{
 const x=feeQuote({height:TRANSITION_HEIGHT,qtcUsd:140,devFeeUsd:3});
 assert.equal(x.phase,'rate-derived');assert.equal(x.protocolFee.usd,25);assert.equal(x.protocolFee.qtc,null);
 assert.equal(x.totalUsd,28.14);assert.equal(x.exact,false);
});
test('unknown exchange rate never presents fabricated exact QTC value',()=>{
 const x=feeQuote({height:TRANSITION_HEIGHT,qtcUsd:0});
 assert.equal(x.devFeeQtc,null);assert.equal(x.totalUsd,null);assert.equal(x.exact,false);
});
test('reject invalid heights and negative developer fees',()=>{assert.throws(()=>feeQuote({height:-1}));assert.throws(()=>feeQuote({height:0,devFeeUsd:-1}));});
