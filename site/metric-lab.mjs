import {scenarios,plans,getFixture,getQuery,runMetricCase} from './lib/metric-lab.mjs';
const $=id=>document.getElementById(id);
let SQL, receipt;
const money=cents=>cents===null?'Unknown':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
function addOptions(id,items) {
  for (const item of items) { const option=document.createElement('option'); option.value=item.id; option.textContent=item.name; $(id).append(option); }
}
function table(target,rows,columns) {
  const parent=$(target); parent.replaceChildren();
  if (!rows.length) { const p=document.createElement('p'); p.textContent='No contributing rows in this period.'; parent.append(p); return; }
  const el=document.createElement('table'),head=document.createElement('thead'),body=document.createElement('tbody'),tr=document.createElement('tr');
  for (const col of columns) { const th=document.createElement('th'); th.scope='col'; th.textContent=col; tr.append(th); } head.append(tr);
  for (const row of rows) { const line=document.createElement('tr'); for (const col of columns) { const cell=document.createElement('td'); cell.textContent=row[col]===null?'Unknown':String(row[col]); line.append(cell); } body.append(line); }
  el.append(head,body); parent.append(el);
}
function preview() {
  receipt=null; $('receipt').disabled=true; $('repair').disabled=true;
  $('result-status').className='result-status'; $('result-status').textContent='Inputs ready. Run SQL and checks to evaluate this plan.';
  $('candidate-total').textContent='—'; $('reference-total').textContent='—'; $('candidate-count').textContent='Waiting for a run'; $('reference-count').textContent='Calculated independently in JavaScript'; $('checks').replaceChildren();
  $('candidate-rows').textContent='Run a plan to see its rows.';
  const fixture=getFixture($('scenario').value);
  $('scenario-description').textContent=scenarios.find(s=>s.id===$('scenario').value).description;
  $('sql').textContent=getQuery($('plan').value).sql;
  $('parameters').textContent=`Bound parameters: ${JSON.stringify(fixture.parameters)}`;
  $('date-contract').textContent=`${fixture.parameters.$start} through ${fixture.parameters.$end}`;
  $('snapshot').textContent=`Snapshot ${fixture.snapshot.id}. Created ${fixture.snapshot.createdAt}.`;
  table('fixture-rows',fixture.orders,['tenant_id','order_id','amount_cents','status','sold_on']);
}
function run() {
  if (!SQL) return;
  try {
    receipt=runMetricCase(SQL,{scenarioId:$('scenario').value,planId:$('plan').value});
    const failed=receipt.checks.filter(c=>!c.passed).length;
    $('result-status').className=`result-status ${receipt.status}`;
    $('result-status').textContent=failed?`Blocked: ${failed} of ${receipt.checks.length} checks failed. This answer should not be accepted.`:'Accepted for this fixture: all six contract checks passed.';
    $('candidate-total').textContent=money(receipt.candidate.totalCents); $('reference-total').textContent=money(receipt.reference.totalCents);
    $('candidate-count').textContent=`${receipt.candidate.rowCount} contributing rows`; $('reference-count').textContent=`${receipt.reference.rowCount} eligible orders`;
    $('checks').replaceChildren();
    for (const check of receipt.checks) {
      const item=document.createElement('div'),label=document.createElement('strong'),status=document.createElement('span'),detail=document.createElement('p');
      item.className=`check ${check.passed?'pass':'fail'}`; status.className='verdict'; status.textContent=check.passed?'PASS':'FAIL'; label.textContent=check.name; detail.textContent=check.detail; item.append(status,label,detail); $('checks').append(item);
    }
    table('candidate-rows',receipt.candidate.rows,['tenant_id','order_id','amount_cents']);
    $('receipt').disabled=false; $('repair').disabled=$('plan').value==='order-grain';
  } catch(error) { preview(); $('result-status').textContent=`Execution failed: ${error.message}. Reload the page and try again.`; }
}
addOptions('scenario',scenarios); addOptions('plan',plans); $('plan').value=scenarios[0].plan; preview();
$('scenario').addEventListener('change',()=>{ $('plan').value=scenarios.find(s=>s.id===$('scenario').value).plan; preview(); });
$('plan').addEventListener('change',preview); $('run').addEventListener('click',run);
$('repair').addEventListener('click',()=>{ $('plan').value='order-grain'; preview(); run(); });
$('receipt').addEventListener('click',()=>{
  if (!receipt) return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(receipt,null,2)+'\n'],{type:'application/json'}));
  const a=document.createElement('a'); a.href=url; a.download=`metric-evidence-${receipt.scenarioId}-${receipt.planId}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
});
try {
  // The local classic script is deferred. DOMContentLoaded waits for its evaluation.
  if (document.readyState==='loading') await new Promise(resolve=>document.addEventListener('DOMContentLoaded',resolve,{once:true}));
  SQL=await window.initSqlJs({locateFile:file=>new URL(`vendor/${file}`,import.meta.url).href});
  $('engine-status').textContent='SQLite ready. Data stays in this browser.'; $('run').disabled=false;
} catch { $('engine-status').textContent='The SQL engine could not load. Reload the page or check that vendor/sql-wasm.wasm is available.'; }
