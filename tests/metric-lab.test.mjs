import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import { runMetricCase } from '../site/lib/metric-lab.mjs';

const SQL = await initSqlJs();
const run = (scenarioId, planId='order-grain') => runMetricCase(SQL,{scenarioId,planId});

test('line joins inflate $150 to $250 and fail grain and reconciliation', () => {
  const r=run('join-fanout','line-join');
  assert.equal(r.candidate.totalCents,25000);
  assert.equal(r.reference.totalCents,15000);
  assert.equal(r.status,'blocked');
  assert.equal(r.checks.find(c=>c.id==='grain').passed,false);
});
test('order-grain SQL preserves $150 across two paid orders', () => {
  const r=run('join-fanout');
  assert.equal(r.status,'accepted');
  assert.equal(r.candidate.totalCents,15000);
  assert.equal(r.candidate.rowCount,2);
});
test('SUM DISTINCT collapses legitimate equal-price orders', () => {
  const r=run('equal-amounts','distinct-amounts');
  assert.equal(r.candidate.totalCents,10000);
  assert.equal(r.reference.totalCents,20000);
  assert.equal(r.status,'blocked');
});
test('order grain retains equal amounts on distinct order IDs', () => {
  assert.equal(run('equal-amounts').candidate.totalCents,20000);
  assert.equal(run('equal-amounts').status,'accepted');
});
test('missing tenant predicate includes a foreign order and is blocked', () => {
  const r=run('tenant-leak','unscoped');
  assert.equal(r.candidate.totalCents,105000);
  assert.equal(r.status,'blocked');
  assert.equal(r.checks.find(c=>c.id==='scope').passed,false);
});
test('scoped query excludes foreign tenant', () => {
  assert.equal(run('tenant-leak').status,'accepted');
  assert.equal(run('tenant-leak').candidate.totalCents,15000);
});
test('correct total cannot override stale snapshot rejection', () => {
  const r=run('stale-snapshot');
  assert.equal(r.candidate.totalCents,15000);
  assert.equal(r.status,'blocked');
  assert.equal(r.checks.find(c=>c.id==='freshness').passed,false);
});
test('unknown paid amount blocks even when SQL SUM ignores null', () => {
  const r=run('missing-amount');
  assert.equal(r.status,'blocked');
  assert.equal(r.checks.find(c=>c.id==='amounts').passed,false);
  assert.equal(r.reference.totalCents,null);
});
test('empty interval returns accepted zero and no rows', () => {
  const r=run('empty-period');
  assert.equal(r.status,'accepted');
  assert.equal(r.candidate.totalCents,0);
  assert.equal(r.candidate.rowCount,0);
});
test('receipt carries exact SQL, contract, snapshot, bindings and evidence', () => {
  const r=run('join-fanout');
  assert.match(r.sql,/SELECT/);
  assert.equal(r.contract.version,'1.0.0');
  assert.equal(r.parameters.$tenant,'north');
  assert.equal(r.snapshot.evaluatedAt,'2026-09-17T12:00:00Z');
  assert.equal(JSON.parse(JSON.stringify(r)).status,'accepted');
});
test('rejects unknown selectors rather than executing user-supplied SQL', () => {
  assert.throws(()=>run('unknown'),/Unknown scenario/);
  assert.throws(()=>run('join-fanout','DROP TABLE orders'),/Unknown plan/);
});
