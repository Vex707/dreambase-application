# Verification record

Checked September 17, 2026 in the local application workspace.

## Automated behavior

`npm test`: **18 passed, 0 failed** on Node v24.12.0. Tests cover quoted and malformed CSV, complete/invalid/duplicate addresses, apartment preservation, date windows, missing versus zero prices, formula-safe CSV export, exact audit identifiers and enum validation, and review routing.

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

## Independent review

Three findings were fixed and re-reviewed: root URL containment check, dedupe-before-date filtering, and globally hidden print content. Written-page print styling was verified by code inspection, not a physical print. Private paths and encoded traversal requests return 404. User-controlled text is escaped before rendering.

## Artifacts

- Resume PDF: one page, visually inspected after final layout adjustment.
- Technical perspective PDF: three pages, every page visually inspected.
- Captioned screenshot walkthrough: H.264, 1920x1080, approximately 180 seconds, no audio stream. It is assembled from actual verified browser screenshots, not a continuous interaction recording or Michael's narration.

## Not verified or completed

Live property retrieval, live LLM calls, geocoding, production deployment, real print alignment, employer adoption metrics, and production agent experience are not established by these tests. GitHub authentication, remote repository creation/push, profile changes, public deployment, LinkedIn URL, personal factual review, and Michael's own narration remain outstanding. No application email was sent.
