import { randomUUID } from 'node:crypto';

export class PaidOrders {
  constructor(db, now = () => Date.now()) {
    this.db = db;
    this.now = now;
    db.exec(`CREATE TABLE IF NOT EXISTS paid_orders (
      id TEXT PRIMARY KEY,
      owner TEXT NOT NULL,
      edition INTEGER NOT NULL CHECK(edition BETWEEN 1 AND 256),
      state TEXT NOT NULL CHECK(state IN ('awaiting_payment','payment_unknown','paid','inscribing','complete','refund_due')),
      amount_base_units TEXT,
      payment_hash TEXT UNIQUE,
      inscription_hash TEXT UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS active_paid_edition ON paid_orders(edition)
      WHERE state IN ('paid','inscribing','complete');`);
  }
  create(owner, edition) {
    if (!/^0x[0-9a-f]{64}$/i.test(owner)) throw Error('invalid account');
    if (!Number.isInteger(edition) || edition < 1 || edition > 256) throw Error('invalid edition');
    const id = randomUUID(), now = this.now();
    this.db.prepare('INSERT INTO paid_orders(id,owner,edition,state,created_at,updated_at) VALUES (?,?,?,?,?,?)')
      .run(id,owner.toLowerCase(),edition,'awaiting_payment',now,now);
    return {id,owner:owner.toLowerCase(),edition,state:'awaiting_payment'};
  }
  get(id) { return this.db.prepare('SELECT * FROM paid_orders WHERE id=?').get(id) ?? null; }
  recordPending(id, hash) {
    if (!/^0x[0-9a-f]{64}$/i.test(hash)) throw Error('invalid transaction hash');
    return this.db.prepare("UPDATE paid_orders SET state='payment_unknown',payment_hash=?,updated_at=? WHERE id=? AND state='awaiting_payment'")
      .run(hash.toLowerCase(),this.now(),id).changes===1;
  }
  // Must be invoked ONLY after independent server-side chain verification.
  confirmVerifiedPayment(id, evidence) {
    const row = this.get(id);
    if (!row || row.state!=='payment_unknown' || !evidence?.verified || evidence.hash?.toLowerCase()!==row.payment_hash ||
        evidence.sender?.toLowerCase()!==row.owner || evidence.finalized!==true) return false;
    if (!/^[1-9][0-9]*$/.test(String(evidence.amountBaseUnits))) return false;
    return this.db.prepare("UPDATE paid_orders SET state='paid',amount_base_units=?,updated_at=? WHERE id=? AND state='payment_unknown'")
      .run(String(evidence.amountBaseUnits),this.now(),id).changes===1;
  }
  mayInscribe(id, owner) {
    const row=this.get(id);
    return Boolean(row && row.owner===owner?.toLowerCase() && ['paid','inscribing'].includes(row.state));
  }
}
