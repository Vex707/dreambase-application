# Dreambase Application Implementation Plan

**Goal:** Prepare the user's complete, truthful application package and runnable demo evidence.
**Architecture:** Static portfolio and offline demos; shared tested domain functions; private editable application drafts; generated PDFs and a captioned walkthrough assembled from verified browser screenshots.
**Tech stack:** Browser JavaScript, Node test runner and HTTP server, Codex browser controls, Python reportlab/pypdf, FFmpeg.
**Spec:** docs/application-design.md

## Global constraints
- Synthetic data only in public artifacts. No employer photos or source databases.
- Label new code as application-preparation work and disclose AI assistance.
- Replay is visibly labeled, never presented as a live model call.
- Source resume facts can inform drafts; quantify historical results only after confirmation.
- Serve only site/, never the workspace root. Never send the email.

## Task 1: Testable demo logic
- [x] Create site/lib/workflows.mjs, site/data/fixtures.mjs, tests/workflows.test.mjs.
- [x] Write tests first for CSV/label/prospecting/audit behavior described in the spec; observe failure, implement, run Node tests.
- [x] Export parseCSV(text), reviewAddresses(rows), selectProspects(rows, filters), safeCSV(rows), validateAudit(response, checklist).
- [x] Record input/output contracts in docs/demo-contracts.md for UI integration.

## Task 2: Public workbench
- [x] Build site/index.html, site/styles.css, site/app.mjs and scripts/serve.mjs.
- [x] Integrate Task 1 functions into customer label, homeowner, and audit demonstrations.
- [x] Include case studies and recommendations linked to primary sources; explicit limits and provenance.
- [x] Add keyboard-accessible view switching, error messages, CSV download and label print preview.
- [x] Validate actual browser flows and capture screenshots.

## Task 3: Application materials
- [x] Draft private/application-email.md, private/linkedin.md, private/resume.md, github-profile/README.md, and public technical deep-dive.
- [x] Produce a tailored resume PDF and technical-paper PDF; inspect rendered pages.
- [x] Write narration, shot list, and interview preparation tied to demo behavior.
- [x] Separate source-backed claims from user confirmations still required.

## Task 4: Git and delivery
- [x] Initialize local Git; verify staged contents exclude private/ and artifacts.
- [x] Add README, provenance, run/test instructions, limitations, and GitHub publishing instructions.
- [x] Create a captioned walkthrough from verified real browser screenshots; inspect duration and sample frames. Continuous screen recording and personal narration remain for Michael.
- [x] Review the full package, fix defects, and report remaining account/user dependencies precisely.

## Execution rulings
Work in the empty user-selected application folder; existing projects are read-only sources. Routine design and local creation are already authorized by the user. Use bounded parallel agents for domain logic and researched writing as instructed by subagent-driven-development, with root owning integration and review. No second worktree is necessary because this is a new isolated folder.

## Final handoff status
All local preparation steps are complete. Remote publication/profile changes and final application facts remain blocked on account sign-in and user-provided information. No email was sent. See APPLICATION-STATUS.md.
