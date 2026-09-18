# Building around practical business workflows

Michael Reeves · Application work samples

These are the problems, decisions, and limitations behind my work samples. I use AI coding assistants and invented records to make the examples reproducible without exposing workplace data. I distinguish new application work from my existing tools, and I do not claim measured commercial impact from these demos.

## Metric Reliability Lab: an answer needs more than valid SQL

**Problem.** A revenue query can execute successfully while double-counting sales. I wanted to turn the metric-grain example in my technical paper into something a reviewer could test.

**What I built for this application.** The lab runs real SQLite queries in the browser. A candidate plan is checked against a versioned revenue contract and a separate JavaScript reference calculation. I show the SQL, bound parameters, contributing rows, individual checks, and a downloadable JSON receipt.

**Decisions.** I store money in integer cents. The contract defines paid orders, workspace scope, inclusive UTC dates, order grain, unknown-amount handling, and snapshot freshness. A direct join returns $250 for orders worth $150; an order-grain plan returns $150. A separate equal-price fixture shows why SUM(DISTINCT amount) is not a general repair: two $100 orders become $100. Stale snapshots and missing amounts stay blocked even under a correct query plan.

**Verification.** The CLI checks nine scenario/plan combinations: four accepted results and five blocked results, matching their expected verdicts. Separate unit tests check the actual totals and failure reasons. These are fixed synthetic cases, not a model-quality benchmark.

**Limits.** I chose SQLite for a portable static demo; the paper recommends retaining Dreambase's documented DuckDB architecture. Fixed plans make each failure inspectable but do not cover arbitrary generated SQL. Browser-side scope checks are not authorization, and a downloadable receipt is not a tamper-proof log. I would add server-side isolation, bounded execution, representative datasets, and broader evaluations before treating this as a production service.

[Try my SQL lab](metric-lab.html).

## Homeowner prospecting: the workflow after retrieval

**Problem.** Property records are not yet an outreach list. A user needs to review addresses, identify duplicates, choose eligible records, and prepare a usable export or mailing sheet.

**My existing project.** My homeowner tool has a JavaScript interface, a Python retrieval endpoint, CSV import/export, editable lead rows, duplicate detection, and label generation. Its README documents Redfin/Zillow source-access problems. My older resume mentions a RentCast integration; the source version used for this case study is the Redfin/Zillow version.

**Demonstration.** The application edition loads synthetic property records and filters them by ZIP and sale-date window. It exposes rejected and duplicate rows and exports the reviewed records. Missing prices remain missing rather than silently becoming zero. It runs without an API key.

**Decision worth discussing.** Retrieval and workflow correctness are separate concerns. An offline fixture makes transformation behavior repeatable, while a live integration still needs tests for authentication, source availability, pagination, rate limits, and schema changes.

**Limits.** This demo does not call a property API, confirm ownership, establish postal deliverability, or prove the original deployed retrieval path works today. No outreach is sent. No conversion, revenue, or time-saved number has been measured for this demo.

## Showroom auditing: evidence before acceptance

**Problem.** Comparing a planned display with a real showroom photograph requires contextual judgment. A model can help identify differences, but a fluent report may omit items, invent labels, or sound certain about ambiguous visual evidence.

**My existing project.** My vignette app assembles a checklist, reference image, and floor photograph. A server-side endpoint calls Anthropic with an environment-held key. The prompt asks for separate reference and floor observations before a verdict. The interface groups findings and allows manual adjustments. My resume mentions an earlier Gemini version; this case study describes the Anthropic version in my source project.

**Demonstration.** The application edition replays explicitly synthetic responses for a fictional checklist. Runtime checks reject missing or duplicate item identifiers, unsupported verdicts, and incomplete evidence. Low-confidence or uncertain judgments require review. The user can edit the response and see the boundary fail.

**Decision worth discussing.** Structural validation is necessary but insufficient. It can prove that every checklist slot has a supported response shape. It cannot prove that a sofa or lamp was correctly recognized. That requires representative images, independent labels, error analysis, and a human review path.

**Limits.** I kept employer photographs and real merchandising checklists out of this public demo, and it makes no live model call. I added the validation layer for this application; it is not an already-deployed feature of my original app. The original proxy alone does not establish hardened authentication, cost controls, or production reliability.

## Customer report to labels: define printable before printing

**Problem.** A customer export can contain quoted commas, blank fields, repeated records, and multiple households in one building. Formatting every row into a label turns data problems into wasted printing.

**Where this came from.** Mailing-label preparation is a workflow I have worked on, including label generation in my homeowner app. I created this standalone browser edition for the application; it is not a publication of the original customer-report labeler.

**Demonstration.** A user can edit a synthetic CSV, review accepted records and rejection reasons, then prepare a 30-up label sheet. Duplicate detection preserves apartment information. A starting-position control supports a partially used label sheet.

**Decision worth discussing.** The acceptance rule is explicit and testable: a name and sufficiently complete address fields are required before printing. CSV syntax errors stop the import with an explanation. Rejected records remain visible for correction rather than disappearing without a trace.

**Limits.** Completeness checks are not address verification. The parser accepts a documented CSV schema, not arbitrary proprietary report layouts. Physical printer alignment requires calibration on the user's hardware. This demonstration is not evidence that a particular mailing campaign or regional rollout occurred.

## What ties the examples together

I start with an operational decision: what can safely proceed, what should be rejected, and what needs a person? That is the perspective I want to develop further in AI-native analytics. My demos offer concrete behavior to inspect; my technical paper describes recommendations and experiments beyond what they implement.

## Verification and attribution

Run `npm ci --ignore-scripts`, `npm test`, and `npm run evaluate` to reproduce the checks. My source tree separates business rules, synthetic fixtures, and presentation. I used AI assistance for implementation, documentation, research, and demo preparation; the provenance page explains the scope.
