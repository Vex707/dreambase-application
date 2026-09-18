# Metric Reliability Lab Implementation Plan

> **For agentic workers:** Execute inline with tests and a final independent code review. The user explicitly requested continued building and new application apps.

**Goal:** Make the paper's analytical reliability argument executable and prepare the repository for publication.

**Architecture:** A static browser page loads vendored SQLite WebAssembly and shares a deterministic metric module with Node tests. Candidate SQL and a separate JavaScript reference calculation produce inspectable evidence. A CLI writes repeatable fixture evaluations.

**Tech Stack:** JavaScript ES modules, sql.js 1.14.2, Node test runner, static HTML/CSS, existing PDF builder.

**Spec:** docs/metric-lab-design.md

## Global constraints

- Synthetic data only; no live AI claims, invented experience, credentials, or employer assets.
- SQLite is a teaching implementation; Dreambase architecture recommendations remain explicitly proposals.
- Money is integer USD cents. Date intervals are inclusive UTC calendar dates.
- Every accepted candidate must match exact reference rows, unique tenant/order grain, total, and freshness.
- Existing three demos continue to work.

### Task 1: Executable metric engine

- [ ] Pin sql.js, vendor its browser assets and license, and include reproducible copy tooling.
- [ ] Add tests in tests/metric-lab.test.mjs for $250 vs $150 join multiplication, equal $100 orders, tenant leakage, stale/invalid amounts, and an empty period. Run them before implementing runMetricCase(SQL, {scenarioId, planId}).
- [ ] Implement site/lib/metric-lab.mjs with scenario fixtures, fixed query plans, parameter binding, independent reference calculation, and a serializable evidence receipt.
- [ ] Add scripts/evaluate.mjs; npm run evaluate writes output/evaluations/metric-lab.json and exits nonzero for a fixture verdict mismatch.
- [ ] Verify using npm test and npm run evaluate.

### Task 2: Reviewer interface and portfolio

- [ ] Build site/metric-lab.html, metric-lab.mjs, and metric-lab.css with scenario/plan controls, visible SQL, accepted/blocked result, evidence table, input rows, and receipt download.
- [ ] Changing input disables downloads and clears prior acceptance. Use textContent for data and readable error/loading states.
- [ ] Link the new flagship from the portfolio, paper, and case studies; keep existing three workflows accessible.
- [ ] Check desktop, keyboard controls, mobile width, error cases, download, and initial loading.

### Task 3: Application evidence and Git packaging

- [ ] Update the paper with executable fixture results and explicit limitations, then rebuild HTML/PDF and inspect pages.
- [ ] Update README, CI npm ci/tests/evaluation, third-party notices, profile copy, walkthrough script/video, and email draft.
- [ ] Run final tests and independent code review, fix findings, and commit the reviewed work.
- [ ] If authenticated GitHub is available, publish the reviewed source and Pages, verify signed-out links, and finalize the email URLs. Otherwise leave precise account handoff and prepared publishing instructions.
