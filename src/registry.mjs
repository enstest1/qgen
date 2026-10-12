import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
const hash=(s)=>createHash('sha256').update(s).digest('hex');
export class Registry {
 constructor(file=':memory:', now=()=>Date.now()) {
  this.db=new DatabaseSync(file);this.now=now;
  this.db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS edition (edition INTEGER PRIMARY KEY CHECK(edition BETWEEN 1 AND 256), status TEXT NOT NULL DEFAULT \'available\' CHECK(status IN (\'available\',\'reserved\',\'finalized\')), owner TEXT, token_hash TEXT, expires INTEGER, digest TEXT, source_height INTEGER, tx_hash TEXT UNIQUE, quark_number INTEGER UNIQUE, finalized_at INTEGER); CREATE TABLE IF NOT EXISTS activity (id INTEGER PRIMARY KEY AUTOINCREMENT, edition INTEGER, kind TEXT, at INTEGER);');
  this.getStmt=this.db.prepare('SELECT edition,status,owner,expires,digest,source_height,tx_hash,quark_number,finalized_at FROM edition WHERE edition=?');
  this.insert=this.db.prepare('INSERT OR IGNORE INTO edition(edition) VALUES (?)');
  this.reserveStmt=this.db.prepare("UPDATE edition SET status='reserved',owner=?,token_hash=?,expires=?,digest=?,source_height=? WHERE edition=? AND (status='available' OR (status='reserved' AND expires<?))");
  this.finishStmt=this.db.prepare("UPDATE edition SET status='finalized',expires=NULL,token_hash=NULL,tx_hash=?,quark_number=?,finalized_at=? WHERE edition=? AND status='reserved' AND token_hash=? AND expires>=?");
 }
 get(i){this.insert.run(i);return this.getStmt.get(i);}
 list(){for(let i=1;i<=256;i++)this.insert.run(i);return this.db.prepare("SELECT edition,CASE WHEN status='reserved' AND expires<? THEN 'available' ELSE status END AS status,owner,source_height,tx_hash,quark_number FROM edition ORDER BY edition").all(this.now());}
 reserve(i,owner,digest,height){
  if(!Number.isInteger(i)||i<1||i>256)throw Error('invalid edition');
  if(typeof owner!=='string'||!/^0x[a-f0-9]{64}$/i.test(owner))throw Error('invalid wallet owner');
  if(!/^[a-f0-9]{64}$/.test(digest))throw Error('invalid payload digest');
  const token=randomBytes(32).toString('hex'),now=this.now(),expires=now+10*60*1000;
  this.get(i);
  const result=this.reserveStmt.run(owner.toLowerCase(),hash(token),expires,digest,height,i,now);
  if(!result.changes)return null;
  this.db.prepare('INSERT INTO activity(edition,kind,at) VALUES (?,?,?)').run(i,'reserved',now);
  return {edition:i,token,expires,owner:owner.toLowerCase(),digest};
 }
 finalize(i,token,receipt){
  if(typeof token!=='string'||! /^[a-f0-9]{64}$/.test(token))throw Error('invalid reservation token');
  if(!receipt||!/^0x[a-f0-9]{64}$/.test(receipt.hash)||!Number.isSafeInteger(receipt.quarkNumber)||receipt.quarkNumber<1)throw Error('invalid receipt');
  const row=this.db.prepare('SELECT token_hash,owner,digest FROM edition WHERE edition=?').get(i);
  if(!row?.token_hash||!timingSafeEqual(Buffer.from(row.token_hash,'hex'),Buffer.from(hash(token),'hex')))return false;
  if(!receipt.final||!receipt.nativeSuccess||receipt.creator?.toLowerCase()!==row.owner||receipt.sha256?.toLowerCase()!==row.digest) return false;
  try{
   const r=this.finishStmt.run(receipt.hash,receipt.quarkNumber,this.now(),i,hash(token),this.now());
   if(!r.changes)return false;
   this.db.prepare('INSERT INTO activity(edition,kind,at) VALUES (?,?,?)').run(i,'finalized',this.now());
   return true;
  } catch(e){if(e.message.includes('UNIQUE constraint'))return false;throw e;}
 }
 stats(){const rows=this.db.prepare("SELECT status,expires FROM edition").all();const t=this.now();const finalized=rows.filter(r=>r.status==='finalized').length;const reserved=rows.filter(r=>r.status==='reserved'&&r.expires>=t).length;return {finalized,reserved,available:256-finalized-reserved};}
 close(){this.db.close();}
}
