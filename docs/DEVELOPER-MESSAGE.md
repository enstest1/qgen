# QGEN — Qlyphs integration: technical questions

**Code:** https://github.com/enstest1/qgen (public)
**Demo:** https://qgen.up.railway.app/

QGEN generates a 256-edition, deterministic, self-contained SVG PFP collection intended for Quarks on Quantus. Each demo SVG fits within a conservative 960-byte UTF-8 budget. The demo uses **simulated block data**; mainnet signing, inscription, and payments remain **disabled**. QGEN is independent of Quantus/Qlyphs, and its 256-edition cap is an offchain collection rule, not a native Quarks supply cap.

We're looking for definitive integration guidance (API/schema/examples), not asking you to build it for us.

1. **Dapp wallet connection:** Can `https://qgen.up.railway.app` (or a distinct mint subdomain) be approved for Qlyphs Keys/extension access? What is the recommended wallet provider/SDK version and the exact connect, account, network and `requestTransaction` / `inscribe` API? Is mobile supported?
2. **Creator payout:** Does the currently supported flow allow **one collector-approved atomic transaction** containing both the SVG Quark inscription and an additional explicit QTC output to our dev address (approximately US$3 equivalent), while retaining Qlyphs/network fees? If not, what supported approach do you recommend? We won't label separate transactions as atomic or charge a fee without clear approval.
3. **Onchain verification:** Which authoritative RPC/indexer endpoints and response fields return an inscription's complete content bytes/hash, Quark ID, owner/creator, transaction/output data, status, finalization height and reorg handling? Could you share an example finalized Quark inscription receipt (including multiple outputs if supported)?
4. **Limits, fees and network:** Please confirm the exact total content size/envelope overhead, accepted `image/svg+xml` format, Quark fee schedule before/after block **218,350**, authoritative QTC/USD conversion, QTC base units, mainnet network/genesis identifiers, and required confirmation depth.

**For review:** [wallet adapter](../src/wallet.mjs), [SVG generator](../src/engine.mjs), [transaction verifier](../src/verification.mjs), [integration contract](DEVELOPER-INTEGRATION-CONTRACT.md), [launch blockers](LAUNCH-GATES.md).

No private keys, wallet custody or mainnet spending are needed to answer these questions. We can adjust our integration to the supported path.
