# QGEN production rollout — qgen.lol

Canonical origin: https://qgen.lol

## Current safe state
- Source repository: enstest1/qgen
- Branch: production-qgen-lol
- Paid mint remains disabled in src/server.mjs.
- Existing Railway preview is not the complete Node/SQLite application; do not point the production domain at it without deploying the GitHub source.
- The Qlyphs wallet developer must include exactly https://qgen.lol in a released allowlist.

## Required before public launch
1. Deploy this GitHub application to a persistent Railway service with Node >=22, persistent SQLite volume and secure HTTPS.
2. Configure PUBLIC_ORIGIN=https://qgen.lol, CHAIN_MODE=demo until verified, MAINNET_MINT_ENABLED=false.
3. Attach qgen.lol in Railway and configure DNS at Porkbun using the records Railway supplies; verify certificate and domain ownership.
4. Run npm test, npm run validate and health/config/gallery/art endpoint checks against the actual deployed service.
5. Validate SVG byte size including content type and encoding against Qlyphs 1,024-byte payload ceiling.
6. Confirm Qlyphs provider 0.1.0 method signatures and mainnet allowlist release with the wallet developer.
7. Implement separate QTC developer payment only after treasury address and trusted QTC/USD quote source are configured. Provide idempotent payment reconciliation and refund/retry handling.
8. Implement transaction/indexer verification including 20-block finality, digest and owner checks.
9. Perform capped real-world mint test with explicit spending approval and an independently verified receipt.
10. Review and sign the collection manifest and perform security audit before enabling mint.

Do not set ATOMIC_DEV_FEE_VERIFIED=true: the developer confirmed the extra transfer must be a separate transaction. Never describe the two payments as atomic.
