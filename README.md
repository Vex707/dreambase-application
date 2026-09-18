# Michael Reeves — Application workbench

Synthetic-data demonstrations of practical business workflows, prepared for a Dreambase application. The package includes case studies, a technical perspective, tests, and a walkthrough script.

**Status:** local application preparation. The public demos are new AI-assisted work samples based on inspected project workflows. They are not production integrations. An audit replay is visibly labeled and makes no model call.

## Run

Requires Node.js 20 or later. No `npm install`, API key, or database is needed.

```powershell
npm test
npm start
```

Open http://127.0.0.1:4173. The server exposes only `site/`, not the workspace root. Stop it with Ctrl+C. The application also works on a static host that supports JavaScript modules.

## Demonstrations

| Workflow | What runs | What is not demonstrated |
|---|---|---|
| Customer report to labels | CSV parsing, address completeness, duplicates, printable 30-up layout | Postal deliverability, arbitrary report formats, physical printer calibration |
| Homeowner prospecting | Synthetic record filtering, date windows, deduplication, safe CSV export | Live data retrieval or provider availability |
| AI audit review | Runtime contract validation, rejection, review routing | A model call, image recognition accuracy, production agent orchestration |

The original standalone report labeler was not located. Its demo is a new reconstruction. The inspected homeowner version uses Redfin/Zillow; the inspected audit version uses Anthropic. Older resume references to RentCast/Gemini describe different versions and are not silently substituted here.

## Read

- [Case studies](docs/case-studies.md)
- [Technical perspective](docs/technical-deep-dive.md)
- [Provenance and AI assistance](docs/about-this-work.md)
- [Walkthrough script and recording instructions](docs/walkthrough-script.md)
- [Interview preparation](docs/interview-preparation.md)
- [Publishing instructions](docs/publishing.md)

## Structure

- `site/`: public portfolio and runnable browser workbench.
- `site/lib/`: testable deterministic business rules.
- `site/data/`: invented fixtures, not customer or employer data.
- `tests/`: Node domain tests.
- `scripts/`: local preview and artifact preparation.
- `docs/`: case studies, proposal, preparation and verification notes.
- `github-profile/`: proposed profile README; not automatically installed.
- `private/`: ignored email, resume, profile drafts and source notes.
- `output/`: ignored generated PDFs and video.

## Authorship and evidence

AI tools assisted code, tests, research, writing, and application preparation. Michael should be able to explain his contribution and every claim before submitting. The workbench does not manufacture historical achievements or imply senior engineering experience. Existing workplace files remain unchanged, and no internal images or data were copied into this public tree.

## Rebuild written pages

Generated HTML is committed so the demos require no tooling installation. `scripts/build-pages.mjs` uses the `marked` package only for authoring. Set `CODEX_NODE_MODULES` to the bundled runtime's package path in Codex, or install `marked` in a separate authoring environment, then run `node scripts/build-pages.mjs`.

## Scope

This is an application work sample, with a local-only preview server. It does not include authentication, provider billing controls, persistent customer storage, mail sending, or production deployment claims. Do not add real customer data to a public deployment.
