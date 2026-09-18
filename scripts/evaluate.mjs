import initSqlJs from 'sql.js';
import {mkdir,writeFile} from 'node:fs/promises';
import {runMetricCase} from '../site/lib/metric-lab.mjs';
const SQL=await initSqlJs();
const cases=[
  ['join-fanout','line-join','blocked'],['join-fanout','order-grain','accepted'],
  ['equal-amounts','distinct-amounts','blocked'],['equal-amounts','order-grain','accepted'],
  ['tenant-leak','unscoped','blocked'],['tenant-leak','order-grain','accepted'],
  ['stale-snapshot','order-grain','blocked'],['missing-amount','order-grain','blocked'],
  ['empty-period','order-grain','accepted'],
];
const results=cases.map(([scenarioId,planId,expected])=>{
  const receipt=runMetricCase(SQL,{scenarioId,planId});
  return {expected,passed:receipt.status===expected,receipt};
});
await mkdir(new URL('../output/evaluations/',import.meta.url),{recursive:true});
await writeFile(new URL('../output/evaluations/metric-lab.json',import.meta.url),JSON.stringify({suite:'metric-lab-v1',results},null,2)+'\n');
for (const r of results) console.log(`${r.passed?'PASS':'FAIL'} ${r.receipt.scenarioId} / ${r.receipt.planId}: ${r.receipt.status}`);
console.log(`${results.filter(r=>r.passed).length}/${results.length} fixed fixture verdicts match expectations. Not a model benchmark.`);
if (results.some(r=>!r.passed)) process.exitCode=1;
