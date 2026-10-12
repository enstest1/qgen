# Verification report — 12 October 2026

## Automated suite

Executed `npm test` and `npm run validate` on Node v22.16.0 (container); Node v22.22.0 verified on connected Windows desktop.

- **31 / 31 automated tests passed**, covering deterministic 256 outputs, distinct SVG SHA-256 IDs, content lengths, invalid inputs, mutated blocks, fee phase boundary 218,349 vs 218,350, no quote invented without exchange rate, exclusive reservations, lease expiration, receipt-rejection checks, 20-client reservation race, duplicated onchain ID safeguards, wallet command shape and session validation, cross-origin/oversized POST rejection, JSON routes and CSP, disabled mainnet signer.
- **256 / 256 demo SVGs generated** with no duplicate content hashes. Maximum byte size: **926 B** (960 B conservative budget); mean **758.4 B**.
- HTTP API smoke checks passed (`/`, config, gallery, edition JSON, SVG media type, CSP, simulated reserve/confirm). `node --check public/app.js` passed.
- Manual visual inspection completed for a contact sheet of 24 generated SVG artifacts using CairoSVG.

## Not verified

- Actual desktop browser screenshot in this sandbox could not be completed: headless Chromium timed out. UI was inspected at the source/HTML/CSS level, not claimed as visually browser-QA-passed.
- No Qlyphs connection to external dapp origin, no signed mainnet transaction, no actual QTC spent, no creator payout and no independent onchain Quark record were tested.
- No multi-process/multi-host load test, penetration test or independent code/security audit was performed.
- A reduced **read-only** standalone Railway Function preview was deployed successfully and independently checked by HTTP 200 `/api/health` on Oct 12, 2026. It is **not** the GitHub-backed full Node application. No paid deployment was attempted.

**Release designation: HANDOFF / DEMO GO — PAID MAINNET NO-GO.**

### Independent deployed smoke

Railway preview: `https://qgen.up.railway.app/api/health` returned HTTP **200** with `{ "mintReady":false,"wallet":false,"chainSource":"simulated" }` from a separate connected Windows desktop on October 12, 2026. The source-based integration suite above covers the fuller application but should not be confused with the reduced Railway Function.

Browser end-to-end rendering remains **unverified** in this environment because Chromium navigation is blocked by administrator policy. Requires a separate supported browser QA before production.
