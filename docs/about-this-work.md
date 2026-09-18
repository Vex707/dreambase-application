# How I prepared this work

## Existing work and application editions

I build practical tools alongside my sales and operations work. For this application, I used my existing homeowner prospecting and showroom audit projects as the starting point for smaller, reproducible examples. I kept workplace data and assets out of this public portfolio.

I prepared the customer-report label demo for this application; the original standalone source is not included. The homeowner view uses synthetic property records. The audit view validates fabricated model output and makes no model call. I want a reviewer to know exactly what is running.

I also added the Metric Reliability Lab specifically for this application. It executes fixed SQL plans against invented sales data using SQLite in the browser. Its independent reference calculation and acceptance checks are executable work samples. It is not a live agent or an implementation of Dreambase's internal systems.

## AI assistance

My [Web Apps with Michael section](https://vex707.github.io/dreambase-application/my-business.html) describes my side business and private commercial sales workflow. The public business site and demo builds are available to explore. The private workflow's capabilities are described at a high level; its source code, prompts, configuration, and customer records are not part of this portfolio.

I use AI coding assistants extensively. They helped with implementation, tests, research, writing, and demo preparation. My background is in business operations, and I am developing my software engineering skills. I have not operated complex agent systems in production; I welcome a discussion of how I use these tools and the decisions behind this work.

## Data and limitations

The public examples contain invented records and checklist items. No real customer export, source database, employer image library, credentials, or private resume is included. All demonstration processing happens locally in the browser. No form submits information and no outreach is sent.

My technical paper is a proposal based on public documentation. I have no access to Dreambase's internal systems. I distinguish the lab's measured synthetic-fixture outcomes from proposed production evaluation gates; neither establishes live model accuracy.

## Reproduce the examples

Use Node.js 20 or later. Run `npm ci --ignore-scripts`, `npm test`, and `npm run evaluate` for the domain and SQLite checks. Run `npm start` for the browser workbench. The browser assets are committed, so viewing the demos requires no provider key or package installation. The server exposes only the `site/` directory.

Refer to the repository README for provenance, verification, and publication status. The original internal tools are not altered by this application package.
