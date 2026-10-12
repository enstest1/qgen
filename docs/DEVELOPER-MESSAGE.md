# QGEN — Qlyphs integration questions

**Source:** https://github.com/enstest1/qgen (private; access by invitation)
**Preview:** https://qgen.up.railway.app/

QGEN is an independent, 256-edition Quantus PFP generator intended to inscribe each self-contained `image/svg+xml` (≤960 UTF-8 bytes) as a Qlyphs Quark. The renderer, tests, and demo UI are built. The current demo uses **simulated block data**. **Mainnet wallet signing, Quark minting, and creator payments are disabled.**

We need technical confirmation of the supported integration path:

1. **Wallet / origin:** Can you approve our HTTPS staging and production origins for Qlyphs Keys or the browser extension? Which supported provider version/import, `connect`/account methods, `requestTransaction` schema, and network-switch events should we use?
2. **Single-transaction fees:** Does the current wallet/native protocol support one collector-approved **atomic** transaction that inscribes an `image/svg+xml` Quark *and* transfers a separately displayed ~US$3-equivalent QTC creator fee to a published address? If unsupported, would this need a new command/native batch, or is there an existing safer pattern? We will **not** misrepresent two payments as atomic.
3. **Verification:** Which finalized mainnet RPC/indexer endpoints and response fields should the backend use to verify the exact inscription bytes/hash, Quark ID, owner/creator, accepted QLYP operation, included creator-payment output, block height, 20-block finality and reorg handling? A sample finalized receipt would help.
4. **Limits / pricing:** Please confirm the allowed SVG MIME type and exact content-byte budget; fees before/after height **218,350**; authoritative QTC/USD conversion method and native base units; genesis/network IDs; and browser/mobile wallet support.

Relevant review files: [`docs/DEVELOPER-INTEGRATION-CONTRACT.md`](DEVELOPER-INTEGRATION-CONTRACT.md), [`src/wallet.mjs`](../src/wallet.mjs), [`src/engine.mjs`](../src/engine.mjs), [`src/verification.mjs`](../src/verification.mjs), and [`docs/LAUNCH-GATES.md`](LAUNCH-GATES.md).

**Request is for API/schema answers and feasibility confirmation, not an immediate change to your wallet.** We can adapt our site to the recommended supported method. No keys, custody, or mainnet spending are needed for review.
