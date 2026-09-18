# Dreambase application package

## Intended result
A reviewable application package for Michael Reeves: working browser demos, documented code, evidence-based case studies, a researched technical recommendation, tailored resume and profile drafts, a recorded demo, narration script, and complete email draft. The user has authorized building and setting up this package. Publishing depends on identifying the intended account and completing review of the actual artifacts.

## Evidence and boundaries
The referenced chat is background, not proof of implementation. Resume files in Downloads identify Michael Reeves and list sales/operations roles, coursework, and internal tool development. Source was located for a homeowner prospecting tool (Redfin/Zillow version) and a showroom vignette audit tool (Anthropic version). An original standalone customer report labeler and the RentCast/Gemini versions have not been located. Do not describe newly generated work as independently authored historical work, invent measured outcomes, or imply production agent experience. Keep all employer assets, customer records, source resumes, personal contact information, and source-file inventories outside the public demo tree.

## Architecture
Use a dependency-free static browser workbench in `site/` with three demo views and a portfolio introduction. Shared JavaScript modules implement CSV parsing and validation, lead deduplication, label formatting, and model-response validation. The auditor uses explicitly labeled synthetic replay; it must not pretend a live model request happened. Provide editable inputs and visible failure cases. Use no external APIs or embedded credentials in the public demo. Document the gap between live integration and the offline example.

The public folder is the deployable unit. Private application/email/resume drafts live in `private/`, ignored by Git. Public code and case studies carry AI-assisted preparation disclosure. A local Node server serves only `site/`, preventing access to private material. The reviewer should reach demos directly, inspect source, and reproduce tests with Node.

## Visual direction
An engineering workbench beside a compact personal introduction. White and cool slate surfaces, ink #172b46, blue #205fa6, muted blue #e8f0f9, amber #9c5e08 for review states. Segoe UI for controls and headings, Georgia only for the short introductory statement. Generous readable spacing, real tables, visible results, no decorative imagery. Desktop split-pane demos collapse to one column on phones. Keyboard navigation and focus states are required.

## Verification
Node tests cover quoted CSV, escaped quotes, malformed rows, address requirements, deduplication including apartment units, formula-safe CSV export, unknown audit verdicts, missing/duplicate evidence items, and low-confidence routing. Browser verification covers all three flows, print preparation, editable input, errors, and a narrow viewport. Record real interactions in the tested local browser. Inspect PDFs visually and check all application links before calling anything send-ready.

## Delivery status
Local preparation can proceed. GitHub account authentication, preferred resume version, LinkedIn URL, and recording preference await confirmation. Do not send the application email. No new historical achievement is created by this package.
