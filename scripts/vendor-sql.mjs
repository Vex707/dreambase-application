import {mkdir,copyFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
await mkdir(new URL('site/vendor/',root),{recursive:true});
for (const name of ['sql-wasm.js','sql-wasm.wasm']) {
  await copyFile(new URL(`node_modules/sql.js/dist/${name}`,root),new URL(`site/vendor/${name}`,root));
}
await copyFile(new URL('node_modules/sql.js/LICENSE',root),new URL('site/vendor/sql.js-LICENSE.txt',root));
console.log('Vendored sql.js browser runtime and license.');
