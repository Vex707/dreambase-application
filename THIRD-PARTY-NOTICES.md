# Third-party software

The Metric Reliability Lab uses [sql.js 1.14.2](https://github.com/sql-js/sql.js), a WebAssembly build of SQLite. Its JavaScript loader, WebAssembly binary, and MIT license are committed in `site/vendor/` so the public demo does not depend on a third-party CDN. SQLite is in the public domain.

Run `npm ci --ignore-scripts` and `npm run vendor` to reproduce these assets from the exact lockfile. See `site/vendor/sql.js-LICENSE.txt` for the upstream license. The remaining original work-sample code is not covered by the upstream license.
