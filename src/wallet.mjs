import { CONTENT_BUDGET, svgBytes } from './engine.mjs';

/** Public Qlyphs command schema, taken from packages/native/src/commands.ts.
 * This is built for review and future official integration ONLY. There is no
 * extra developer-payout field in the public inscribe command (Oct 2026).
 */
export function prepareInscribeCommand(svg) {
 if(typeof svg!=='string'||!svg.startsWith('<svg ')||!svg.endsWith('</svg>'))throw Error('expected complete SVG');
 if(/<script|<foreignObject|\bon\w+\s*=|<image|href\s*=|url\(/i.test(svg))throw Error('unsafe SVG feature');
 if(svgBytes(svg)>CONTENT_BUDGET)throw Error('content exceeds onchain budget');
 return Object.freeze({kind:'inscribe',contentType:'image/svg+xml',content:'0x'+Buffer.from(svg,'utf8').toString('hex')});
}
export function validateWalletSession({accounts,network}, expectedGenesis){
 if(!Array.isArray(accounts)||!accounts.length)throw Error('wallet not connected');
 const account=accounts[0];
 if(!/^0x[a-f0-9]{64}$/i.test(account.owner))throw Error('wallet owner invalid');
 if(!expectedGenesis||account.genesis.toLowerCase()!==expectedGenesis.toLowerCase())throw Error('wallet genesis mismatch');
 if(network?.network!=='mainnet')throw Error('Qlyphs wallet is not connected to Quantus mainnet');
 return {owner:account.owner.toLowerCase(),genesis:expectedGenesis};
}
export function getPaymentPlan({atomicFeeSplitSupported=false,originAllowed=false,receiptVerificationEnabled=false}){
 const missing=[];
 if(!originAllowed)missing.push('Qlyphs wallet allowlist / origin support');
 if(!atomicFeeSplitSupported)missing.push('atomic developer payment in same inscribe transaction');
 if(!receiptVerificationEnabled)missing.push('trusted server-side finality and payment receipt verifier');
 return {ready:missing.length===0,missing};
}
