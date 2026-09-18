# Demo logic contracts

The shared modules are dependency-free ES modules that run unchanged in a browser or in Node. All included fixture records are fictional synthetic data for an offline application-preparation demo. None of the functions geocode an address, call a property service, or call a model.

## Imports

```js
import {
  parseCSV,
  reviewAddresses,
  selectProspects,
  safeCSV,
  validateAudit,
} from './lib/workflows.mjs';

import {
  CUSTOMER_CSV,
  PROPERTY_ROWS,
  AUDIT_CHECKLIST,
  AUDIT_RESPONSES,
} from './data/fixtures.mjs';
```

`AUDIT_RESPONSES` has three named replay scenarios: `good`, `low`, and `bad`.

## `parseCSV(text)`

Accepts CSV text and returns one object per data row, keyed by the trimmed header names. It supports a leading UTF-8 BOM, LF or CRLF records, quoted newlines, commas in quoted values, and doubled quote escapes.

The function throws an `Error` with a displayable message when the header row is absent, a header is empty or duplicated (case-insensitive), a quote is malformed, or a data row has the wrong number of columns. It throws a `TypeError` for non-string input.

```js
parseCSV('name,zip\r\n"Mira Solis",70817');
// [{ name: 'Mira Solis', zip: '70817' }]
```

## `reviewAddresses(rows)`

Requires an array of row objects containing non-empty `name`, `street`, `city`, `state`, and `zip` values. State values must be a two-letter US state or DC code; ZIP values must be five digits or ZIP+4. Checks are syntactic and make no deliverability or geocoding claim.

Deduplication uses the complete `street`, `city`, `state`, and `zip`, ignoring case, leading/trailing whitespace, and repeated internal whitespace. The recipient name is not part of the duplicate key. Apartment text remains part of `street`, so different unit numbers remain distinct.

```js
{
  accepted: [{ row, reason: 'Address is complete and ready for review.' }],
  rejected: [{ row, reason: 'name is required; ZIP must be 5 digits or ZIP+4.' }],
  duplicates: [{ row, reason: 'Duplicate of input row 1.' }],
}
```

Every entry keeps the original `row` object by reference. The function does not normalize or mutate input data.

## `selectProspects(rows, filters)`

Rows use `street`, `city`, `state`, `zip`, `activityDate`, and `price`; `ownerName` is optional and other display fields pass through untouched. Address review supplies the neutral name `New homeowner` only for validation when `ownerName` is blank; the original row is never changed. Filters use `{ zip, maxDays, asOf }`. Dates must be real `YYYY-MM-DD` calendar dates. `maxDays` is an inclusive, non-negative whole number. A five-digit ZIP filter also matches the same ZIP+4 prefix; a ZIP+4 filter requires an exact match.

Invalid filters return no selected or excluded rows and one error notice per invalid filter. With valid filters, incomplete or invalid addresses, duplicate addresses, and missing, impossible, or future activity dates are excluded. Address identity uses the same case-insensitive, whitespace-normalized full-address key as `reviewAddresses`, so apartment units remain distinct. Deduplication occurs after ZIP and date eligibility checks: the first eligible input row for an address is selected, and an earlier stale or otherwise ineligible row cannot consume that address. Day differences use UTC calendar days. `price: null`, `undefined`, `''`, or a nonnumeric value displays as `Price unavailable`; numeric zero displays as `$0`.

```js
{
  selected: [{ row, daysSinceActivity: 5, priceDisplay: '$315,000' }],
  excluded: [
    { row, reason: 'Address review failed: street is required.' },
    { row, reason: 'Duplicate property address; duplicate of input row 1.' },
  ],
  notices: [
    { type: 'success', message: '1 prospect matches the current filters.' },
    { type: 'warning', message: '1 row was excluded because its activity date is missing or invalid.' },
  ],
}
```

Notice `type` is `success`, `warning`, or `error`. This is deterministic filtering of supplied synthetic rows, not a live property search.

With the included property fixture and `{ zip: '70817', maxDays: 30, asOf: '2026-09-17' }`, four distinct, complete addresses are selected. The exclusions demonstrate a duplicate address, an incomplete address, a missing activity date, a stale row, and another ZIP. The two Copper Finch apartment rows remain separate prospects.

## `safeCSV(rows)`

Returns a CRLF-delimited CSV string. Columns are the union of object keys in first-seen order. Missing, `null`, and `undefined` cells are blank; numeric zero is preserved. Values containing commas, quotes, CR, or LF are quoted and embedded quotes are doubled.

String values whose first non-space character is `=`, `+`, `-`, or `@` receive a leading apostrophe to prevent spreadsheet formula execution. Numeric negative values remain numeric. An empty array returns an empty string; non-array input or non-object rows throw `TypeError`.

## `validateAudit(response, checklist)`

The checklist is an array of unique `{ id, label }` objects. The replay response must have exactly one top-level property, `items`. Every item must have exactly `id`, `verdict`, `evidence`, and `confidence`:

- `id` must match one checklist id exactly and appear once.
- `verdict` is `correct`, `missing`, `wrong`, or `uncertain`.
- `evidence` is a non-empty string.
- `confidence` is `high`, `medium`, or `low`.

Unknown, missing, or duplicate ids, unsupported properties, invalid enums, and invalid evidence make `valid` false. Invalid response structure conservatively routes every checklist item to review. A structurally valid item counts as `correct` only when its verdict is `correct` and confidence is `high` or `medium`. Low confidence and every non-correct verdict route to `needsReview`.

```js
{
  valid: true,
  errors: [],
  results: [{
    id: 'brand-signage',
    label: 'Brand signage is visible and unobstructed.',
    verdict: 'correct',
    evidence: 'The synthetic scene shows the full brand panel above the display.',
    confidence: 'high',
    disposition: 'correct',
    reason: 'Accepted as correct.',
  }],
  counts: { correct: 1, needsReview: 0, total: 1 },
}
```

Validation errors have `{ code, message }` plus `itemId` or `property` when applicable. Codes include `INVALID_RESPONSE`, `INVALID_ITEMS`, `INVALID_ITEM`, `INVALID_ID`, `UNKNOWN_ID`, `MISSING_ID`, `DUPLICATE_ID`, `UNSUPPORTED_PROPERTY`, `INVALID_VERDICT`, `INVALID_EVIDENCE`, and `INVALID_CONFIDENCE`.

The audit fixtures are stored response objects only. The UI must label them as synthetic offline replay and must not describe validation as a live model call.
