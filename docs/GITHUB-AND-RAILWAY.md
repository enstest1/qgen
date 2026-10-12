# GitHub + Railway setup (source prepared; remote repository created, with source push pending)

## GitHub: create one NEW private repository, keep original projects untouched

1. Open https://github.com/new, choose owner `enstest1`, name `qgen`, visibility **Private**, leave README/license/.gitignore unchecked (this package already includes these files).
2. Use local Git in the root of this extracted package:

```bash
git init -b main
git add .
git commit -m "feat: QG1 generative Quark PFP studio — wallet integration handoff"
git remote add origin git@github.com:enstest1/qgen.git
git push -u origin main
```

`git@...` requires SSH access. Alternatively use HTTPS remote `https://github.com/enstest1/qgen.git` with your normal GitHub credential manager (never paste a token into chat).

Alternatively, from PowerShell in the unzipped source root, run `./scripts/publish-to-github.ps1` **only after** creating the new empty repository; it runs the local tests and attempts a non-force push using your normal Git credentials. It refuses existing Git repositories.

3. Add the Qlyphs dev as a read-only collaborator for review or send a ZIP. If he needs to patch wallet integrations, grant explicit write permission or ask for a fork/PR.
4. GitHub Actions runs tests on Node 22 and 24 and checks all 256 outputs. Check the green verify workflow before giving approval.

## Railway: new GitHub-connected app (separate from the previous standalone Function preview)

A Railway project `qgen` already exists. Add a new **GitHub repo service** in that project selecting `enstest1/qgen`, branch `main`, with production or staging as appropriate. Use the repo's `railway.toml`: `npm run validate && npm test`, then `npm start`, and `/api/health` health check.

Set `CHAIN_MODE=demo`, `MAINNET_MINT_ENABLED=false`, `ATOMIC_DEV_FEE_VERIFIED=false`. Never insert a private key. The app binds Railway `$PORT`. Demo registry writes to SQLite (ephemeral by default); for durable multiuser production claims, provision Postgres or a durable volume and verify backups/concurrency *before* opening mint.

## Current standalone preview

An independent Railway Function preview was created at https://qgen.up.railway.app/. It contains a reduced visual demo of the reactor and SVGs but is **not** the full source in this ZIP. Do not mistake the reduced Function for a GitHub-connected production deployment.

## Before opening mint

See `docs/LAUNCH-GATES.md`: origin allowlist, atomic creator payout, verified receipt, actual block manifest, permanent DB and controlled real-wallet test. A green CI build alone is not permission to enable production minting.
