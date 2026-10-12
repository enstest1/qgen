# QGEN — 256 onchain PFP mint studio

> **STATUS: functional demo, NOT mainnet launch-ready. No paid mint transactions are supported.**

A DMT-inspired collection of 256 deterministic, chain-derived geometric SVG masks for **Quantus / Qlyphs Quarks**. Artwork is self-contained SVG content (max 926 bytes across all 256 demo editions), not a website-hosted JPEG or token URI. Built with Node.js 22, SQLite and browser-native JavaScript; no NPM dependencies or wallet secrets.

**Branding:** QGEN is the public project, repository and website name. The immutable QG1 artwork derivation still uses `QUANT//GENESIS|QG1|` as its original domain-separation string. This is intentional: changing it would alter all 256 SVGs and their hashes. No mint has occurred.

**GitHub repository:** https://github.com/enstest1/qgen (private).

## Live visual preview

- **Read-only reactor preview:** https://qgen.up.railway.app/ (Railway health endpoint independently returned HTTP 200 on 2026-10-12)
- **Note:** The preview is a reduced stateless Railway Function, **not** this GitHub-source Node/SQLite application. Never use the demo to request or collect QTC.
- **Full disclosure / integration status:** [`docs/INTEGRATION-STATUS.md`](docs/INTEGRATION-STATUS.md).
- **Developer integration request:** [`docs/DEVELOPER-MESSAGE.md`](docs/DEVELOPER-MESSAGE.md), [`docs/QLYPHS-DEVELOPER-HANDOFF.md`](docs/QLYPHS-DEVELOPER-HANDOFF.md), and [`docs/DEVELOPER-INTEGRATION-CONTRACT.md`](docs/DEVELOPER-INTEGRATION-CONTRACT.md).

## Run it

```bash
node --version    # Node.js 22+
cd qgen
npm test           # Automated tests
npm run validate   # Generates and validates 256 SVG outputs
npm start          # http://127.0.0.1:3000
```

To run on another machine's LAN in demo mode, set `HOST=0.0.0.0`; use a reverse proxy with HTTPS for any external exposure. Settings documented in `.env.example`. Node does not auto-read .env: export environment variables using your shell or runtime process manager.

## Delivered

- Responsive one-page website: black background, green/cyan accents, hairline borders, terminal aesthetics.
- 256-edition gallery, DNA traits inspector, dynamic onchain-sized SVG previews, byte and hash readouts.
- QG1 generator: fixed chain source height per edition, finalized block hash, SHA-256 digest, measured bit density, leading zeros, fixed trait mapping; reproducible from publicly auditable code.
- SVG byte meter and strict conservative **960-byte limit**; no external fonts/images/scripts inside inscriptions.
- SQLite registry: exclusive 10-minute reservations, source/content commitments, expiry reclamation, duplicate TX/Quark guards.
- Simulated reserve -> simulated completion and local stats; every page clearly labels DEMO. Demo uses synthetic blocks and a dummy owner. **No wallet ever charged.**
- Fee phase logic: 0.1 QTC before block 218,350; onchain USD-rate-derived $25 afterward, network costs and proposed $3 developer fee shown separately.
- Wallet command preparation based on the public Qlyphs `inscribe` command, wallet-session guard, proof validation with finality, payment output checks and content digest checks.
- Defensive API: same-origin protection for writes, JSON size limits, browser CSP, static-route traversal protection, replay/duplicate detection, no private keys.
- Tests and preflight checklist in `docs/`.

## Critical launch limitation

The public Qlyphs wallet's `requestTransaction` `inscribe` command supports only `{kind:'inscribe', contentType, content}`. It produces the Qlyphs inscription fee batch, **without an additional independently directed developer payout**. The wallet also allows only approved dapp origins. We will **not** silently collect an extra $3 before an inscription or claim that two transactions are atomic. This project intentionally keeps `/api/mint/prepare` returning HTTP 503 in every environment.

A real paid rollout depends on (1) Qlyphs support for a reviewed atomic split, (2) wallet origin approval, (3) a trusted, independently verifiable chain/indexer endpoint and signer responses, (4) anchoring the actual real block window, (5) signing the immutable collection manifest and developer payout address, and (6) staged tests on mainnet with a spending-capped wallet. Read `docs/LAUNCH-GATES.md`.

## Architecture

```text
Browser gallery ---> GET /api/gallery, /art/:edition.svg
      |                   |
      |               QG1 renderer <--- finalized Quantus block source
      |                   |
   Demo flow ------> SQLite reserve / simulated finalize
      |
   Future mainnet --X--> Qlyphs wallet (origin and atomic split unsupported)
                            |
                         Quantus QLYP inscribe
                            |
                trusted 20-block-final receipt verification
                            |
                         registry finalization
```

The *collection cap* is a **QG1 registry/manifest policy**. The underlying Quarks protocol has unlimited numbered inscriptions and permits the same content to be inscribed again. The 256 cannot be enforced by QLYP itself without a new onchain enforcement primitive. Never describe the collection as having a native smart-contract-supply cap.

## Pricing and costs

| Cost | Before block 218,350 | From block 218,350 |
|--|--|--|
| Qlyphs Quark fee | 0.1 QTC | $25 USD-equivalent in QTC at wallet's attested onchain rate |
| Quantus network | Variable (often ~0.001 QTC; estimate only) | Variable |
| Platform developer | Proposed $3 USD-equivalent in QTC | Proposed $3 USD-equivalent in QTC |
| Total | Wallet-verified sum | Wallet-verified sum |

**Not implemented:** onchain atomic developer payment. Quotes are never exact live wallet amounts. Never reuse a mock estimate as a signing authorization.

## External research used

- https://docs.qlyphs.com/quarks
- https://docs.qlyphs.com/tokens
- https://docs.qlyphs.com/wallet
- https://github.com/yacinealloul/qlyphs-wallet/blob/main/packages/native/src/commands.ts
- https://github.com/yacinealloul/qlyphs-wallet/blob/main/packages/provider/src/index.ts

`enstest1/x-lochagos` was provided as a styling reference, but the GitHub repository is currently empty (verified 2026-10-12); the requested visual aesthetic was recreated rather than copied from unavailable files.

Not affiliated with Quantus or Qlyphs. Experimental code — independent code/security review required before accepting funds.

## Independent checks and handoff

For the exact upstream request, begin with [`docs/DEVELOPER-MESSAGE.md`](docs/DEVELOPER-MESSAGE.md) and [`docs/DEVELOPER-INTEGRATION-CONTRACT.md`](docs/DEVELOPER-INTEGRATION-CONTRACT.md). See [`docs/HANDOFF-STATUS.md`](docs/HANDOFF-STATUS.md), [`docs/REMOTE-QA-2026-10-12.md`](docs/REMOTE-QA-2026-10-12.md), and [`docs/LAUNCH-GATES.md`](docs/LAUNCH-GATES.md) before touching mainnet. Read-only deployed verification is reproducible with `npm run smoke:preview`.
