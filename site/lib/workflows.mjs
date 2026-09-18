const US_STATE_CODES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC',
]);

const ZIP_PATTERN = /^\d{5}(?:-\d{4})?$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const FORMULA_PATTERN = /^[\t\r\n ]*[=+\-@]/;
const VERDICTS = new Set(['correct', 'missing', 'wrong', 'uncertain']);
const CONFIDENCE_LEVELS = new Set(['high', 'medium', 'low']);

function plural(count, singular, pluralForm = `${singular}s`) {
  return count === 1 ? singular : pluralForm;
}

function parseISODate(value) {
  if (typeof value !== 'string') return null;
  const match = DATE_PATTERN.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return null;
  }

  return timestamp;
}

function parseCSVRecords(input) {
  const records = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let afterQuote = false;
  let line = 1;

  const finishField = () => {
    row.push(field);
    field = '';
    afterQuote = false;
  };

  const finishRow = () => {
    finishField();
    records.push(row);
    row = [];
  };

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (inQuotes) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
          afterQuote = true;
        }
      } else {
        field += character;
        if (character === '\n') line += 1;
      }
      continue;
    }

    if (afterQuote) {
      if (character === ',') {
        finishField();
      } else if (character === '\r' || character === '\n') {
        finishRow();
        if (character === '\r' && input[index + 1] === '\n') index += 1;
        line += 1;
      } else {
        throw new Error(`Unexpected character after closing quote on line ${line}.`);
      }
      continue;
    }

    if (character === '"') {
      if (field.length > 0) {
        throw new Error(`Unexpected quote in an unquoted field on line ${line}.`);
      }
      inQuotes = true;
    } else if (character === ',') {
      finishField();
    } else if (character === '\r' || character === '\n') {
      finishRow();
      if (character === '\r' && input[index + 1] === '\n') index += 1;
      line += 1;
    } else {
      field += character;
    }
  }

  if (inQuotes) {
    throw new Error(`Unclosed quoted field beginning before line ${line}.`);
  }

  if (row.length > 0 || field.length > 0 || afterQuote) {
    finishRow();
  }

  return records;
}

export function parseCSV(text) {
  if (typeof text !== 'string') {
    throw new TypeError('CSV input must be a string.');
  }

  const input = text.startsWith('\ufeff') ? text.slice(1) : text;
  if (input.length === 0) {
    throw new Error('CSV header row is missing.');
  }

  const records = parseCSVRecords(input);
  if (records.length === 0) {
    throw new Error('CSV header row is missing.');
  }

  const headers = records[0].map((header) => header.trim());
  const seenHeaders = new Set();

  headers.forEach((header, index) => {
    if (!header) {
      throw new Error(`Header ${index + 1} is missing.`);
    }
    const key = header.toLocaleLowerCase('en-US');
    if (seenHeaders.has(key)) {
      throw new Error(`Duplicate header "${header}" at column ${index + 1}.`);
    }
    seenHeaders.add(key);
  });

  return records.slice(1).map((values, index) => {
    if (values.length !== headers.length) {
      const noun = plural(values.length, 'column');
      throw new Error(`Row ${index + 2} has ${values.length} ${noun}; expected ${headers.length}.`);
    }
    return Object.fromEntries(headers.map((header, headerIndex) => [header, values[headerIndex]]));
  });
}

function cleanAddressPart(value) {
  return String(value ?? '').trim();
}

function addressKey(row) {
  return [row.street, row.city, row.state, row.zip]
    .map((value) => cleanAddressPart(value).replace(/\s+/g, ' ').toLocaleLowerCase('en-US'))
    .join('\u001f');
}

export function reviewAddresses(rows) {
  if (!Array.isArray(rows)) {
    throw new TypeError('Address rows must be an array.');
  }

  const accepted = [];
  const rejected = [];
  const duplicates = [];
  const firstRowsByAddress = new Map();

  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      rejected.push({ row, reason: 'Row must be an object with address fields.' });
      return;
    }

    const problems = [];
    for (const field of ['name', 'street', 'city', 'state', 'zip']) {
      if (!cleanAddressPart(row[field])) problems.push(`${field} is required`);
    }

    const state = cleanAddressPart(row.state).toUpperCase();
    if (state && !US_STATE_CODES.has(state)) {
      problems.push('state must be a two-letter US state code');
    }

    const zip = cleanAddressPart(row.zip);
    if (zip && !ZIP_PATTERN.test(zip)) {
      problems.push('ZIP must be 5 digits or ZIP+4');
    }

    if (problems.length > 0) {
      rejected.push({ row, reason: `${problems.join('; ')}.` });
      return;
    }

    const key = addressKey(row);
    if (firstRowsByAddress.has(key)) {
      duplicates.push({ row, reason: `Duplicate of input row ${firstRowsByAddress.get(key)}.` });
      return;
    }

    firstRowsByAddress.set(key, index + 1);
    accepted.push({ row, reason: 'Address is complete and ready for review.' });
  });

  return { accepted, rejected, duplicates };
}

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return 'Price unavailable';
  const numericPrice = typeof price === 'number' ? price : Number(price);
  if (!Number.isFinite(numericPrice)) return 'Price unavailable';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(numericPrice);
}

export function selectProspects(rows, filters = {}) {
  if (!Array.isArray(rows)) {
    throw new TypeError('Prospect rows must be an array.');
  }

  const notices = [];
  const zip = String(filters?.zip ?? '').trim();
  const maxDays = Number(filters?.maxDays);
  const asOfTimestamp = parseISODate(filters?.asOf);

  if (!ZIP_PATTERN.test(zip)) {
    notices.push({ type: 'error', message: 'ZIP filter must be 5 digits or ZIP+4.' });
  }
  if (
    filters?.maxDays === ''
    || filters?.maxDays === null
    || filters?.maxDays === undefined
    || !Number.isInteger(maxDays)
    || maxDays < 0
  ) {
    notices.push({ type: 'error', message: 'Maximum age must be a non-negative whole number of days.' });
  }
  if (asOfTimestamp === null) {
    notices.push({ type: 'error', message: 'As-of date must be a real YYYY-MM-DD date.' });
  }

  if (notices.length > 0) {
    return { selected: [], excluded: [], notices };
  }

  const selected = [];
  const excluded = [];
  let dateIssueCount = 0;
  const filterIsZip5 = zip.length === 5;
  const firstEligibleInputIndexByAddress = new Map();

  rows.forEach((row, inputIndex) => {
    const addressRow = {
      name: cleanAddressPart(row?.ownerName) || 'New homeowner',
      street: row?.street,
      city: row?.city,
      state: row?.state,
      zip: row?.zip,
    };
    const addressReview = reviewAddresses([addressRow]);
    if (addressReview.rejected.length > 0) {
      excluded.push({
        row,
        reason: `Address review failed: ${addressReview.rejected[0].reason}`,
      });
      return;
    }

    const rowZip = String(row?.zip ?? '').trim();
    const zipMatches = filterIsZip5 ? rowZip.slice(0, 5) === zip : rowZip === zip;
    if (!ZIP_PATTERN.test(rowZip) || !zipMatches) {
      excluded.push({ row, reason: 'ZIP does not match the current filter.' });
      return;
    }

    const activityDate = row?.activityDate;
    if (activityDate === null || activityDate === undefined || activityDate === '') {
      excluded.push({ row, reason: 'Activity date is required.' });
      dateIssueCount += 1;
      return;
    }

    const activityTimestamp = parseISODate(activityDate);
    if (activityTimestamp === null) {
      excluded.push({ row, reason: 'Activity date must be a real YYYY-MM-DD date.' });
      dateIssueCount += 1;
      return;
    }

    const daysSinceActivity = Math.floor((asOfTimestamp - activityTimestamp) / 86_400_000);
    if (daysSinceActivity < 0) {
      excluded.push({ row, reason: 'Activity date is after the as-of date.' });
      dateIssueCount += 1;
      return;
    }
    if (daysSinceActivity > maxDays) {
      excluded.push({ row, reason: `Activity is older than ${maxDays} ${plural(maxDays, 'day')}.` });
      return;
    }

    const key = addressKey(addressRow);
    if (firstEligibleInputIndexByAddress.has(key)) {
      excluded.push({
        row,
        reason: `Duplicate property address; duplicate of input row ${firstEligibleInputIndexByAddress.get(key)}.`,
      });
      return;
    }
    firstEligibleInputIndexByAddress.set(key, inputIndex + 1);

    selected.push({ row, daysSinceActivity, priceDisplay: formatPrice(row?.price) });
  });

  notices.push({
    type: 'success',
    message: `${selected.length} ${plural(selected.length, 'prospect')} ${selected.length === 1 ? 'matches' : 'match'} the current filters.`,
  });
  if (dateIssueCount > 0) {
    notices.push({
      type: 'warning',
      message: `${dateIssueCount} ${plural(dateIssueCount, 'row')} ${dateIssueCount === 1 ? 'was' : 'were'} excluded because ${dateIssueCount === 1 ? 'its' : 'their'} activity date is missing or invalid.`,
    });
  }

  return { selected, excluded, notices };
}

function safeCell(value) {
  if (value === null || value === undefined) return '';
  let text = String(value);
  if (typeof value === 'string' && FORMULA_PATTERN.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function safeCSV(rows) {
  if (!Array.isArray(rows)) {
    throw new TypeError('CSV rows must be an array.');
  }
  if (rows.length === 0) return '';

  const headers = [];
  const seenHeaders = new Set();
  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      throw new TypeError(`CSV row ${index + 1} must be an object.`);
    }
    Object.keys(row).forEach((header) => {
      if (!seenHeaders.has(header)) {
        seenHeaders.add(header);
        headers.push(header);
      }
    });
  });

  const lines = [headers.map(safeCell).join(',')];
  rows.forEach((row) => {
    lines.push(headers.map((header) => safeCell(row[header])).join(','));
  });
  return lines.join('\r\n');
}

function auditError(code, message, details = {}) {
  return { code, message, ...details };
}

export function validateAudit(response, checklist) {
  if (!Array.isArray(checklist)) {
    throw new TypeError('Audit checklist must be an array.');
  }

  const checklistIds = new Set();
  checklist.forEach((item, index) => {
    if (!item || typeof item.id !== 'string' || !item.id.trim()) {
      throw new TypeError(`Checklist item ${index + 1} must have a non-empty string id.`);
    }
    if (checklistIds.has(item.id)) {
      throw new Error(`Checklist id "${item.id}" is duplicated.`);
    }
    checklistIds.add(item.id);
  });

  const errors = [];
  const items = [];

  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    errors.push(auditError('INVALID_RESPONSE', 'Audit response must be an object.'));
  } else {
    for (const property of Object.keys(response)) {
      if (property !== 'items') {
        errors.push(auditError(
          'UNSUPPORTED_PROPERTY',
          `Unsupported response property "${property}".`,
          { property },
        ));
      }
    }
    if (!Array.isArray(response.items)) {
      errors.push(auditError('INVALID_ITEMS', 'Audit response items must be an array.'));
    } else {
      items.push(...response.items);
    }
  }

  const occurrences = new Map();
  const allowedItemProperties = new Set(['id', 'verdict', 'evidence', 'confidence']);

  items.forEach((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push(auditError('INVALID_ITEM', `Audit item ${index + 1} must be an object.`));
      return;
    }

    const itemId = typeof item.id === 'string' ? item.id : undefined;
    if (itemId) {
      occurrences.set(itemId, [...(occurrences.get(itemId) ?? []), item]);
      if (!checklistIds.has(itemId)) {
        errors.push(auditError('UNKNOWN_ID', `Unknown checklist id "${itemId}".`, { itemId }));
      }
    } else {
      errors.push(auditError('INVALID_ID', `Audit item ${index + 1} must have a string id.`));
    }

    for (const property of Object.keys(item)) {
      if (!allowedItemProperties.has(property)) {
        errors.push(auditError(
          'UNSUPPORTED_PROPERTY',
          `Unsupported property "${property}" on audit item ${itemId ?? index + 1}.`,
          { property, ...(itemId ? { itemId } : {}) },
        ));
      }
    }

    if (!VERDICTS.has(item.verdict)) {
      errors.push(auditError(
        'INVALID_VERDICT',
        `Audit item ${itemId ?? index + 1} has an invalid verdict.`,
        itemId ? { itemId } : {},
      ));
    }
    if (typeof item.evidence !== 'string' || !item.evidence.trim()) {
      errors.push(auditError(
        'INVALID_EVIDENCE',
        `Audit item ${itemId ?? index + 1} must include a non-empty evidence string.`,
        itemId ? { itemId } : {},
      ));
    }
    if (!CONFIDENCE_LEVELS.has(item.confidence)) {
      errors.push(auditError(
        'INVALID_CONFIDENCE',
        `Audit item ${itemId ?? index + 1} has an invalid confidence level.`,
        itemId ? { itemId } : {},
      ));
    }
  });

  for (const checklistItem of checklist) {
    const matches = occurrences.get(checklistItem.id) ?? [];
    if (matches.length === 0) {
      errors.push(auditError(
        'MISSING_ID',
        `Missing response for checklist id "${checklistItem.id}".`,
        { itemId: checklistItem.id },
      ));
    } else if (matches.length > 1) {
      errors.push(auditError(
        'DUPLICATE_ID',
        `Checklist id "${checklistItem.id}" appears ${matches.length} times.`,
        { itemId: checklistItem.id },
      ));
    }
  }

  const valid = errors.length === 0;
  const results = checklist.map((checklistItem) => {
    const auditItem = occurrences.get(checklistItem.id)?.[0] ?? null;
    const verdict = auditItem?.verdict ?? null;
    let disposition = 'needsReview';
    let reason = 'Response is incomplete or failed validation.';

    if (valid && verdict === 'correct' && auditItem.confidence !== 'low') {
      disposition = 'correct';
      reason = 'Accepted as correct.';
    } else if (valid && auditItem?.confidence === 'low') {
      reason = 'Low confidence requires human review.';
    } else if (valid && verdict) {
      reason = `Verdict "${verdict}" requires human review.`;
    }

    return {
      id: checklistItem.id,
      label: checklistItem.label ?? checklistItem.id,
      verdict,
      evidence: auditItem?.evidence ?? null,
      confidence: auditItem?.confidence ?? null,
      disposition,
      reason,
    };
  });

  const correct = results.filter((result) => result.disposition === 'correct').length;
  return {
    valid,
    errors,
    results,
    counts: {
      correct,
      needsReview: checklist.length - correct,
      total: checklist.length,
    },
  };
}
