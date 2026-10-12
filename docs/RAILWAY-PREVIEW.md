# Railway preview information

- Project: `qgen` on the connected enstest1 Railway workspace.
- Project ID: `ab434856-426c-4ba6-8d2a-d777f1943adf`
- Environment: `production` ID `d79b879e-48ea-46ed-bf3b-758996f1a681`
- Service: `qg-proton-preview` ID `31878af0-86f9-40b7-ac58-7cf7efc784ae`
- Generated preview domain: https://qgen.up.railway.app/
- **Important:** the Railway Function is a separate, stateless read-only visual preview. It does not serve this full Node/SQLite repository, has no collector reservations and has no real mint. It is not a GitHub-connected deployment. The source handoff ZIP is the canonical code for future review and integration.
- Do not enable paid operations on the Function preview. To deploy the full Node application from a new GitHub repository, attach a durable database/volume, configure pinned chain inputs and keep `MAINNET_MINT_ENABLED=false` until all safety gates have passed.
- Verified 2026-10-12: latest preview deploy status **SUCCESS** in Railway and external Windows desktop requested `/api/health` over HTTPS, receiving HTTP **200** (`mintReady:false`, `wallet:false`, `chainSource:simulated`). This validates a running read-only service, NOT browser visual QA or actual minting.

## Suggested migration to GitHub source-of-truth

1. Create a new repository named `qgen`, unzip the handoff package, and commit its `qgen/` contents at the repository root.
2. Connect `main` to a new Railway Node service in the existing Railway project; retain the visual preview separately until cutover.
3. Use `npm test`, `npm run validate`, `npm start`, plus an independent browser/mobile smoke test.
4. Pin actual Qlyphs/Quantus RPC, checked genesis and finalized anchor; implement a persistent production registry, independent Quark verifier, and wallet-approved atomic creator payout; a manual real funded mint is required.
5. Switch domains only after full read-only smoke testing and a completed rollback drill. Never flip mainnet signing based only on client JavaScript.
