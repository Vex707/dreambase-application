// Fixed, synthetic fixtures. This is an executable metric example, not an agent.
export const contract = Object.freeze({
  id: 'paid-order-revenue', version: '1.0.0', currency: 'USD', unit: 'integer cents',
  grain: 'one row per tenant_id + order_id', status: 'paid',
  datePolicy: 'inclusive UTC calendar dates', nullPolicy: 'block unknown paid amounts',
  maxSnapshotAgeHours: 24,
});

export const scenarios = [
  {id:'join-fanout',name:'A join inflates revenue',description:'Order O-1 has two line items. Counting its full amount on both lines produces $250 instead of $150.',plan:'line-join'},
  {id:'equal-amounts',name:'Two orders, the same amount',description:'Both orders are worth $100. SUM(DISTINCT amount) removes a legitimate sale and reports only $100.',plan:'distinct-amounts'},
  {id:'tenant-leak',name:'Another workspace appears',description:'A $900 order belongs to a different workspace. A missing tenant filter must not silently include it.',plan:'unscoped'},
  {id:'stale-snapshot',name:'Correct math, old data',description:'The total is correct for its snapshot, but the snapshot is 72 hours old. The contract allows only 24 hours.',plan:'order-grain'},
  {id:'missing-amount',name:'A paid amount is unknown',description:'SQLite SUM ignores NULL. An incomplete paid order must block acceptance, even when the query returns a number.',plan:'order-grain'},
  {id:'empty-period',name:'No sales in this period',description:'An empty date window is a valid zero, distinct from a missing amount or an execution failure.',plan:'order-grain'},
];
export const plans = [
  {id:'order-grain',name:'Sum at order grain'},
  {id:'line-join',name:'Join every line, then sum'},
  {id:'distinct-amounts',name:'Join, then SUM(DISTINCT amount)'},
  {id:'unscoped',name:'Omit the workspace filter'},
];

export function getFixture(scenarioId) {
  if (!scenarios.some(s=>s.id===scenarioId)) throw new Error('Unknown scenario');
  const orders = [
    {tenant_id:'north',order_id:'O-1',amount_cents:10000,status:'paid',sold_on:'2026-09-01'},
    {tenant_id:'north',order_id:'O-2',amount_cents:5000,status:'paid',sold_on:'2026-09-17'},
    {tenant_id:'north',order_id:'O-3',amount_cents:3000,status:'cancelled',sold_on:'2026-09-10'},
    {tenant_id:'north',order_id:'O-4',amount_cents:4000,status:'paid',sold_on:'2026-08-31'},
  ];
  const lines=[{tenant_id:'north',order_id:'O-1',line_id:'L-1'},{tenant_id:'north',order_id:'O-1',line_id:'L-2'},{tenant_id:'north',order_id:'O-2',line_id:'L-3'}];
  if (scenarioId==='equal-amounts') orders[1].amount_cents=10000;
  if (scenarioId==='missing-amount') orders[1].amount_cents=null;
  if (scenarioId==='tenant-leak') orders.push({tenant_id:'south',order_id:'O-1',amount_cents:90000,status:'paid',sold_on:'2026-09-10'});
  return {orders,lines,
    parameters:{$tenant:'north',$start:scenarioId==='empty-period'?'2026-10-01':'2026-09-01',$end:scenarioId==='empty-period'?'2026-10-31':'2026-09-17'},
    snapshot:{id:`sales-fixture-v1/${scenarioId}`,createdAt:scenarioId==='stale-snapshot'?'2026-09-14T12:00:00Z':'2026-09-17T06:00:00Z',evaluatedAt:'2026-09-17T12:00:00Z'},
  };
}

export function getQuery(planId) {
  if (!plans.some(p=>p.id===planId)) throw new Error('Unknown plan');
  const joined=['line-join','distinct-amounts'].includes(planId);
  const relation=`SELECT o.tenant_id, o.order_id, o.amount_cents\nFROM orders AS o${joined?'\nJOIN order_lines AS l\n  ON l.tenant_id = o.tenant_id AND l.order_id = o.order_id':''}\nWHERE ${planId!=='unscoped'?'o.tenant_id = $tenant\n  AND ':''}o.status = 'paid'\n  AND o.sold_on BETWEEN $start AND $end`;
  const sql=`WITH candidate AS (\n${relation}\n)\nSELECT COALESCE(SUM(${planId==='distinct-amounts'?'DISTINCT ':''}amount_cents), 0) AS revenue_cents,\n       COUNT(*) AS contributing_rows\nFROM candidate;`;
  return {relation,sql};
}

function query(db,sql,parameters) {
  const statement=db.prepare(sql);
  try {
    statement.bind(parameters);
    const rows=[];
    while (statement.step()) rows.push(statement.getAsObject());
    return rows;
  } finally { statement.free(); }
}

export function runMetricCase(SQL,{scenarioId,planId}) {
  const fixture=getFixture(scenarioId);
  const {relation,sql}=getQuery(planId);
  const {orders,lines,parameters,snapshot}=fixture;
  // Independent oracle uses the declared contract, not the candidate SQL.
  const referenceRows=orders.filter(o=>o.tenant_id===parameters.$tenant && o.status==='paid' && o.sold_on>=parameters.$start && o.sold_on<=parameters.$end);
  const validAmounts=referenceRows.every(o=>Number.isSafeInteger(o.amount_cents)&&o.amount_cents>=0);
  const referenceTotal=validAmounts?referenceRows.reduce((sum,o)=>sum+o.amount_cents,0):null;
  const db=new SQL.Database();
  try {
    db.run('CREATE TABLE orders (tenant_id TEXT, order_id TEXT, amount_cents INTEGER, status TEXT, sold_on TEXT); CREATE TABLE order_lines (tenant_id TEXT, order_id TEXT, line_id TEXT);');
    for (const o of orders) db.run('INSERT INTO orders VALUES (?, ?, ?, ?, ?)',[o.tenant_id,o.order_id,o.amount_cents,o.status,o.sold_on]);
    for (const l of lines) db.run('INSERT INTO order_lines VALUES (?, ?, ?)',[l.tenant_id,l.order_id,l.line_id]);
    const values=query(db,sql,parameters)[0];
    const rows=query(db,relation,parameters);
    const key=o=>JSON.stringify([o.tenant_id,o.order_id]);
    const unique=new Set(rows.map(key));
    const fingerprint=list=>list.map(o=>JSON.stringify([o.tenant_id,o.order_id,o.amount_cents])).sort().join('\n');
    const ageHours=(Date.parse(snapshot.evaluatedAt)-Date.parse(snapshot.createdAt))/3600000;
    const checks=[
      {id:'scope',name:'Workspace scope',passed:rows.every(o=>o.tenant_id===parameters.$tenant),detail:`Every contributing row must belong to ${parameters.$tenant}.`},
      {id:'grain',name:'Order grain',passed:unique.size===rows.length,detail:`${rows.length} contributing rows; ${unique.size} distinct workspace/order keys.`},
      {id:'rows',name:'Exact contributing records',passed:fingerprint(rows)===fingerprint(referenceRows),detail:'Order identities, amounts, and multiplicity must match the independent reference.'},
      {id:'amounts',name:'Known amounts',passed:validAmounts&&rows.every(o=>Number.isSafeInteger(o.amount_cents)&&o.amount_cents>=0),detail:'Every eligible amount must be known, nonnegative, integer USD cents.'},
      {id:'total',name:'Revenue reconciliation',passed:validAmounts&&values.revenue_cents===referenceTotal,detail:'Candidate revenue must equal the independent contract calculation.'},
      {id:'freshness',name:'Snapshot freshness',passed:ageHours>=0&&ageHours<=contract.maxSnapshotAgeHours,detail:`Snapshot age: ${ageHours} hours. Maximum: ${contract.maxSnapshotAgeHours} hours.`},
    ];
    return {receiptVersion:'1.0.0',engine:'SQLite / sql.js 1.14.2',scenarioId,planId,
      status:checks.every(c=>c.passed)?'accepted':'blocked',contract:{...contract},snapshot,parameters,sql,
      candidate:{totalCents:values.revenue_cents,rowCount:values.contributing_rows,rows},
      reference:{totalCents:referenceTotal,rowCount:referenceRows.length,rows:referenceRows},checks,
      limitations:['Synthetic, fixed fixture and fixed query plans.','No live model, authorization boundary, production execution sandbox, or tamper-proof receipt.','Evaluation time is fixed for reproducibility; this is not current business data.'],
    };
  } finally { db.close(); }
}
