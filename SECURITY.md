# Security and supported scope

This repository is a **read-only / demo** prototype. Never transfer funds to any address shown by unofficial forks; there is no official creator payout address selected. Neither this application nor its operator should ever ask for recovery phrases or private keys.

## Public mint disabled by design

- `/api/mint/prepare` always returns `MINT_DISABLED`; there is no server-held wallet or transaction submitter.
- Qlyphs origin approval and a cryptographically verified fee split are not implemented.
- Live chain read adapters need endpoints and a trusted-genesis review before use.
- `data/` is local SQLite only. Demo data is ephemeral if deployed without a persistent volume.

## Reviewer procedure

Do not merge a pull request that enables payments or client-side signing solely because CI passes. Review chain witness attestations, reserve/submit/finalize state, transaction receipt parsing, content-hash equality, idempotency and reorg handling, all payments and gas caps, origin binding and CSP, mobile wallet behavior, SVG sanitization, and rate-derived fee calculations. Confirm the wallet's real transaction review screen shows every QTC recipient and amount.

Please report any bugs privately to the repository owner rather than publishing an exploit against a live preview.
