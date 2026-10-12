# QGEN — Qlyphs wallet developer handoff

**Purpose:** 256 verified Quantus-block-derived Quark PFPs. Each one is a 100% self-contained `image/svg+xml` payload <=960 bytes (not a URI/IPFS image). No server has private keys. The collector signs the exact bytes and knows the network, Qlyphs, and creator charges before signing.

## Current testable implementation

- Website with nebula/proton-reactor animation and mobile/responsive CSS, art gallery, DNA explorer, mock checkout, and an edition-reservation simulator.
- Deterministic engine: `src/engine.mjs`; reservation registry: `src/registry.mjs`; request gates: `src/server.mjs`; supported Qlyphs command schema and future wallet integration validation: `src/wallet.mjs`.
- No mainnet enabled; all `/api/demo/*` examples use **simulated** block hashes, simulated owner, no funds and no onchain inscription. `CHAIN_MODE=live` only reads validated, pinned chain endpoints and still refuses signing.
- Run `npm test && npm run validate && npm start`. Production host binds Railway `PORT`; demo database is local SQLite and MUST NOT be treated as a persistent live collection registry without an attached volume or external DB.

## Existing Qlyphs interfaces

From public `yacinealloul/qlyphs-wallet` repository, `packages/provider/src/index.ts` and `packages/native/src/commands.ts`:

```
provider.request({method:'connect'})
provider.request({method:'requestTransaction',params:{
  owner,genesis,
  command:{kind:'inscribe',contentType:'image/svg+xml',content:'0x<UTF8_SVG_HEX>'}
}})
```

The wallet *already* supports inscribing SVGs; its `inscribe` command **does not** support a separate creator recipient and amount. Qlyphs wallet origins must be approved by its owner; direct NEAR/Rabby wallet integrations cannot sign post-quantum Quantus transactions.

## Questions / required integration

1. Can the QGEN site origin be approved for `keys.qlyphs.com` or the extension? Which connection module and version should be pinned?
2. Can Qlyphs accept an atomic `inscribe + send QTC to creator` call **as a single user-confirmed transaction**? What verified receipt schema shows Quark ID, content hash, origin owner, recipient, amount and finality? If no atomic payment API is planned, we can ship a fee-free public collector-only mint or continue demo; we will not pretend separate transfers are automatic or guaranteed.
3. What stable, authenticated public indexer fields/endpoints can we use for finalized inscription fetch and reorg handling? We must independently compare bytes/hash, creator, and fee payment.
4. Are there any additional SVG content-type restrictions or payload byte-count handling differences across Qlyphs Keys/extension/mobile? What is the verified mainnet genesis and block RPC indexer API URL?

## Test and acceptance matrix

- 256 SVGs unique <=960 bytes, parse successfully, identical after regeneration, no external resources / scripts / event handlers.
- Payment amount: Qlyphs schedule 0.1 QTC **before** 218,350 and US$25 equivalent at/after, always wallet quoted at signing; creator fee configurable e.g. $3 equivalent QTC with explicit max slippage.
- Failed inscription must not collect creator money. Unknown broadcast result must be reconciled before any retry. Wrong genesis/origin/hash/amount/recipient/quark number and duplicate replay must all fail closed.
- 20 concurrent bidders cannot take the same edition; expired reservations may reopen, verified settlement cannot be reverted into availability on frontend.
- Real wallet on intended devices, a tiny funded mainnet transaction, 20-block finality, manual explorer + indexer comparison, release rollback.

## Public relations / UX caveats

- Edition numbers (`QG-001`) are not native sequential **Quark numbers** (which the chain assigns on inclusion).
- It is a mystery selection visual, not a cryptographic encrypted blind reveal; collectors can inspect the SVG they sign.
- A 256-item website registry is NOT protocol-enforced scarcity: arbitrary duplicates are possible on QLYP.
- Branding is independent, not affiliated with Qlyphs or Quantus.

**No developer seed, private key or custodial wallet is required.**
