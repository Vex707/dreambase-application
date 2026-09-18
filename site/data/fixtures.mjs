// Fictional, synthetic records for the offline application-preparation demos.
export const CUSTOMER_CSV = `name,street,city,state,zip
Mira Solis,1428 Lantern Way Apt 2,Cedar Park,TX,78613
Eli Hart,77 Copper Finch Road,Madison,WI,53703
"Avery ""Ace"" Lane",410 Paper Birch Row,Portland,ME,04101
Noor Bell,9 Juniper Signal Court,Decatur,GA,30030
Different Recipient, 1428 LANTERN WAY apt 2 ,cedar park,tx,78613
,55 Missing Name Avenue,Austin,TX,7870`;

export const PROPERTY_ROWS = [
  {
    ownerName: 'Mira Solis',
    street: '1840 Lantern Trace',
    city: 'Baton Rouge',
    state: 'LA',
    zip: '70817',
    activityDate: '2026-09-12',
    price: 315000,
    source: 'Synthetic offline fixture',
  },
  {
    ownerName: 'Different Recipient',
    street: ' 1840 LANTERN TRACE ',
    city: 'baton  rouge',
    state: 'la',
    zip: '70817',
    activityDate: '2026-09-11',
    price: 318000,
    source: 'Synthetic offline fixture',
  },
  {
    ownerName: 'Eli Hart',
    street: '902 Copper Finch Drive Apt 2',
    city: 'Baton Rouge',
    state: 'LA',
    zip: '70817-2204',
    activityDate: '2026-08-20',
    price: null,
    source: 'Synthetic offline fixture',
  },
  {
    ownerName: 'Talia Reed',
    street: '902 Copper Finch Drive Apt 3',
    city: 'Baton Rouge',
    state: 'LA',
    zip: '70817',
    activityDate: '2026-09-05',
    price: 'unknown',
    source: 'Synthetic offline fixture',
  },
  {
    ownerName: 'Noor Bell',
    street: '31 Juniper Signal Court',
    city: 'Baton Rouge',
    state: 'LA',
    zip: '70817',
    activityDate: '2026-09-01',
    price: 0,
    source: 'Synthetic offline fixture',
  },
  {
    ownerName: 'Avery Lane',
    street: '66 Paper Birch Row',
    city: 'Baton Rouge',
    state: 'LA',
    zip: '70817',
    activityDate: '2026-07-20',
    price: 289000,
    source: 'Synthetic offline fixture',
  },
  {
    ownerName: 'Sam North',
    street: '8 Blue Heron Passage',
    city: 'Baton Rouge',
    state: 'LA',
    zip: '70817',
    activityDate: '',
    price: 340000,
    source: 'Synthetic offline fixture',
  },
  {
    ownerName: 'Reina Brooks',
    street: '',
    city: 'Baton Rouge',
    state: 'LA',
    zip: '70817',
    activityDate: '2026-09-08',
    price: 299000,
    source: 'Synthetic offline fixture',
  },
  {
    ownerName: 'Jonah Vale',
    street: '517 Ember Field Lane',
    city: 'Baton Rouge',
    state: 'LA',
    zip: '70816',
    activityDate: '2026-09-09',
    price: 402500,
    source: 'Synthetic offline fixture',
  },
];

export const AUDIT_CHECKLIST = [
  { id: 'brand-signage', label: 'Brand signage is visible and unobstructed.' },
  { id: 'price-card', label: 'A readable price card is present.' },
  { id: 'walkway-clear', label: 'The customer walkway is clear.' },
];

export const AUDIT_RESPONSES = {
  good: {
    items: [
      {
        id: 'brand-signage',
        verdict: 'correct',
        evidence: 'The synthetic scene shows the full brand panel above the display.',
        confidence: 'high',
      },
      {
        id: 'price-card',
        verdict: 'correct',
        evidence: 'A price card is visible on the front-right shelf edge.',
        confidence: 'medium',
      },
      {
        id: 'walkway-clear',
        verdict: 'correct',
        evidence: 'No objects appear in the marked customer walkway.',
        confidence: 'high',
      },
    ],
  },
  low: {
    items: [
      {
        id: 'brand-signage',
        verdict: 'correct',
        evidence: 'The brand panel appears above the display.',
        confidence: 'high',
      },
      {
        id: 'price-card',
        verdict: 'uncertain',
        evidence: 'A small card is present, but its text is not readable in this replay.',
        confidence: 'low',
      },
      {
        id: 'walkway-clear',
        verdict: 'correct',
        evidence: 'The walkway appears clear, though its far edge is partially cropped.',
        confidence: 'low',
      },
    ],
  },
  bad: {
    items: [
      {
        id: 'brand-signage',
        verdict: 'correct',
        evidence: 'The panel is visible.',
        confidence: 'high',
      },
      {
        id: 'brand-signage',
        verdict: 'correct',
        evidence: 'Duplicate item.',
        confidence: 'medium',
      },
      {
        id: 'invented-check',
        verdict: 'excellent',
        evidence: 'This id and verdict are intentionally invalid.',
        confidence: 'certain',
      },
    ],
  },
};
