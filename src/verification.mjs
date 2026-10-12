/** Proof acceptance adapter. Feed ONLY independently fetched trusted chain/indexer data.
 * Never trust user-submitted client JSON as proof of payment or ownership.
 */
export function verifyMintProof({expectedOwner,expectedSha256,expectedEdition,expectedDevOwner,expectedDevBaseUnits,confirmationDepth=20}, proof) {
 const inscription=proof?.inscription, transaction=proof?.transaction,chain=proof?.chain;
 if(!inscription||!transaction||!chain)return {ok:false,reason:'missing evidence'};
 if(!inscription.number||inscription.number<1)return {ok:false,reason:'no inscription number'};
 if(inscription.creator?.toLowerCase()!==expectedOwner?.toLowerCase())return {ok:false,reason:'wrong creator'};
 if(inscription.sha256?.replace(/^0x/,'').toLowerCase()!==expectedSha256?.replace(/^0x/,'').toLowerCase())return {ok:false,reason:'wrong content'};
 if(!Number.isInteger(inscription.height)||!Number.isInteger(chain.finalized)||!Number.isInteger(chain.head)||chain.finalized<inscription.height||chain.head-inscription.height<confirmationDepth)return {ok:false,reason:'insufficient finality'};
 if(transaction.nativeSuccess!==true||transaction.verdict!=='accepted')return {ok:false,reason:'native or QLYP rejection'};
 if(!/^0x[a-f0-9]{64}$/i.test(transaction.hash??'')||!/^0x[a-f0-9]{64}$/i.test(inscription.txHash??'')||transaction.hash.toLowerCase()!==inscription.txHash.toLowerCase())return {ok:false,reason:'tx mismatch'};
 if(!/^0x[a-f0-9]{64}$/i.test(expectedDevOwner??'')||!(/^[1-9][0-9]*$/.test(String(expectedDevBaseUnits))))return {ok:false,reason:'creator fee terms unavailable'};
 const outputs=transaction.outputs;
 if(!Array.isArray(outputs))return {ok:false,reason:'cannot verify atomic developer output'};
 if(!outputs.every(o=>/^0x[a-f0-9]{64}$/i.test(o.recipient??'')&&/^(0|[1-9][0-9]*)$/.test(String(o.amount))))return {ok:false,reason:'malformed transaction output'};
 const paid=outputs.filter(o=>o.recipient.toLowerCase()===expectedDevOwner.toLowerCase()).reduce((n,o)=>n+BigInt(o.amount),0n);
 if(paid<BigInt(expectedDevBaseUnits))return {ok:false,reason:'developer payment not in inscription transaction'};
 if(!Number.isSafeInteger(expectedEdition)||expectedEdition<1||expectedEdition>256)return {ok:false,reason:'invalid edition'};
 return {ok:true,receipt:{hash:transaction.hash,quarkNumber:inscription.number,creator:inscription.creator,sha256:inscription.sha256.replace(/^0x/,'').toLowerCase(),final:true,nativeSuccess:true}};
}
