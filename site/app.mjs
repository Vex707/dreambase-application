import { parseCSV, reviewAddresses, selectProspects, safeCSV, validateAudit } from './lib/workflows.mjs';
import { CUSTOMER_CSV, PROPERTY_ROWS, AUDIT_CHECKLIST, AUDIT_RESPONSES } from './data/fixtures.mjs';

const $ = id => document.getElementById(id);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let printable = [];
let exportRows = [];

function feedback(id, message, error = false) {
  $(id).textContent = message;
  $(id).classList.toggle('error', error);
}
function metrics(items) {
  return `<div class="metrics">${items.map(([n,label]) => `<div class="metric"><strong>${n}</strong><span>${escape(label)}</span></div>`).join('')}</div>`;
}
function table(headings, rows) {
  return `<div class="table-scroll"><table><thead><tr>${headings.map(h=>`<th scope="col">${escape(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(cells=>`<tr>${cells.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function address(row) { return [row?.street, [row?.city,row?.state,row?.zip].filter(Boolean).join(' ')].filter(Boolean).join(', '); }

for (const button of document.querySelectorAll('[data-view]')) {
  button.addEventListener('click', () => {
    const name = button.dataset.view;
    document.querySelectorAll('.view').forEach(view => { view.hidden = view.id !== `view-${name}`; });
    document.querySelectorAll('[data-view]').forEach(nav => {
      nav.classList.toggle('active',nav === button);
      nav.setAttribute('aria-pressed',String(nav === button));
    });
  });
}

function invalidateLabels() {
  printable = [];
  $('print-labels').disabled = true;
  $('print-area').replaceChildren();
  $('labels-results').replaceChildren();
  feedback('labels-feedback','Input changed. Review records again before printing.');
}
function reviewLabels() {
  printable = [];
  $('print-labels').disabled = true;
  $('print-area').replaceChildren();
  $('labels-results').replaceChildren();
  try {
    const rows = parseCSV($('customer-csv').value);
    if (!rows.length) throw new Error('No customer records found below the header.');
    const {accepted,rejected,duplicates} = reviewAddresses(rows);
    printable = accepted.map(entry=>entry.row);
    $('print-labels').disabled = !printable.length;
    feedback('labels-feedback',`${rows.length} records reviewed. ${accepted.length} complete addresses are available for printing.`);
    const acceptedRows = accepted.map(({row}) => [escape(row.name),escape(address(row)), '<span class="pill">Complete</span>']);
    const issues = [...rejected,...duplicates].map(({row,reason})=>[escape(row?.name || '(missing name)'),escape(address(row)),escape(reason)]);
    $('labels-results').innerHTML = metrics([[accepted.length,'Complete'],[rejected.length,'Needs correction'],[duplicates.length,'Duplicates']])
      + (acceptedRows.length ? table(['Recipient','Mailing address','Status'],acceptedRows) : '<p>No printable records. Correct the input and review it again.</p>')
      + (issues.length ? `<h4>Held back from printing</h4>${table(['Recipient','Address','Reason'],issues)}` : '');
  } catch(error) { feedback('labels-feedback',error.message,true); }
}
$('customer-csv').value = CUSTOMER_CSV;
$('customer-csv').addEventListener('input',invalidateLabels);
$('review-labels').addEventListener('click',reviewLabels);
$('reset-labels').addEventListener('click',()=>{ $('customer-csv').value=CUSTOMER_CSV; invalidateLabels(); feedback('labels-feedback','Sample loaded. Review records to see the results.'); });
$('print-labels').addEventListener('click',()=>{
  const start = Number($('start-slot').value);
  if (!Number.isInteger(start) || start < 1 || start > 30) { feedback('labels-feedback','First label position must be a whole number from 1 to 30.',true); return; }
  if (!printable.length) return;
  const cells = [...Array(start-1).fill(null),...printable];
  $('print-area').replaceChildren();
  for (let i=0;i<cells.length;i+=30) {
    const sheet=document.createElement('div'); sheet.className='label-sheet';
    for(const row of cells.slice(i,i+30)) {
      const label=document.createElement('div'); label.className='mail-label';
      if(row) label.textContent = `${row.name.trim()}\n${row.street.trim()}\n${row.city.trim()}, ${row.state.trim().toUpperCase()} ${row.zip.trim()}`;
      sheet.append(label);
    }
    $('print-area').append(sheet);
  }
  document.body.classList.add('printing-labels');
  window.print();
});
window.addEventListener('afterprint',()=>document.body.classList.remove('printing-labels'));

function invalidateProspects() {
  exportRows=[]; $('export-prospects').disabled=true; $('prospects-results').replaceChildren();
  feedback('prospects-feedback','Filters changed. Review properties again before exporting.');
}
function reviewProspects() {
  exportRows=[]; $('export-prospects').disabled=true;
  const result = selectProspects(PROPERTY_ROWS,{zip:$('prospect-zip').value,maxDays:$('prospect-days').value,asOf:$('prospect-asof').value});
  const hasError=result.notices.some(n=>n.type==='error');
  feedback('prospects-feedback',result.notices.map(n=>n.message).join(' '),hasError);
  if(hasError) { $('prospects-results').replaceChildren(); return; }
  exportRows=result.selected.map(item=>item.row);
  $('export-prospects').disabled=!exportRows.length;
  $('prospects-results').innerHTML=metrics([[result.selected.length,'Eligible properties'],[result.excluded.length,'Excluded'],[PROPERTY_ROWS.length,'Source records']])
    + (result.selected.length ? table(['Address','Sale date','Price','Age'],result.selected.map(({row,daysSinceActivity,priceDisplay})=>[escape(address(row)),escape(row.activityDate),escape(priceDisplay),`${daysSinceActivity} days`])) : '<p>No records match these filters.</p>')
    + (result.excluded.length ? `<details><summary>Inspect ${result.excluded.length} excluded records</summary>${table(['Address','Reason'],result.excluded.map(({row,reason})=>[escape(address(row)),escape(reason)]))}</details>` : '');
}
for(const id of ['prospect-zip','prospect-days','prospect-asof']) $(id).addEventListener('input',invalidateProspects);
$('filter-prospects').addEventListener('click',reviewProspects);
$('export-prospects').addEventListener('click',()=>{
  if(!exportRows.length) return;
  const url=URL.createObjectURL(new Blob([safeCSV(exportRows)],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a'); link.href=url; link.download='synthetic-reviewed-properties.csv'; link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  feedback('prospects-feedback',`${exportRows.length} synthetic properties exported. No outreach was sent.`);
});

for(const item of AUDIT_CHECKLIST) { const li=document.createElement('li'); li.textContent=item.label; $('audit-checklist').append(li); }
function loadAudit(name) {
  $('audit-json').value=JSON.stringify(AUDIT_RESPONSES[name],null,2);
  $('audit-results').replaceChildren();
  feedback('audit-feedback',`${name === 'bad' ? 'Invalid' : name === 'low' ? 'Uncertain' : 'Valid'} synthetic example loaded. Validate it to inspect the result.`);
}
for(const key of ['good','low','bad']) $(`audit-${key}`).addEventListener('click',()=>loadAudit(key));
$('audit-json').addEventListener('input',()=>{ $('audit-results').replaceChildren(); feedback('audit-feedback','Response changed. Validate again to refresh the review.'); });
$('validate-audit').addEventListener('click',()=>{
  $('audit-results').replaceChildren();
  try {
    const result=validateAudit(JSON.parse($('audit-json').value),AUDIT_CHECKLIST);
    feedback('audit-feedback',result.valid ? 'Response contract passed. These checks do not establish whether the visual judgment is true.' : `Response rejected. ${result.errors.length} contract issues must be corrected before acceptance.`,!result.valid);
    $('audit-results').innerHTML=metrics([[result.counts.correct,'Reported correct'],[result.counts.needsReview,'Needs review'],[result.counts.total,'Checklist items']])
      + (result.errors.length ? `<ul>${result.errors.map(e=>`<li>${escape(e.message)}</li>`).join('')}</ul>` : '')
      + table(['Checklist item','Evidence','Review'],result.results.map(item=>[
        escape(item.label),escape(item.evidence || 'No accepted evidence'),
        `<span class="pill ${item.disposition === 'correct' ? '' : 'review'}">${item.disposition === 'correct' ? 'Reported correct' : 'Needs review'}</span><br>${escape(item.reason)}`
      ]));
  } catch(error) { feedback('audit-feedback',`Cannot validate this JSON: ${error.message}`,true); }
});
loadAudit('good');
