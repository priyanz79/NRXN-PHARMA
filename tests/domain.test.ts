import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seed, transition as run, localDate, monthOf, shiftMonth, distanceMeters, coverage, migrate } from '../src/domain';
test('MR submits a future plan; manager rejects with reason, then approves revision', () => {
  let s = seed(); const month = shiftMonth(monthOf(), 1);
  s = run(s, 'MR', { type: 'applyTemplate', month });
  assert.ok(s.plans.find(p => p.month === month)!.days.length > 0);
  const before = JSON.stringify(s);
  s = run(s, 'MR', { type: 'submitPlan', month });
  assert.throws(() => run(s, 'MR', { type: 'reviewPlan', month, approve: true, reason: '' }), /role/);
  assert.throws(() => run(s, 'MR', { type: 'applyTemplate', month }), /revision/);
  assert.throws(() => run(s, 'Manager', { type: 'reviewPlan', month, approve: false, reason: '' }), /reason/);
  s = run(s, 'Manager', { type: 'reviewPlan', month, approve: false, reason: 'Increase coverage' });
  s = run(s, 'MR', { type: 'submitPlan', month });
  s = run(s, 'Manager', { type: 'reviewPlan', month, approve: true, reason: '' });
  assert.equal(s.plans.find(p => p.month === month)!.status, 'Approved'); assert.ok(before.includes('Draft'));
});
test('check-in, sample distribution, completion, and expense approval', () => {
  const initial = seed(); initial.products[0].balance = 10;
  let s = run(initial, 'MR', { type: 'startVisit', contactId: 'd1', verification: 'Demo' });
  const visitId = s.visits[0].id; const balance = s.products[0].balance;
  const productId = s.products[0].id;
  assert.throws(() => run(s, 'MR', { type: 'sample', visitId, productId, quantity: balance + 1 }), /balance/);
  assert.equal(s.products[0].balance, balance);
  s = run(s, 'MR', { type: 'sample', visitId, productId, quantity: 3 }); assert.equal(s.products[0].balance, balance - 3);
  assert.throws(() => run(s, 'MR', { type: 'claim', date: localDate() }), /Complete/);
  assert.throws(() => run(s, 'MR', { type: 'completeVisit', visitId, note: ' ' }), /outcome/);
  s = run(s, 'MR', { type: 'completeVisit', visitId, note: 'Follow up next week' });
  assert.throws(() => run(s, 'MR', { type: 'sample', visitId, productId, quantity: 1 }), /active/);
  s = run(s, 'MR', { type: 'claim', date: localDate() }); assert.equal(s.claims[0].total, 198);
  assert.throws(() => run(s, 'MR', { type: 'claim', date: localDate() }), /already exists/);
  s = run(s, 'Manager', { type: 'reviewClaim', claimId: s.claims[0].id, approve: true }); assert.equal(s.claims[0].status, 'Approved');
});
test('GPS rejects out-of-range and inaccurate locations', () => {
  const s = seed(); const c = s.contacts[0];
  assert.throws(() => run(s, 'MR', { type: 'startVisit', contactId: c.id, verification: 'GPS', location: { latitude: 0, longitude: 0, accuracy: 5 } }), /200 m/);
  assert.throws(() => run(s, 'MR', { type: 'startVisit', contactId: c.id, verification: 'GPS', location: { ...c, accuracy: 101 } }), /accuracy/);
  const next = run(s, 'MR', { type: 'startVisit', contactId: c.id, verification: 'GPS', location: { ...c, accuracy: 8 } });
  assert.equal(next.visits[0].distance, 0); assert.equal(s.visits.length, 0); assert.equal(distanceMeters(c, c), 0);
});
test('one active call at a time and duplicate check-ins are rejected', () => {
  const s = run(seed(), 'MR', { type: 'startVisit', contactId: 'd1', verification: 'Demo' });
  assert.throws(() => run(s, 'MR', { type: 'startVisit', contactId: 'd1', verification: 'Demo' }), /already/);
  assert.throws(() => run(s, 'MR', { type: 'startVisit', contactId: 'd2', verification: 'Demo' }), /active/);
});
test('deviations require reason and approval; rejected deviation permits check-in', () => {
  let s = seed(); assert.throws(() => run(s, 'MR', { type: 'deviation', contactId: 'd1', reason: '' }), /reason/);
  s = run(s, 'MR', { type: 'deviation', contactId: 'd1', reason: 'Clinic closed' });
  assert.throws(() => run(s, 'MR', { type: 'startVisit', contactId: 'd1', verification: 'Demo' }), /deviation/);
  s = run(s, 'Manager', { type: 'reviewDeviation', deviationId: s.deviations[0].id, approve: false });
  s = run(s, 'MR', { type: 'startVisit', contactId: 'd1', verification: 'Demo' }); assert.equal(s.visits.length, 1);
});
test('orders enforce outlet type and quantities without consuming sample stock', () => {
  const s = seed(); const productId = s.products[0].id; s.products[0].price = 120;
  assert.throws(() => run(s, 'MR', { type: 'order', contactId: 'd1', productId, quantity: 2 }), /chemist/);
  assert.throws(() => run(s, 'MR', { type: 'order', contactId: 'c1', productId, quantity: -1 }), /positive/);
  const next = run(s, 'MR', { type: 'order', contactId: 'c1', productId, quantity: 2 }); assert.equal(next.orders[0].total, 240); assert.equal(next.products[0].balance, s.products[0].balance);
});
test('visitor validation and role isolation', () => {
  assert.throws(() => run(seed(), 'Visitor', { type: 'applyTemplate', month: monthOf() }), /role/);
  assert.throws(() => run(seed(), 'Visitor', { type: 'enquiry', name: 'A', email: 'invalid', message: 'Hello' }), /email/);
  const s = run(seed(), 'Visitor', { type: 'enquiry', name: 'A', email: 'a@example.test', message: 'Catalogue enquiry' }); assert.equal(s.enquiries.length, 1);
});
test('coverage and template application are deduplicated', () => {
  let s = seed(); const month = shiftMonth(monthOf(), 1); s = run(s, 'MR', { type: 'applyTemplate', month }); const n = s.plans[1].days.length; s = run(s, 'MR', { type: 'applyTemplate', month }); assert.equal(s.plans[1].days.length, n); assert.ok(coverage(s, month).find(c => c.id === 'd1')!.scheduled >= 4);
});
test('revising approval blocks new calls and requires renewed approval', () => {
  const s = run(seed(), 'MR', { type: 'revisePlan', month: monthOf() }); assert.throws(() => run(s, 'MR', { type: 'startVisit', contactId: 'd1', verification: 'Demo' }), /approved/);
});
test('policy changes do not retroactively change submitted expense amounts', () => {
  let s = run(seed(), 'MR', { type: 'startVisit', contactId: 'd1', verification: 'Demo' }); s = run(s, 'MR', { type: 'completeVisit', visitId: s.visits[0].id, note: 'Done' }); s = run(s, 'MR', { type: 'claim', date: localDate() }); s = run(s, 'Administrator', { type: 'rates', rates: { Local: 999, Outstation: 999, 'Ex-Station': 999, perKm: 99 } }); assert.equal(s.claims[0].total, 198);
});
test('version 1 demo data migrates to the official website catalogue', () => {
  const old: any = seed(); old.version = 1; old.products = [{ id: 'p1', name: 'Old placeholder' }]; old.enquiries.push({ id: 'e1', name: 'Visitor', email: 'v@example.test', message: 'Hello', at: new Date().toISOString() });
  const next = migrate(old); assert.equal(next.version, 2); assert.equal(next.products.length, 13); assert.equal(next.products[0].name, 'RABISTOCK-DSR'); assert.equal(next.enquiries.length, 1); assert.equal(next.log[0].action, 'catalogueMigration');
});
