# QGEN — GitHub and Railway handoff status

**GitHub:** https://github.com/enstest1/qgen (public, branch `main`). All application source, 256 demo SVGs, tests, documentation and technical integration questions are committed. Changes must be reviewed by pull request before any live mint.

**Railway:** https://qgen.up.railway.app/ — separately deployed **read-only Bun Function demo**, not the Node/SQLite source repository. It uses simulated Quantus block inputs and cannot sign, mint, or collect money. The existing Railway project is named `qgen`.

## Developer review

1. Share the public GitHub URL for read-only review. Grant repository write access only if there is a specific reason; otherwise accept suggestions/issues or pull requests.
2. Start at `docs/DEVELOPER-MESSAGE.md`; then `docs/DEVELOPER-INTEGRATION-CONTRACT.md`, `docs/INTEGRATION-STATUS.md`, `src/wallet.mjs`, `src/verification.mjs`, and tests.
3. Review and answer the supported origin approval, single-transaction creator fee, finalized receipt schema and fee/size rules. Nothing in this repository requests protocol changes by default.
4. Keep signing and fees disabled until the test checklist in `docs/LAUNCH-GATES.md` is complete.

## Development

```bash
git clone https://github.com/enstest1/qgen.git
cd qgen
node --test
node src/validate.mjs
node src/server.mjs
```

Demo-only environment: `CHAIN_MODE=demo`, `MAINNET_MINT_ENABLED=false`, `ATOMIC_DEV_FEE_VERIFIED=false`. The local SQLite registry is only suitable for a single-instance demo and must be replaced/hardened for real public claims.

## Continuous integration status

`docs/verify-workflow-template.yml` contains the proposed GitHub Actions workflow for Node 22 and 24. **It is a template, not an active workflow.** The authenticated GitHub token currently lacks the `workflow` scope, and GitHub rejected placing it under `.github/workflows/`. Do not claim GitHub CI is green until a suitably authorized operator installs the template as `.github/workflows/verify.yml` and verifies the runs.

The full Node.js application can later be deployed as a separate GitHub-connected Railway service in the existing `qgen` project. The public `qgen.up.railway.app` Function demo can remain available during integration review.

## Launch restriction

Do not accept QTC or advertise a completed Quark mint until all required wallet, atomic creator fee, receipt, real finalized block-manifest, database, security and capped mainnet smoke tests pass. The 256 cap is a registry rule only and is not enforced by Quarks consensus.
