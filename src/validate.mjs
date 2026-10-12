import { createSource } from './source.mjs';
import { artwork,CONTENT_BUDGET } from './engine.mjs';
const source=createSource({CHAIN_MODE:'demo',COLLECTION_ANCHOR_HEIGHT:'200000'});const seen=new Set();let size=0,max=0;
for(let i=1;i<=256;i++){const x=artwork(await source.getEditionBlock(i),i,source.genesis);if(x.bytes>CONTENT_BUDGET)throw Error('Too large #'+i);if(seen.has(x.sha256))throw Error('Duplicate artwork #'+i);seen.add(x.sha256);size+=x.bytes;max=Math.max(max,x.bytes);}
console.log(JSON.stringify({pass:true,editions:seen.size,maxBytes:max,averageBytes:(size/256).toFixed(1),onchainLimit:CONTENT_BUDGET,mode:'demo'},null,2));
