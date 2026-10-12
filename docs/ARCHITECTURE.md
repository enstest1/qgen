# Architecture and deterministic genetics — QG1

## Collection rules

- Edition count: 256, one per numerical edition in **our** registry. No assertion that global Quark inscriptions are capped.
- Source: at launch, record a fixed finalized mainnet Quantus anchor block. Source block for edition `e`: `anchorHeight + e - 1`, requiring all 256 source blocks to have attained 20-block finality before reveal. If using a future yet-unmined window, do not pre-announce trait reveal as known or seed from unfinalized data.
- Chain identity: `genesis` included in the DNA digest. Prevents testnet/mainnet cross contamination. Demo genesis is literally `DEMO-NOT-MAINNET`.
- DNA: SHA-256 of `QUANT//GENESIS|QG1|<genesis>|<height>|<lowercase-blockhash>|<edition>`.
- Traits: digest bytes 0..7 map to palette, mask, eyes, mouth, halo, crown, glitch and lattice using fixed modulo selection; block hash bit-popcount and leading-zero nibbles supply published rarity *signals*. These are numeric heuristics, not an audited statistical rarity distribution or price projection.
- Artwork is a standalone image/svg+xml file. Input to QLYP `inscribe` is the lower-case hex encoding of the exact UTF-8 SVG bytes. Verify `sha256(svg)` before preparing a transaction. Keep SVG <=960 bytes to leave protocol envelope space; the app UI's live byte meter is the final authority.
- SVG does not link remote content or execute scripts. Can be enlarged without interpolation artifacts despite ~600–926-byte footprint.
- Registration needs a publicly verifiable signed collection manifest mapping QG1 edition -> block/source height, SHA-256 of content, content-type, renderer revision and resulting Quark number or asset ID. This registry is provenance metadata, not a native consensus-enforced contract.

## Mint state machine

```text
AVAILABLE
   |
   | prove authorized Qlyphs owner, server quote immutable content/price
   v
RESERVED (10-minute lease, SQLite atomic, duplicate claims rejected)
   |
   | Qlyphs wallet signs one atomic QLYP inscription + developer transfer
   | [NOT POSSIBLE WITH CURRENT PUBLIC WALLET COMMAND]
   v
SUBMITTED (not yet a Quark; wait for inclusion and 20-block finality)
   |
   | Independently verify the exact SVG hash, creator, Quark number,
   | same-tx developer payout and QLYP acceptance; handle reorgs.
   v
FINALIZED (registry immutable; publish manifest and Quark URL)
```

Production should not count a successful native payment as a successful inscription until the QLYP indexer returns `accepted`. Qlyphs documents that native-successful fee payments for rejected QLYP operations need not be refunded. No automatic retries on uncertain submission; require receipt lookup.

## Backend interfaces

| Method | Path | What it does |
|---|---|---|
| GET | `/api/config` | Chain status, guard flags, collection properties |
| GET | `/api/gallery?page=1` | 16 numbered editions per page and stats |
| GET | `/api/edition/:id` | Traits, source commitment, content hash and byte length |
| GET | `/art/:id.svg` | Immutable-by-seed standalone SVG, CSP-sandboxed |
| GET | `/api/fees` | Informational legacy/rate-derived estimate, never payment authorization |
| GET | `/api/mint-status` | Explains external integration blocker |
| POST | `/api/mint/prepare` | Hard-disabled 503 until atomic safety proof exists |
| POST | `/api/demo/reserve` | Synthetic exclusive reservation (demo only) |
| POST | `/api/demo/confirm` | Simulated finalization (demo only) |
| GET | `/api/activity` | Demo event feed, never market activity |

All real wallet signing must happen in an origin-authorized Qlyphs wallet, not in the server. Signing authority/private keys must never enter this backend.

## Storage

SQLite with WAL, unique Quark number and transaction hash indexes, owner/digest-bound reservation tokens stored only as SHA-256 hashes, expiry and finalization evidence. For production, move to managed PostgreSQL (or persistent SQLite volume with a single writer, backups, HA plan) before high concurrent load.

## Source adapters

`src/source.mjs` has DEMO fixture and fail-closed LIVE reader. LIVE requires `QUANTUS_STATUS_URL`, `QUANTUS_BLOCK_URL_TEMPLATE`, `EXPECTED_MAINNET_GENESIS`, vetted API response shapes and pinning. Do not merely set environment variables to arbitrary hosts and assume authenticity; verify source against an independently operated Quantus node. Receipt adapter must fetch from a trusted RPC/indexer itself, not accept JSON from the browser as evidence. Current proof module provides validation but **is not connected to a live indexer**.

## Mainnet economic invariants

- Display exact protocol fee, current QTC/USD conversion at attested effective block, estimated network fee and $3 creator fee before wallet approval.
- User pays all charges from their own noncustodial wallet. Creator cannot access recovery phrase.
- Mint fee and developer payout should be atomic or launch remains disabled. No collected developer payment on failed or rejected mint.
- Extra API fees/exchange fees must be stated before signing.
- On receipt, verify same native transaction pays the specified creator account and meets minimum verified base-unit amount, contains accepted QLYP inscription content and is final (at least 20-block depth, and source reports it finalized).
- Retry idempotency requires content+wallet+nonce/tx matching. Never sign a fresh transaction because the first response timed out without checking chain history.
- Avoid misleading mint count: other users may inscribe copies, but only registry-approved Quark asset IDs belong to this collection.

## QG1 Proton Reactor update (2026-10-12)

- **UI**: CSS nebula, orbiting atom/proton nucleus and kinetic collapse, with reduced-motion mode. No third-party scripts, WebGL or unsandboxed artwork.
- **Demo state**: `POST /api/demo/mystery` chooses an available edition with Node `crypto.randomInt`. It accepts an empty JSON object only; callers cannot supply a seed or preferred edition. A SQLite conditional update reserves the edition for 10 minutes. The reservation token remains bearer-sensitive and is never exposed to unrelated visitors. Simulated finality explicitly does not represent a Quark.
- **Production readiness**: Intentional hard stop (`/api/mint/prepare` returns 503) until verified wallet origin support, wallet-authoritative quotes, atomic creator payout, and independent finalized inscription/transaction proofs exist. Mere client-side gating is insufficient and is not relied on.
- **Edition genesis**: The real `EXPECTED_MAINNET_GENESIS` and fixed `COLLECTION_ANCHOR_HEIGHT` must be pinned and published before accepting users. QG1 uses 256 consecutive *finalized* blocks at anchor+edition-1. `SHA256('QUANT//GENESIS|QG1|'+genesis+'|'+height+'|'+blockHash+'|'+edition)` produces trait bytes. A published manifest, tests, and source should reproduce every image by itself.
- **No onchain exclusivity**: QLYP Quarks can contain identical SVG bytes more than once. The artist registry is collection-level convention, not an onchain NFT smart-contract enforced cap. Until a consensus-verifiable collection mechanism exists, do not market “only possible 256” as a protocol guarantee.
- **Blind UX clarification**: The visual animation hides the result until user action, but a truly blind onchain mint is impossible when the final SVG must be shown and signed before inscription. Qlyphs necessarily permits the collector to inspect submitted bytes.

## Qlyphs developer integration contract

1. Add the verified production **site origin** to Qlyphs wallet/Keys allowlist in a reviewed release (do not patch verification on our site).
2. Confirm `requestTransaction` accepts `{owner, genesis, command:{kind:'inscribe', contentType:'image/svg+xml', content:'0x...'}}`; verify on real hardware and intended iOS/Android browsers. Qlyphs currently returns one requested transaction, not arbitrary raw calldata.
3. Implement an **atomic platform fee** only with wallet-side, independently verifiable `inscribeAndPay` (or equivalent) capability, pinned fee recipient, explicit user approval, cancellation/error outcomes, no developer custody. Current `inscribe` does NOT accept `feeTo` or `feeAmount`. Our $3 USD equivalent amount must use a trusted rate with strict max price and exact planck rounding.
4. On finalized tx, trusted server indexes QLYP inscription details and native payout from chain, verifies genesis, creator, `SHA256(exact SVG content)`, collection edition, block height and uniqueness; native transfer amount/recipient must be verified in same atomic tx. Reorgs/timeout/unknown submission outcomes cannot cause automatic retries or duplicate payouts.
5. Sign off on security review (CSP/SVG sanitization/source pin/allowlist/low-byte limit/race conditions) and a funded minimal real mainnet mint test before enabling `/api/mint/prepare`.

See `docs/QLYPHS-DEVELOPER-HANDOFF.md` for the compact integration request.
