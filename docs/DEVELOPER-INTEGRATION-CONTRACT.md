# Qlyphs integration contract — exact interface for reviewer

**Owner:** QGEN (third-party app). **Target chain:** Quantus mainnet, QLYP-v1 Quarks.

This specification is **proposed**, not a statement that the upstream API supports it today.

## Existing public wallet call (already supported)

```js
const accounts = await provider.request({method:'connect'});
const command = {
  kind: 'inscribe',
  contentType: 'image/svg+xml',
  content: '0x' + Buffer.from(exactSvgUtf8).toString('hex'),
};
const tx = await provider.request({method:'requestTransaction',params:{
  owner: accounts[0].owner,
  genesis: accounts[0].genesis,
  command
}});
```

Public type: https://github.com/yacinealloul/qlyphs-wallet/blob/main/packages/provider/src/index.ts
Parsed native command: https://github.com/yacinealloul/qlyphs-wallet/blob/main/packages/native/src/commands.ts

## Requested upstream support

We need **one user-approved atomic operation** that:

1. inscribes EXACT `image/svg+xml` content bytes (<=960 B conservative cap);
2. pays Qlyphs' current attested inscription fee and network fee;
3. pays a fixed, upfront-displayed QTC base-unit amount to the collection's **published immutable creator recipient**;
4. returns a transaction hash whose finalized proof contains the inscription, the fee recipient/amount, and original signer/creator;
5. fails all-or-nothing, including on QLYP rejection and chain reorganizations.

Do not treat this illustrative command as implemented:

```ts
// PROPOSAL ONLY — not accepted by the public provider today
{
  kind: 'inscribeWithCreatorFee',
  contentType: 'image/svg+xml',
  content: '0x…',
  creatorFee: {recipient:'0x<32-byte-QTC-owner>',amountBaseUnits:'<integer-string>'}
}
```

We would accept any safer reviewed equivalent, including a wallet-supported *single native batch* if consensus supports it. A website-created independent `sendQtc` transaction before or after inscribing is **not atomic** and is not an acceptable substitute for an automatic mandatory fee. The collector must be able to cancel without paying a platform charge.

## Production dapp origin authorization

Confirm the exact `https://` origin and whether `keys.qlyphs.com` can support it in its published build `dappOrigins` allowlist, or whether the browser extension accepts it. Provide the SDK import path/version and the set of required methods:

- `capabilities`
- `connect`
- `accounts`
- `network`
- `requestTransaction`
- `disconnect`
- state and network change events, if supported.

No seed words/private keys are shared with the site. `NEAR`, `Rabby`, and `MetaMask` cannot sign the required native post-quantum Quantus inscription.

## Finalized receipt contract

Please provide authenticated, documented indexer / RPC endpoints (and real mainnet genesis) for:

- tip head + finalized heights and checkpoint/block hash;
- block by height (verify height and hash);
- Quark by ID/number returning creator, owner, SHA-256 and **exact content bytes**;
- native transaction hash and chain height, QLYP acceptance/verdict and atomic creator payout output, from independent server-side source;
- reorg / expired / uncertain-submission reconciliation.

Collection must check hash equality on raw bytes and ensure edition and payment intent cannot be replayed. Quark number is *assigned by chain inclusion* and cannot be guaranteed at checkout.

## Proposed launch and acceptance

1. Allowlist staging origin; review provider build and UI on testnet or safe available environment.
2. Validate same-tx fee for success, user rejection, insufficient QTC, invalid payload, timeout, unknown submission, QLYP rejection and reorg.
3. Move to production origin after independent code review and a spend-capped mainnet smoke inscription; verify all data from indexer + separate explorer after 20 blocks.
4. Publish signed, frozen real-block collection manifest and developer payout address. Enable public mint only with explicit operator signoff.

**Current code remains safe if no upstream work is approved**: all real signing is disabled.
