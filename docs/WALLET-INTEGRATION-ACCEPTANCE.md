# QGEN wallet integration acceptance checklist

Status: pre-release staging. Mainnet minting must remain disabled until all items pass.

## Wallet handshake
- Qlyphs Keys production release includes exact origin https://qgen.lol in BUILD.json dappOrigins.
- Use the documented Keys SDK build (or injected extension provider), with the same mainnet genesis.
- Connection is user-initiated; verify owner, genesis, network and provider capabilities.
- A cached account is not signing authorization; every write requires explicit wallet review.
- Popup blocked, rejection, wrong chain, account change and timeout are clearly displayed.

## Inscription
- Verify all 256 deterministic SVGs and content type image/svg+xml fit the 1,024-byte onchain limit **including** metadata/encoding overhead.
- Prepare the command from the server-assigned immutable edition; never let a browser select a different edition or alter the content.
- Check the live wallet's fee quote, onchain rate and 1 QTC creation/inscription ceiling; do not hardcode a fee based on a block height.
- Treat locally returned transaction hashes as pending until chain inclusion and finality are independently confirmed.
- Verify inscription content SHA-256, creator, owner, number and block height using trusted indexer responses. Require 20 confirmations.
- Handle duplicate submissions, expired reservations, chain reorganizations and lost popup responses without automatically resending.

## Creator payment (separate sendQtc)
- Configure the approved 32-byte QTC account ID; never store a seed phrase on the server.
- Quote $3 USD in QTC using an explicitly identified trusted exchange-rate source and quote expiry.
- Display two separate transactions and wallet approvals; they are not atomic.
- Prefer inscription verification first, then creator fee; explain that creator fee collection is not guaranteed.
- Independently reconcile the payment hash, recipient, amount, finality and idempotent order linkage.
- If either payment outcome is unknown, pause and reconcile; do not retry automatically.
- Test interrupted checkout, double click, page reload, rejected payment, stale quote and indexer outage.

## Release gate
- Automated unit and integration tests pass; Railway service and persistent SQLite volume are healthy.
- Desktop and mobile responsive gallery and modal tested, including keyboard and reduced-motion preferences.
- Test one real mainnet inscription with a disposable low-value wallet only after fee confirmation and creator authorization.
- Capture receipts, verify ownership and fee reconciliation; run recovery tests.
- Enable public minting only with an explicit controlled release and rollback plan.

## Dependencies on Qlyphs developer
- Production SDK package/import and supported version.
- Exact origin allowlist for https://qgen.lol and its deployed wallet release.
- Confirm current inscribe request schema and supported result fields.
- Confirm authoritative indexer endpoints and how to look up transactions and inscription numbers.
- Confirm fee calculation and any negotiated refund arrangement.
