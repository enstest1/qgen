# QGEN — review-ready handoff status (2026-10-12)

## What is verified and working

- Full Node.js website and SVG backend are packaged here. `npm test` passes **31/31**; `npm run validate` passes **256/256**; max art size **926 UTF-8 bytes** against strict 960 B budget.
- All 256 synthetic demo artworks are different in both SHA-256 and decoded trait vectors; colors span six palettes.
- Self-contained onchain-style SVGs have no linked images, remote dependencies, scripts or event handlers.
- Persistent SQLite registry implemented for **single-instance simulated** exclusive claims, expiry, conflict and duplicate receipt prevention. NOT yet load-tested across replicas or production-hardened.
- Wallet request schema encoded and tested for **existing** Qlyphs `inscribe` command; mainnet signing intentionally hard-disabled.
- Separate Railway visual preview deployed and external `/api/health` returned HTTP 200. Live endpoint: https://qgen.up.railway.app/
- An independent GitHub repository is **created, with source push pending**. All files are ready for import into `enstest1/qgen` after source import; no unrelated repo should be altered.

## Precise request to Qlyphs developer

Please read `docs/DEVELOPER-MESSAGE.md` first (copy/paste message), `docs/DEVELOPER-INTEGRATION-CONTRACT.md` second, and check `src/engine.mjs`, `src/wallet.mjs`, `src/verification.mjs` and tests. We need:

1. **Approved dapp origin and documented SDK** for Qlyphs Keys / extension on mainnet.
2. **Single atomic, explicitly user-authorized inscription + creator payment**, or authoritative advice on the safe equivalent. No pre-mint, offchain custody or invisible charges; minter can cancel without fee.
3. **Trusted finalized Quark read API and receipt schema**, covering content SHA, creator, Quark id, mainnet genesis, fee recipient+amount, QLYP execution result, block height and reorg handling.
4. **Exact SVG size/type and current fee schedule**, device support, minimum finality and published reliable endpoint origins.

## Honest limitations

- Current art is based on **simulated** Quantus blocks. No official real block anchor or immutable finalized manifest has been set.
- This is an edition registry and collection promise, **not** onchain 256-token cap. Chain-level copies remain possible.
- The spinning mystery reveal is a visual interaction, **not** a cryptographically hidden image; a signer must see inscribed bytes.
- Paid minting and developer revenue are **not operational**. Qlyphs wallet protocol currently cannot atomically include a third-party fee in the published `inscribe` command.
- Final release needs tests with a tiny funded mainnet wallet, persistent multi-instance DB, real chain verifier, accessibility/mobile browser QA and independent security review.

**Decision:** Safe to share for source review. **Not safe to accept money or claim a real mint.**
