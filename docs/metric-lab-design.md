# Metric Reliability Lab

Extend the approved application package with an executable companion to the paper. A reviewer should reproduce a wrong revenue answer, inspect the rows responsible, choose a correct plan, and download the evidence without credentials.

Use SQLite through sql.js 1.14.2 in the browser. It is a small portable teaching fixture, not an implementation of Dreambase's DuckDB architecture. All assets are served locally, with the upstream license. No live model or private data is involved.

The contract is paid order revenue in USD cents, one row per tenant/order, inclusive UTC date boundaries, unknown amounts rejected, and snapshot age no more than 24 hours against a fixed demo evaluation time. A JavaScript reference calculation is independent of the candidate SQL. Checks cover exact row identity and values, grain, reconciliation, amount validity, and freshness. Null amounts must not silently become zero.

Scenarios: one-to-many join, equal-value orders (SUM DISTINCT is not a repair), tenant leakage, stale snapshot, missing amount, and empty period. Plans: order grain, direct line join, distinct amounts, and missing tenant filter. Queries are fixed templates with bound parameters; arbitrary SQL is deliberately outside this demo's scope. Client-side scope checking is an instructional invariant, not an authorization system.

Design: retain navy #172b46, blue #205fa6, paper #f4f7fb, white #ffffff, green #25634b, and red #9f343b. Georgia headlines and system sans-serif controls match the portfolio. The central visual is a side-by-side candidate/reference result with an itemized decision trail. A compact controls column precedes SQL and row evidence. No decorative charts or simulated chat.

Verification: real SQLite unit tests for the six scenarios and unsafe plans, CLI evaluation output, desktop/mobile browser interactions, download and stale-output behavior, paper/PDF review. Publishing requires an authenticated account; no credentials are embedded.
