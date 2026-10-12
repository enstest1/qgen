import test from 'node:test';import assert from 'node:assert/strict';
import {prepareInscribeCommand,validateWalletSession,getPaymentPlan} from '../src/wallet.mjs';
import {verifyMintProof} from '../src/verification.mjs';
import {artwork} from '../src/engine.mjs';import {createSource} from '../src/source.mjs';
const owner='0x'+'ab'.repeat(32),dev='0x'+'cd'.repeat(32),genesis='0x'+'dd'.repeat(32);
test('real Qlyphs inscribe intent has exact supported command keys only',async()=>{
 const source=createSource({CHAIN_MODE:'demo'}),a=artwork(await source.getEditionBlock(1),1,source.genesis);
 const cmd=prepareInscribeCommand(a.svg);
 assert.deepEqual(Object.keys(cmd),['kind','contentType','content']);assert.equal(cmd.kind,'inscribe');assert.equal(Buffer.from(cmd.content.slice(2),'hex').toString(),a.svg);
});
test('blocks unsafe, oversized and malformed SVG',()=>{
 assert.throws(()=>prepareInscribeCommand('<svg><script>alert(1)</script></svg>'));
 assert.throws(()=>prepareInscribeCommand('<svg '+ 'x'.repeat(1000) +'></svg>'));
 assert.throws(()=>prepareInscribeCommand('oops'));
});
test('validates wallet genesis, network and owner',()=>{
 const state={accounts:[{owner,address:'ignored',genesis}],network:{network:'mainnet'}};
 assert.equal(validateWalletSession(state,genesis).owner,owner);
 assert.throws(()=>validateWalletSession(state,'0x'+'ff'.repeat(32)));
 assert.throws(()=>validateWalletSession({...state,network:{network:'development'}},genesis));
 assert.throws(()=>validateWalletSession({...state,accounts:[]},genesis));
});
test('cannot declare mainnet ready without all three gates',()=>{
 for(const g of [{},{atomicFeeSplitSupported:true},{originAllowed:true,receiptVerificationEnabled:true}])assert.equal(getPaymentPlan(g).ready,false);
 assert.equal(getPaymentPlan({atomicFeeSplitSupported:true,originAllowed:true,receiptVerificationEnabled:true}).ready,true);
});
test('onchain receipt requires finality, QLYP acceptance and same-tx exact fee payout',()=>{
 const base={expectedOwner:owner,expectedSha256:'ab'.repeat(32),expectedEdition:10,expectedDevOwner:dev,expectedDevBaseUnits:3000};
 const proof={inscription:{number:101,height:1000,creator:owner,sha256:'ab'.repeat(32),txHash:'0x'+'11'.repeat(32)},chain:{finalized:1000,head:1020},transaction:{hash:'0x'+'11'.repeat(32),nativeSuccess:true,verdict:'accepted',outputs:[{recipient:dev,amount:'3000'}]}};
 assert.equal(verifyMintProof(base,proof).ok,true);
 assert.equal(verifyMintProof(base,{...proof,chain:{finalized:999,head:1019}}).ok,false);
 assert.equal(verifyMintProof(base,{...proof,transaction:{...proof.transaction,outputs:[]}}).ok,false);
 assert.equal(verifyMintProof(base,{...proof,transaction:{...proof.transaction,verdict:'rejected'}}).ok,false);
 assert.equal(verifyMintProof(base,{...proof,inscription:{...proof.inscription,sha256:'ff'.repeat(32)}}).ok,false);
});
test('proof verifier rejects missing tx hashes and malformed outputs',()=>{
 const base={expectedOwner:owner,expectedSha256:'ab'.repeat(32),expectedEdition:10,expectedDevOwner:dev,expectedDevBaseUnits:'3000'};
 const proof={inscription:{number:101,height:1000,creator:owner,sha256:'ab'.repeat(32)},chain:{finalized:1000,head:1020},transaction:{nativeSuccess:true,verdict:'accepted',outputs:[{recipient:dev,amount:'3000'}]}};
 assert.equal(verifyMintProof(base,proof).ok,false);
 const bad={...proof,inscription:{...proof.inscription,txHash:'0x'+'11'.repeat(32)},transaction:{...proof.transaction,hash:'0x'+'11'.repeat(32),outputs:[{recipient:dev,amount:'not money'}]}};
 assert.equal(verifyMintProof(base,bad).ok,false);
});
