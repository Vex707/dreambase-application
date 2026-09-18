# Four-minute walkthrough

This is a recording script for Michael, not a claim that a voice recording has already been made. The accompanying three-minute video is a captioned sequence of verified browser screenshots using synthetic data; it is not a continuous screen recording and has no voiceover. Replace any wording you cannot personally explain. Speak naturally rather than reading verbatim.

## 0:00-0:25 | Introduction
Screen: portfolio introduction, then move to the demo workbench.

“Hi, I'm Michael Reeves. My background is in sales and operations. I started building tools because I kept running into tasks where the information existed, but getting it into a useful form took too much manual work. These are small, synthetic-data demo editions prepared for this application. I use AI coding tools extensively, and I've documented where the original tools end and the application work begins.”

## 0:25-1:20 | Customer report to labels
Screen: Customer report to labels. Load sample, review records, scroll through accepted and rejected rows. Point to an incomplete address and duplicate. Change one missing field and rerun if rehearsed.

“This example turns a customer export into a mailing workflow. The interesting part is the decision before printing: which records are complete enough to continue? Quoted CSV fields need proper parsing. An incomplete address needs a visible reason. Duplicate handling also has to preserve apartment units so we don't merge different households. These checks establish completeness; they do not prove that an address is deliverable. The original standalone customer-report tool wasn't imported, so this demo is newly prepared work.”

Screen: click Print labels only during a live recording if ready to show the print dialog. Print preview can be recorded separately.

## 1:20-2:05 | Homeowner prospecting
Screen: switch to Homeowner prospecting, review properties, change the date window, export CSV.

“The next workflow begins with property records. The original application has data retrieval, review, and mailing features. The version we inspected also documents a real limitation: upstream sources can block requests. This demo uses fixtures, so you can evaluate the filtering and export without an API key. It keeps missing values visible and makes duplicates and excluded records inspectable. The demo doesn't claim that live retrieval is reliable.”

## 2:05-3:10 | AI audit review
Screen: switch to AI audit review. Load Valid example, validate; load Uncertain example, validate; load Invalid response, validate.

“The original showroom audit compares a reference image with a floor photograph against a checklist. Here I'm isolating another part of that workflow: what we accept from the model. This is a synthetic response replay, not a live model call. A response needs the expected item identifiers, supported verdicts, and evidence for each item. Missing or repeated items fail validation. Uncertain findings need a person. Passing a JSON contract does not prove the model correctly understood the image. I would evaluate that separately against labeled examples.”

## 3:10-4:00 | Connection to Dreambase
Screen: technical perspective, worked metric example, then case-study limitations.

“That's the connection I see to Dreambase. A convincing explanation can still sit on top of the wrong number. My paper argues for explicit metric definitions, traceable data, bounded agent workflows, and deterministic checks before model-based critique. For example, joining an order to several line items can multiply the order total. The right test checks the meaning of the metric, not just whether the SQL runs. I'm still early in my engineering development, but this is the kind of problem I want to learn to solve well. I'd welcome the chance to discuss the work with you.”

## Recording setup
- Open the local demo at 127.0.0.1:4173 in a clean browser. Use 1920x1080 or 1440x900, a visible cursor, and no personal tabs.
- Rehearse once. Keep the complete video around 3-5 minutes; pauses are fine.
- Record your actual voice. The supplied screen-only video can serve as a reference or supplementary demo; it does not replace your own explanation.
- Show the no-model-call badge and at least one rejected response.
- Review audio, legibility, and all claims before uploading as an unlisted video. Add its final URL to the email and portfolio.
