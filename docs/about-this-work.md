# How this work was prepared

## Existing work and application editions

Michael's resume describes practical software projects developed alongside sales and operations work. For this application, local source files were inspected for the homeowner prospecting and showroom audit tools. The public workbench is a newly prepared, smaller demonstration of related workflows; it is not a wholesale publication of workplace systems.

The customer-report labeler is a reconstruction for the application because its original standalone source was not located. The homeowner view uses synthetic property records. The audit view validates fabricated model output and makes no model call. Those labels are intentional: a reviewer should know exactly what is running.

## AI assistance

AI coding tools assisted the preparation of the demos, tests, documents, research, and recording workflow. The package does not claim that Michael hand-wrote all of the code or has operated complex agent systems in production. His contribution and understanding should be discussed directly rather than inferred from the polish of an artifact.

## Data and limitations

The public examples contain invented records and checklist items. No real customer export, source database, employer image library, credentials, or private resume is included. All demonstration processing happens locally in the browser. No form submits information and no outreach is sent.

The technical paper is a researched proposal based on public documentation. It is not an account of access to Dreambase's internal systems. Evaluation targets are illustrative, not measured benchmark results.

## Reproduce the examples

Use Node.js 20 or later. Run `npm test` for domain checks and `npm start` for the browser workbench. No package installation or provider key is required for these demos. The server exposes only the `site/` directory.

Refer to the repository README for provenance, verification, and publication status. The original internal tools are not altered by this application package.
