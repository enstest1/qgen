# Proton Nebula Reactor: demo protocol & verification

## Test expectations

- `POST /api/demo/mystery` with `{}` assigns a random available edition using a cryptographic random integer on the backend. It sets a 10-minute conditional reservation. The client cannot pick its number or seed in this route.
- `POST /api/demo/mystery` with `{ "edition":17 }` fails HTTP 400.
- An available edition can be assigned once at a time. Parallel callers racing for an edition cannot both succeed.
- `POST /api/demo/confirm` with reservation token and `edition` simulates a mock finalization. It is *not* evidence of Quark creation.
- Full wallet and paid endpoints remain blocked, including if JavaScript is bypassed and HTTP is called directly.
- The user can independently download and open the `GET /art/:edition.svg` self-contained SVG; inspection before inscription is inevitable.
- No backend key material, seed phrase or QTC deposit address exists.

## Browser QA status

Chromium headless screenshot could not complete in the restricted container (including a bare HTML sanity check); visual rendering/interactivity on production Chrome, Safari and mobile browsers must still be checked. Automated backend and static content tests are not substitutes for browser QA.

## Persistence warning

The demo stores reservations in SQLite. Railway containers have ephemeral disks: a prototype on Railway without a durable volume must not become the collection's production source of truth. For launch add PostgreSQL or attach a durable Railway volume, plus DB-backed expiration and unique receipt indices.
