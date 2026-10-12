# Production launch gates — all mandatory

## P0 blockers (not complete)

- [ ] **Qlyphs atomic developer split.** Existing public command: `inscribe` contentType/content only. Requires upstream Qlyphs wallet + native batch review, or another formally reviewed way to atomically pay $3 USD-equivalent in QTC to the creator within the same inscription transaction. Nothing in this repo bypasses the Qlyphs wallet's fee rules.
- [ ] **Qlyphs wallet allowlist.** Request explicit approval for production/staging origins. Verify popup/extension `connect`, `accounts`, `network`, `requestTransaction` on Quantus mainnet using an account funded only with a capped test amount.
- [ ] **Creator payout account.** User supplies a dedicated public Quantus account owner; publish immutable address and verify it with a separately authenticated announcement. No address was invented.
- [ ] **Trusted mainnet data adapter.** Pin official/mainnet Quantus genesis, head and finalized heights, block hashes; test multiple sources; integrate the published Quark and transaction receipts. Current configurable live adapter is not independently verified against any mainnet endpoint.
- [ ] **Public immutable manifest.** Select real finalized anchor window, render all 256, publish and independently timestamp the manifest (asset DNA, source blocks, sizes, hashes, intended creator, renderer version). Do not use DEMO samples as mainnet artifacts.
- [ ] **Quark registration proof.** Bind each successful mint to approved wallet owner, source edition, content SHA, accepted QLYP operation, final Quark ID and same-tx developer payment; verify 20-block finality and reorg handling.

## P1 testing and release

- [ ] Unit/integration test production wallet flow in an explicitly supported environment. Reject user-cancel, disconnected, wrong chain, wrong genesis, missing fee output, duplicate nonce, QLYP rejection, timeout and uncertain submission.
- [ ] Independently inspect the Qlyphs signing request in actual wallet UI. No arbitrary extra approvals and no opaque transaction signing.
- [ ] Load test reservations with multiple server instances, unique database constraints, idempotent session tokens and reorg recovery.
- [ ] Staging deploy with HTTPS, persistent datastore/backups, rate limiting at reverse proxy and production error reporting that never leaks secrets.
- [ ] Mobile Safari / Android / desktop browser visual and accessibility checks. Qlyphs wallet may restrict support per browser.
- [ ] Review/update all upstream source versions, documented fee rules and activation block against verified mainnet state.
- [ ] Security audit (SVG sanitization, request signing, server-to-node supply-chain pinning, transaction proof, fee rounding, wallet integration, pricing oracle).
- [ ] Minimal-value live smoke mint, confirm 20 blocks, prove the creator payout, prove the resulting Quark and verify on a separate independent explorer.
- [ ] Public launch only after all P0/P1 gates signed off; maintain rollback and explicitly freeze minting if verifiers disagree.

## Risk disclosures

- Quarks are not capped as a protocol. "256" is the independent collection policy, not a consensus-level cap.
- The same artwork can be inscribed multiple times elsewhere. Only collection manifest proof identifies an official item.
- The rarity score is an aesthetic/technical heuristic. It has no claim on market value.
- Fees can change. Qlyphs fees can be non-refundable after a native-successful transaction if QLYP rejects the operation.
- Public Qlyphs wallet code has not had an independent audit (as documented by Qlyphs, October 2026).
