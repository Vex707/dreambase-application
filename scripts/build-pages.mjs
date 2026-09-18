import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

// This authoring helper uses the desktop's bundled markdown parser. The built
// HTML and public demos use committed assets, including the vendored SQL engine.
const require = createRequire(import.meta.url);
let marked;
try { ({marked} = require('marked')); }
catch {
  const bundle = process.env.CODEX_NODE_MODULES;
  if (!bundle) throw new Error('Set CODEX_NODE_MODULES to the bundled Node package directory, or install marked for authoring. The demos do not need it.');
  ({marked} = await import(path.join(bundle, 'marked/lib/marked.esm.js').replaceAll('\\','/').replace(/^([A-Za-z]):/, 'file:///$1:')));
}
const documents = [
  ['docs/my-business.md', 'my-business.html', 'My business'],
  ['docs/case-studies.md', 'case-studies.html', 'Case studies'],
  ['docs/technical-deep-dive.md', 'technical.html', 'Technical perspective'],
  ['docs/about-this-work.md', 'about-this-work.html', 'Provenance & AI assistance']
];
for (const [source, target, title] of documents) {
  const md = await readFile(new URL('../'+source, import.meta.url),'utf8');
  const download = target === 'technical.html' ? '<p><a href="downloads/technical-perspective.pdf">Download my technical paper</a> · <a href="metric-lab.html">Try the executable SQL lab</a></p>' : '';
  const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} | Michael Reeves</title><link rel="stylesheet" href="styles.css"></head><body><header class="masthead"><a class="identity" href="index.html">Michael Reeves<span>Business operations & software builder</span></a><nav aria-label="Main"><a href="my-business.html">My business</a><a href="index.html#workbench">Demos</a><a href="case-studies.html">Case studies</a><a href="technical.html">Technical paper</a></nav></header><main><article class="article">${download}${marked.parse(md)}</article></main><footer><a href="index.html">Back to the workbench</a><a href="about-this-work.html">Provenance & AI assistance</a></footer></body></html>`;
  await writeFile(new URL('../site/'+target, import.meta.url),html);
  console.log(target);
}
