# Verification record

Checked September 17, 2026 in the local application workspace.

## Automated behavior

`npm test`: **29 passed, 0 failed** on Node v24.12.0. Tests cover quoted and malformed CSV, complete/invalid/duplicate addresses, apartment preservation, date windows, missing versus zero prices, formula-safe CSV export, exact audit identifiers and enum validation, and review routing. Eleven tests exercise the actual SQLite engine and metric-contract decisions.

`npm run evaluate`: **9/9 expected fixture verdicts matched**: four accepted and five blocked. The JSON report includes the actual SQL, parameters, rows, and checks. This fixed synthetic suite is not a live-model benchmark.

A review-found regression is included: an old record at an address must not hide a newer eligible record. Deduplication now occurs after eligibility filtering.

## Browser verification

Verified in the Codex browser against the local server:

- `/` opens the workbench; all three demo views and written pages load.
- Customer fixture: 6 input rows; 4 complete, 1 incomplete, 1 duplicate.
- Malformed quoted CSV produces an actionable error and disables printing.
- First label position 30 produces two sheet containers with four nonblank labels. No physical printer calibration or actual paper print was performed.
- Homeowner fixture: 4 selected, 5 excluded, 9 source records. Two apartments stay distinct; missing price and $0 remain different.
- CSV download action completes; editing filters disables export until reviewed again. Invalid ZIP produces an error.
- Valid audit fixture passes the contract. Uncertain fixture has 1 reported correct and 2 requiring review. Invalid fixture is rejected and all 3 items require review.
- Malformed JSON produces a visible error. Browser error/warning log was empty for the tested flows.
- Mobile viewport: document client width and scroll width both 375 pixels, with no page-level horizontal overflow. Screenshot inspected.
- Metric Reliability Lab: the real browser SQLite runtime loads; the line join returns $250 against $150, the order-grain repair is accepted at $150, DISTINCT collapses equal-price orders to $100 against $200, a 72-hour snapshot is blocked despite a correct total, missing paid amounts stay unknown/blocked, and an empty period is accepted at $0. Changing selections clears old results and disables the receipt download. Evidence download action completes. The lab has no page-level overflow at a 390-pixel viewport (375-pixel document width).

## Independent review

Three findings were fixed and re-reviewed: root URL containment check, dedupe-before-date filtering, and globally hidden print content. Written-page print styling was verified by code inspection, not a physical print. Private paths and encoded traversal requests return 404. User-controlled text is escaped before rendering.

The added SQL lab received an independent static code review with no actionable findings. A separate content review confirmed the reported totals and acceptance outcomes; two editorial voice issues were corrected to first person.

## Artifacts

- Resume PDF: one page, visually inspected after final layout adjustment.
- Technical perspective PDF: four pages, every page visually inspected, including the measured synthetic results.
- Captioned screenshot walkthrough: H.264, 1920x1080, approximately 180 seconds, no audio stream. It is assembled from actual verified browser screenshots, not a continuous interaction recording or Michael's narration.

## Public publication

The application repository and profile README are public under Vex707. GitHub's verification and Pages workflows completed successfully. The deployed root, SQL lab, case studies, technical page, provenance page, walkthrough, PDF, video, and WebAssembly asset return HTTP 200. Signed-out browser checks confirmed label review, homeowner filtering/export, audit rejection, and the SQL join failure on the public domain. The deployment is a static work-sample site, not a production data service.

## Not verified or completed

Live property retrieval, live LLM calls, geocoding, production authorization, real print alignment, employer adoption metrics, and production agent experience are not established by these tests. Personal factual review and my own narration remain separate from technical verification. Publication status is recorded in APPLICATION-STATUS.md. No application email was sent.
