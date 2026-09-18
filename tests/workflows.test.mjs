import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseCSV,
  reviewAddresses,
  safeCSV,
  selectProspects,
  validateAudit,
} from '../site/lib/workflows.mjs';
import { PROPERTY_ROWS } from '../site/data/fixtures.mjs';

test('parseCSV handles a BOM, CRLF, quoted newlines, and escaped quotes', () => {
  const csv = '\ufeffname,street,notes\r\n"Avery ""Ace"" Lane","14 Lantern Way","First line\r\nSecond line"\r\n';

  assert.deepEqual(parseCSV(csv), [
    {
      name: 'Avery "Ace" Lane',
      street: '14 Lantern Way',
      notes: 'First line\r\nSecond line',
    },
  ]);
});

test('parseCSV rejects empty and duplicate headers with actionable errors', () => {
  assert.throws(
    () => parseCSV('name,,zip\nMira,Oak Way,60601'),
    /Header 2 is missing/i,
  );
  assert.throws(
    () => parseCSV('Name, name \nMira,Solis'),
    /Duplicate header "name"/i,
  );
});

test('parseCSV rejects rows whose column count does not match the header', () => {
  assert.throws(
    () => parseCSV('name,zip\nMira Solis\n'),
    /Row 2 has 1 column; expected 2/i,
  );
});

test('parseCSV rejects malformed quoted fields and empty input', () => {
  assert.throws(() => parseCSV(''), /header row is missing/i);
  assert.throws(
    () => parseCSV('name,notes\nMira,"unfinished'),
    /Unclosed quoted field/i,
  );
  assert.throws(
    () => parseCSV('name,notes\nMira,bad"quote'),
    /Unexpected quote/i,
  );
});

test('reviewAddresses separates valid, invalid, and duplicate rows without changing input', () => {
  const first = {
    name: 'Mira Solis',
    street: '1428 Lantern Way Apt 2',
    city: 'Cedar Park',
    state: 'tx',
    zip: '78613',
  };
  const duplicate = {
    name: 'Different Recipient',
    street: ' 1428 LANTERN WAY apt 2 ',
    city: 'cedar   park',
    state: 'TX',
    zip: '78613',
  };
  const otherUnit = {
    name: 'Eli Hart',
    street: '1428 Lantern Way Apt 3',
    city: 'Cedar Park',
    state: 'TX',
    zip: '78613-1204',
  };
  const invalid = {
    name: '',
    street: '9 Paper Birch Row',
    city: 'Madison',
    state: 'Wisconsin',
    zip: '5370',
  };

  const result = reviewAddresses([first, duplicate, otherUnit, invalid]);

  assert.deepEqual(result.accepted, [
    { row: first, reason: 'Address is complete and ready for review.' },
    { row: otherUnit, reason: 'Address is complete and ready for review.' },
  ]);
  assert.deepEqual(result.duplicates, [
    { row: duplicate, reason: 'Duplicate of input row 1.' },
  ]);
  assert.equal(result.rejected.length, 1);
  assert.strictEqual(result.rejected[0].row, invalid);
  assert.match(result.rejected[0].reason, /name is required/i);
  assert.match(result.rejected[0].reason, /two-letter US state/i);
  assert.match(result.rejected[0].reason, /ZIP/i);
  assert.equal(first.state, 'tx');
});

test('reviewAddresses accepts all US state codes and rejects non-array input', () => {
  const rows = ['AL', 'AK', 'AZ', 'DC', 'WY'].map((state, index) => ({
    name: `Person ${index}`,
    street: `${index + 1} Example Way`,
    city: 'Example',
    state,
    zip: '12345',
  }));

  assert.equal(reviewAddresses(rows).accepted.length, rows.length);
  assert.throws(() => reviewAddresses(null), /rows must be an array/i);
});

test('selectProspects filters by normalized ZIP and inclusive age relative to asOf', () => {
  const recent = {
    ownerName: 'Avery Lane',
    street: '10 Recent Way',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
    activityDate: '2026-09-07',
    price: 425000,
  };
  const boundary = {
    ownerName: 'Eli Hart',
    street: '20 Boundary Road',
    city: 'Chicago',
    state: 'IL',
    zip: '60601-2201',
    activityDate: '2026-08-18',
    price: 0,
  };
  const old = {
    ownerName: 'Noor Bell',
    street: '30 Old Lane',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
    activityDate: '2026-08-17',
    price: 300000,
  };

  const result = selectProspects([recent, boundary, old], {
    zip: '60601',
    maxDays: 30,
    asOf: '2026-09-17',
  });

  assert.deepEqual(result.selected, [
    { row: recent, daysSinceActivity: 10, priceDisplay: '$425,000' },
    { row: boundary, daysSinceActivity: 30, priceDisplay: '$0' },
  ]);
  assert.deepEqual(result.excluded, [
    { row: old, reason: 'Activity is older than 30 days.' },
  ]);
  assert.deepEqual(result.notices, [
    { type: 'success', message: '2 prospects match the current filters.' },
  ]);
});

test('selectProspects excludes missing and invalid dates and preserves unavailable prices', () => {
  const missingDate = {
    ownerName: 'Mira Solis', street: '1 Missing Date Way', city: 'Austin', state: 'TX',
    zip: '78701', activityDate: '', price: 275000,
  };
  const invalidDate = {
    ownerName: 'Jonah Vale', street: '2 Invalid Date Way', city: 'Austin', state: 'TX',
    zip: '78701', activityDate: '2026-02-30', price: 350000,
  };
  const unavailablePrice = {
    ownerName: 'Sam North', street: '3 Unknown Price Way', city: 'Austin', state: 'TX',
    zip: '78701', activityDate: '2026-09-10', price: null,
  };

  const result = selectProspects([missingDate, invalidDate, unavailablePrice], {
    zip: '78701',
    maxDays: 14,
    asOf: '2026-09-17',
  });

  assert.deepEqual(result.selected, [
    { row: unavailablePrice, daysSinceActivity: 7, priceDisplay: 'Price unavailable' },
  ]);
  assert.deepEqual(result.excluded, [
    { row: missingDate, reason: 'Activity date is required.' },
    { row: invalidDate, reason: 'Activity date must be a real YYYY-MM-DD date.' },
  ]);
  assert.deepEqual(result.notices, [
    { type: 'success', message: '1 prospect matches the current filters.' },
    { type: 'warning', message: '2 rows were excluded because their activity date is missing or invalid.' },
  ]);
});

test('selectProspects reports invalid filters instead of producing misleading matches', () => {
  const rows = [{ zip: '78701', activityDate: '2026-09-10', price: 100 }];

  assert.deepEqual(
    selectProspects(rows, { zip: '7870', maxDays: -1, asOf: 'not-a-date' }),
    {
      selected: [],
      excluded: [],
      notices: [
        { type: 'error', message: 'ZIP filter must be 5 digits or ZIP+4.' },
        { type: 'error', message: 'Maximum age must be a non-negative whole number of days.' },
        { type: 'error', message: 'As-of date must be a real YYYY-MM-DD date.' },
      ],
    },
  );
});

test('selectProspects rejects incomplete property addresses while allowing a missing owner name', () => {
  const ownerless = {
    ownerName: '',
    street: '41 Complete Address Way',
    city: 'Baton Rouge',
    state: 'LA',
    zip: '70817',
    activityDate: '2026-09-12',
    price: 'unknown',
  };
  const missingStreet = {
    ownerName: 'Mira Solis',
    street: '',
    city: 'Baton Rouge',
    state: 'LA',
    zip: '70817',
    activityDate: '2026-09-12',
    price: 315000,
  };

  const result = selectProspects([ownerless, missingStreet], {
    zip: '70817',
    maxDays: 30,
    asOf: '2026-09-17',
  });

  assert.deepEqual(result.selected, [
    { row: ownerless, daysSinceActivity: 5, priceDisplay: 'Price unavailable' },
  ]);
  assert.deepEqual(result.excluded, [
    { row: missingStreet, reason: 'Address review failed: street is required.' },
  ]);
  assert.deepEqual(result.notices, [
    { type: 'success', message: '1 prospect matches the current filters.' },
  ]);
});

test('selectProspects removes duplicate addresses without merging apartment units', () => {
  const firstUnit = {
    ownerName: 'Mira Solis', street: '90 Cypress Signal Road Apt 2', city: 'Baton Rouge', state: 'LA',
    zip: '70817', activityDate: '2026-09-12', price: 315000,
  };
  const duplicate = {
    ownerName: 'Different Owner', street: ' 90 CYPRESS SIGNAL ROAD apt 2 ', city: 'baton  rouge', state: 'la',
    zip: '70817', activityDate: '2026-09-11', price: 320000,
  };
  const otherUnit = {
    ownerName: 'Eli Hart', street: '90 Cypress Signal Road Apt 3', city: 'Baton Rouge', state: 'LA',
    zip: '70817', activityDate: '2026-09-10', price: 325000,
  };

  const result = selectProspects([firstUnit, duplicate, otherUnit], {
    zip: '70817',
    maxDays: 30,
    asOf: '2026-09-17',
  });

  assert.deepEqual(result.selected, [
    { row: firstUnit, daysSinceActivity: 5, priceDisplay: '$315,000' },
    { row: otherUnit, daysSinceActivity: 7, priceDisplay: '$325,000' },
  ]);
  assert.deepEqual(result.excluded, [
    { row: duplicate, reason: 'Duplicate property address; duplicate of input row 1.' },
  ]);
});

test('selectProspects deduplicates after eligibility so the first eligible address wins', () => {
  const stale = {
    ownerName: 'Mira Solis', street: '10 Same Way', city: 'Baton Rouge', state: 'LA',
    zip: '70817', activityDate: '2020-01-01', price: 300000,
  };
  const current = {
    ownerName: 'Mira Solis', street: '10 Same Way', city: 'Baton Rouge', state: 'LA',
    zip: '70817', activityDate: '2026-09-12', price: 315000,
  };
  const laterEligibleDuplicate = {
    ownerName: 'Different Owner', street: ' 10 SAME WAY ', city: 'baton rouge', state: 'la',
    zip: '70817', activityDate: '2026-09-13', price: 320000,
  };

  const result = selectProspects([stale, current, laterEligibleDuplicate], {
    zip: '70817',
    maxDays: 30,
    asOf: '2026-09-17',
  });

  assert.deepEqual(result.selected, [
    { row: current, daysSinceActivity: 5, priceDisplay: '$315,000' },
  ]);
  assert.deepEqual(result.excluded, [
    { row: stale, reason: 'Activity is older than 30 days.' },
    { row: laterEligibleDuplicate, reason: 'Duplicate property address; duplicate of input row 2.' },
  ]);
});

test('property fixtures demonstrate distinct units, a duplicate, and an incomplete address', () => {
  const result = selectProspects(PROPERTY_ROWS, {
    zip: '70817',
    maxDays: 30,
    asOf: '2026-09-17',
  });

  assert.equal(result.selected.length, 4);
  assert.ok(result.selected.some(({ row }) => row.street.endsWith('Apt 2')));
  assert.ok(result.selected.some(({ row }) => row.street.endsWith('Apt 3')));
  assert.ok(result.excluded.some(({ reason }) => /duplicate property address/i.test(reason)));
  assert.ok(result.excluded.some(({ reason }) => /address review failed: street is required/i.test(reason)));
});

test('safeCSV neutralizes formulas while preserving zero and quoting CSV syntax', () => {
  const csv = safeCSV([
    { name: '=HYPERLINK("bad")', note: 'Hello, "friend"', amount: 0 },
    { name: '  +SUM(A1:A2)', note: 'two\nlines', amount: null },
  ]);

  assert.equal(
    csv,
    'name,note,amount\r\n"\'=HYPERLINK(""bad"")","Hello, ""friend""",0\r\n\'  +SUM(A1:A2),"two\nlines",',
  );
});

test('safeCSV exports the union of row keys and rejects invalid input', () => {
  assert.equal(safeCSV([{ a: 'one' }, { b: 'two' }]), 'a,b\r\none,\r\n,two');
  assert.equal(safeCSV([]), '');
  assert.throws(() => safeCSV(null), /rows must be an array/i);
});

test('validateAudit accepts one complete exact response and separates review gating counts', () => {
  const checklist = [
    { id: 'brand-visible', label: 'Brand is visible' },
    { id: 'price-card', label: 'Price card is present' },
    { id: 'walkway', label: 'Walkway is clear' },
  ];
  const response = {
    items: [
      { id: 'brand-visible', verdict: 'correct', evidence: 'Logo appears above the display.', confidence: 'high' },
      { id: 'price-card', verdict: 'missing', evidence: 'No price card is visible.', confidence: 'high' },
      { id: 'walkway', verdict: 'correct', evidence: 'The aisle is visibly unobstructed.', confidence: 'low' },
    ],
  };

  const result = validateAudit(response, checklist);

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.counts, { correct: 1, needsReview: 2, total: 3 });
  assert.deepEqual(result.results.map(({ id, verdict, disposition }) => ({ id, verdict, disposition })), [
    { id: 'brand-visible', verdict: 'correct', disposition: 'correct' },
    { id: 'price-card', verdict: 'missing', disposition: 'needsReview' },
    { id: 'walkway', verdict: 'correct', disposition: 'needsReview' },
  ]);
  assert.match(result.results[2].reason, /low confidence/i);
});

test('validateAudit rejects missing, duplicate, and unknown checklist ids', () => {
  const checklist = [
    { id: 'signage', label: 'Signage is visible' },
    { id: 'lighting', label: 'Lighting is working' },
  ];
  const response = {
    items: [
      { id: 'signage', verdict: 'correct', evidence: 'Header sign is visible.', confidence: 'high' },
      { id: 'signage', verdict: 'correct', evidence: 'A duplicate result.', confidence: 'medium' },
      { id: 'unknown', verdict: 'wrong', evidence: 'Not in the checklist.', confidence: 'high' },
    ],
  };

  const result = validateAudit(response, checklist);

  assert.equal(result.valid, false);
  assert.deepEqual(result.counts, { correct: 0, needsReview: 2, total: 2 });
  assert.ok(result.errors.some((error) => error.code === 'DUPLICATE_ID' && error.itemId === 'signage'));
  assert.ok(result.errors.some((error) => error.code === 'UNKNOWN_ID' && error.itemId === 'unknown'));
  assert.ok(result.errors.some((error) => error.code === 'MISSING_ID' && error.itemId === 'lighting'));
});

test('validateAudit rejects unsupported fields, enums, and non-string evidence', () => {
  const checklist = [{ id: 'display', label: 'Display is stocked' }];
  const response = {
    model: 'claimed-live-model',
    items: [
      {
        id: 'display',
        verdict: 'excellent',
        evidence: ['not', 'a', 'string'],
        confidence: 'certain',
        rationale: 'Unsupported free-form field',
      },
    ],
  };

  const result = validateAudit(response, checklist);

  assert.equal(result.valid, false);
  assert.deepEqual(result.counts, { correct: 0, needsReview: 1, total: 1 });
  assert.ok(result.errors.some((error) => error.code === 'UNSUPPORTED_PROPERTY' && error.property === 'model'));
  assert.ok(result.errors.some((error) => error.code === 'UNSUPPORTED_PROPERTY' && error.property === 'rationale'));
  assert.ok(result.errors.some((error) => error.code === 'INVALID_VERDICT'));
  assert.ok(result.errors.some((error) => error.code === 'INVALID_EVIDENCE'));
  assert.ok(result.errors.some((error) => error.code === 'INVALID_CONFIDENCE'));
});
