# My four-minute walkthrough

The supplied video is a three-minute captioned sequence of verified browser screenshots, with no voiceover. This script is for my own recording. I should use wording I can explain naturally, show the actual interactions, and keep the disclosure that the data is synthetic.

## 0:00-0:25 | Why I built this

Screen: portfolio, then open Metric Reliability Lab.

“Hi, I'm Michael Reeves. My background is in sales and operations. I started building tools around repetitive tasks and information that was hard to turn into a useful decision. For this application, I wanted to make one idea concrete: a convincing analytical answer still needs evidence. I use AI coding assistants extensively, and I've documented that assistance and the scope of each demo.”

## 0:25-1:30 | A valid query, the wrong answer

Screen: default join scenario. Run SQL and checks; show $250 against $150, then open contributing rows and SQL. Choose Try the order-grain plan.

“These two paid orders total $150. The first order has two line items. If I join the order to every line and then sum its full value, I count that first order twice. The query runs, but its answer is wrong. This lab runs actual SQLite in the browser. A separate reference calculation applies the metric definition, and the checks compare the contributing records, grain, and total. The rejected result is still visible so I can explain it. Switching to the order-grain plan preserves one record per order and passes the checks.”

## 1:30-2:15 | Why the obvious repair is insufficient

Screen: select Two orders, the same amount. Run; show $100 versus $200. Then select Correct math, old data and run.

“SUM DISTINCT is tempting, but it removes equal amounts, not duplicate orders. If two legitimate orders are each $100, it returns only $100. That's why I care about the meaning of a metric, not just its numeric total. Here is a different failure: the math is right, but the snapshot is too old for the freshness contract. A query change cannot repair stale source data. Each run has a downloadable evidence receipt. This is a fixed synthetic fixture, not proof that every query is correct.”

## 2:15-3:10 | The business workflows behind my interest

Screen: portfolio workflow demos. Review labels; briefly show homeowner filtering and audit Invalid response.

“My other examples come from practical workflows: preparing labels, reviewing property records, and checking showroom audit output. I made small public editions so you can inspect them without customer data or employer images. The label tool rejects incomplete records and keeps apartment units distinct. The prospecting demo separates data preparation from live retrieval, which has its own availability problems. The audit demo is a synthetic response replay; its contract checks can't prove image recognition is correct, but they can reject missing or invented checklist identifiers.”

## 3:10-4:00 | What I would explore at Dreambase

Screen: technical paper, measured fixture results, and source repository.

“My paper recommends keeping Dreambase's documented durable orchestration and strengthening the contracts around context, metrics, execution, and acceptance. I used SQLite here for a portable work sample; I am not proposing it as a replacement for your DuckDB architecture. My next step would be a bounded loop with persisted state and representative evaluations, including failures and recovery. I'm still developing as an engineer. I would welcome a discussion of the work, the tradeoffs, and where my operational perspective could contribute.”

## Recording checklist

- Use a clean browser and a readable desktop resolution. Close unrelated personal tabs.
- Rehearse the six SQL scenarios and explain why each check exists.
- Record my actual voice. Do not present the silent screenshot video as a narrated recording.
- Show at least one failure and one repair, then keep the total near four minutes.
- Check audio, legibility, links, and factual claims before uploading.
