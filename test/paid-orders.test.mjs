import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { PaidOrders } from '../src/paid-orders.mjs';

test('payment-first order cannot unlock without verified payment', () => {
 const db = new DatabaseSync(':memory:');
 const orders = new PaidOrders(db,()=>1000);
 const owner='0x'+'ab'.repeat(32);
 const hash='0x'+'cd'.repeat(32);
 const order=orders.create(owner,3);
 assert.equal(orders.mayInscribe(order.id,owner),false);
 assert.equal(orders.confirmVerifiedPayment(order.id,{verified:true,hash,sender:owner,finalized:true,amountBaseUnits:'1000'}),false);
 assert.equal(orders.recordPending(order.id,hash),true);
 assert.equal(orders.recordPending(order.id,hash),false);
 assert.equal(orders.confirmVerifiedPayment(order.id,{verified:false,hash,sender:owner,finalized:true,amountBaseUnits:'1000'}),false);
 assert.equal(orders.confirmVerifiedPayment(order.id,{verified:true,hash,sender:owner,finalized:false,amountBaseUnits:'1000'}),false);
 assert.equal(orders.confirmVerifiedPayment(order.id,{verified:true,hash,sender:owner,finalized:true,amountBaseUnits:'1000'}),true);
 assert.equal(orders.mayInscribe(order.id,owner),true);
 assert.equal(orders.mayInscribe(order.id,'0x'+'ef'.repeat(32)),false);
 db.close();
});
