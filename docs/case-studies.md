# Building around practical business workflows

Michael Reeves · Application work samples

These case studies connect existing internal-tool projects to small, reproducible demos. The public demos were prepared with AI coding assistance for this application and use invented records. They are not a claim of independent authorship, measured commercial impact, or production agent-system experience.

## Homeowner prospecting: the workflow after retrieval

**Problem.** Property records are not yet an outreach list. A user needs to review addresses, identify duplicates, choose eligible records, and prepare a usable export or mailing sheet.

**Existing project evidence.** The inspected project contains a JavaScript interface, a Python retrieval endpoint, CSV import/export, editable lead rows, duplicate detection, and label-generation code. Its README documents Redfin/Zillow source-access problems. An older resume mentions a RentCast integration; that version was not the code inspected for this package.

**Demonstration.** The application edition loads synthetic property records and filters them by ZIP and sale-date window. It exposes rejected and duplicate rows and exports the reviewed records. Missing prices remain missing rather than silently becoming zero. It runs without an API key.

**Decision worth discussing.** Retrieval and workflow correctness are separate concerns. An offline fixture makes transformation behavior repeatable, while a live integration still needs tests for authentication, source availability, pagination, rate limits, and schema changes.

**Limits.** This demo does not call a property API, confirm ownership, establish postal deliverability, or prove the original deployed retrieval path works today. No outreach is sent. No conversion, revenue, or time-saved number has been measured for this demo.

## Showroom auditing: evidence before acceptance

**Problem.** Comparing a planned display with a real showroom photograph requires contextual judgment. A model can help identify differences, but a fluent report may omit items, invent labels, or sound certain about ambiguous visual evidence.

**Existing project evidence.** The inspected vignette app assembles a checklist, reference image, and floor photograph. A server-side endpoint calls Anthropic with an environment-held key. The prompt asks for separate reference and floor observations before a verdict. The interface groups findings and lets the user adjust them. The resume mentions an earlier Gemini version; this case study describes the inspected Anthropic version.

**Demonstration.** The application edition replays explicitly synthetic responses for a fictional checklist. Runtime checks reject missing or duplicate item identifiers, unsupported verdicts, and incomplete evidence. Low-confidence or uncertain judgments require review. The user can edit the response and see the boundary fail.

**Decision worth discussing.** Structural validation is necessary but insufficient. It can prove that every checklist slot has a supported response shape. It cannot prove that a sofa or lamp was correctly recognized. That requires representative images, independent labels, error analysis, and a human review path.

**Limits.** This public demo contains no employer photographs, real merchandising checklist, or live model call. The validation layer is new application-preparation work; it should not be described as an already-deployed feature of the original app. The original proxy's presence does not establish hardened authentication, cost controls, or production reliability.

## Customer report to labels: define printable before printing

**Problem.** A customer export can contain quoted commas, blank fields, repeated records, and multiple households in one building. Formatting every row into a label turns data problems into wasted printing.

**Provenance.** The source resume and prior conversation describe a label workflow, and the inspected homeowner app includes label-generation code. The original standalone customer-report labeler was not found. This particular browser demo was newly created for the application, using that workflow as a brief.

**Demonstration.** A user can edit a synthetic CSV, review accepted records and rejection reasons, then prepare a 30-up label sheet. Duplicate detection preserves apartment information. A starting-position control supports a partially used label sheet.

**Decision worth discussing.** The acceptance rule is explicit and testable: a name and sufficiently complete address fields are required before printing. CSV syntax errors stop the import with an explanation. Rejected records remain visible for correction rather than disappearing without a trace.

**Limits.** Completeness checks are not address verification. The parser accepts a documented CSV schema, not arbitrary proprietary report layouts. Physical printer alignment requires calibration on the user's hardware. This demonstration is not evidence that a particular mailing campaign or regional rollout occurred.

## What ties the examples together

The work begins with an operational decision: what can safely proceed, what should be rejected, and what needs a person? That is the perspective I want to develop further in AI-native analytics. The demos offer concrete behavior to inspect; the technical paper describes recommendations and experiments beyond what they implement.

## Verification and attribution

Run `npm test` to execute the domain tests. See the repository's verification report for actual browser checks. The source tree separates business rules, synthetic fixtures, and presentation. AI assisted implementation, documentation, research, and demo preparation. Michael should review these materials and be able to explain the decisions before presenting them as his application.
