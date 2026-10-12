# Document-access and implementation audit

Audit packaged 12 October 2026. Source fetches began 10 October; latest repository
references checked before commit. This audit distinguishes file access,
content reading, scan verification, implementation, executed tests and deployment.

## Five required resources

| Resource | Actual access | Reading / evidence |
| --- | --- | --- |
| [Master Specification v2](https://docs.google.com/document/d/16U1Rs7_o1CjWGCzHBDjXCB2-hjpxapimrF27x4Qhebk/edit) | Authorized Drive text fetch succeeded, 42,084 characters | All 24 sections read; full text preserved in [sources/SPECIFICATION-V2.md](sources/SPECIFICATION-V2.md) |
| [Original PDF](https://drive.google.com/file/d/1jWooZQ-arFVtNDHOCoqalcsBShRdxewb/view) | Authorized Drive raw download materialized locally, 5,272,295 bytes | 138 pages; every page successfully rendered with PyMuPDF. SHA-256 `aae7f2aae38b281177fa0eecf2136b8bd99e18b07ce229c41396cfc37edaadbe`, identical to user attachment. All pages are accessible. Full reading, translation and line-by-line verification are **not complete**. |
| [Main source ledger](https://github.com/admytruk79-netizen/Ascend-focus/blob/main/docs/ATKINSON-SOURCE-LEDGER.md) | GitHub fetch succeeded | Main's Lesson XII addendum reconciled into the expanded branch ledger; historical page references retained. Main's old statement that PDF access is unavailable is superseded by the actual download. |
| [Repository](https://github.com/admytruk79-netizen/Ascend-focus) | GitHub API tree/files and local source files accessible | Main first fetched: `59749e46d45540b794bf988d4d8c30eaf9be5e7e`; refreshed to `47c4e7c0187fee123f8e2b030385efeaf0f54a54`; implementation remains in draft PR #1, previously `6114fe8c1aadf26875d5ee53cc58ac9aa7768567`. Main now has 25 ledger-derived definitions; the branch has thirteen scan-checked active definitions. The full incoming 25-item content is preserved as an editorial draft pending scan review. Repository inventory, components, styles, tests, schemas and docs inspected; this is not a claim of completed penetration/accessibility audit. |
| [Earlier blueprint](https://docs.google.com/document/d/1-9DXFFtHqUWGgSabES8yXlMARUYAB6MJi1TKX2lVkAw/edit) | Authorized Drive text fetch succeeded, 8,117 characters | Complete text read and preserved in [sources/BLUEPRINT-V1.md](sources/BLUEPRINT-V1.md); v2 adds precise player/lifecycle gates, research graph, screen states and delivery requirements. |

No Drive access failure occurred. Raw PDF, OCR and review images stay outside Git;
the source manifest contains the hash and page/excerpt review states. Thirteen
pages without embedded text are binding, cover, endpapers or blank leaves; 125
pages have embedded OCR. OCR is not accepted as exact transcription. Merely
rendering a page does not mean its contents have been visually proofread.

## Exercise counts, with explicit counting rules

V2 section 5 calls its register “23 entries” but actually lists **24 components**:
VII (5), IX (6), X (5), XIV (8). Its XII addendum adds **six numbered stages of one
protocol**, making **30 indexed components/stages**. These are an initial index,
not a complete census of the manual. Combining X-1–X-4 into one protocol and XII's
six stages into one gives 22 candidate protocol groups; boundaries for uncoded
passages remain subject to full-source review.

The branch implements **13 scan-checked runnable practices covering 21 indexed
components**. Lesson XII is one six-stage module. Catalog English protocol arrays
contain 42 instruction groups; this is not a claim of 42 distinct original stages.
The other nine indexed components are not runnable: partner gaze, six Lesson IX
influence experiments, X-5 personal agency, XIV-A4 movement-habit observation.
Their source and consent review must precede implementation. Further informal
instructions in other lessons remain to be extracted. No catalog-complete flag is
set. Current excerpt checks cover 15 scan pages; whole-page statuses remain partial.

## Existing implementation versus gaps

Implemented on branch before this milestone: five-tab responsive shell, navy/bronze
styles, guided/historical detail, source excerpts and timing provenance, optional
timers, JSON journal export, optional screen target and motion CSS; Node 24/SQLite
accounts, server sessions, circles, invitations, approved memberships, discussions,
reports, blocks, scoped moderation, deletion and server permission tests. Community
has not been deployed; health identity checks fail to an explicit offline screen.

This milestone adds the foreground-only session model, explicit safety start gate,
manual guided steps, optional untimed mode, early stop, resumable local snapshots,
private comfort/usefulness reflection, idempotent save, guarded legacy journal reads,
quota-failure recovery, scoped deletion, journal search, catalog search/discipline
filter, default/persisted quiet mode, skip link and focus handling. Test execution
is tracked in the milestone report, not implied by this implementation inventory.

Missing: full manual reading/transcription/peer review; IndexedDB migration and
multi-window transactional coordination; complete typed decision-policy engine;
onboarding/goals/bookmarks; browser routes/deep links/back stack; optional narration;
user-controlled progression/recommendations; full WCAG/manual assistive-device
review; PWA cache/install; real community deployment and operational readiness;
account recovery/MFA/export, pagination/global moderation; group sessions; sealed
paired experiments and withdrawal/statistics; native device installations. Incoming Capacitor configuration, dependencies, scripts and Android/iOS workflow preparation are preserved, with Node 24 for the SQLite tests; no device validation is claimed.

## Ready tasks and dependencies

1. Player and journal reliability can be implemented against existing verified
   content without changing the stack or using accounts: this milestone.
2. Lesson XII is ready after scan proofreading: checked against pp. 107–109 and
   added as one sequence with breath holds removed only from guided mode.
3. IndexedDB migration, route boundaries, source editorial workflow and accessibility
   tests are next solo requirements; preserve legacy journals and draft revisions.
4. Further source extraction needs sustained page-by-page reading and translation,
   not additional access. Independent editorial/translation review remains required.
5. Community release needs a deployment target, backups/retention, recovery and
   real two-account browser validation. Experiments depend on separate consent,
   server-only targets, immutable commitments, reveal guards and statistical tests.
6. Mobile release depends on web/browser/accessibility gates, privacy review, native
   toolchains, signing and actual Android/iOS installation evidence.

Local dependency installation and TCP listeners fail with EPERM despite the managed
network policy reporting unrestricted HTTP. Drive/GitHub connectors work. Thus
local TypeScript/Vitest/build/browser execution cannot be claimed; dependency-free
Node suites execute locally, and fresh push-triggered CI supplies the full checks.
No failed Actions workflow is manually restarted. Screenshots must come from a real
browser run; wireframes are not screenshots.

## Concurrent main-branch reconciliation

Main advanced during the audit to 47c4e7c0187fee123f8e2b030385efeaf0f54a54.
Incoming 25-item catalog preserved verbatim in
references/editorial-drafts/MAIN-CURRICULUM-47c4e7c.ts.txt, not automatically imported
into runtime. It lacks the primary-scan schema required by the user's source gate.
Only thirteen scan-checked modules are active; draft names, instructions and IDs
remain available for review, with compatibility aliases for equivalent verified IDs.
Existing GuidedSteps component is reused with a controlled position for resumable
stages; its original SSR test is retained. Native configuration and workflows are
retained, but signing/device tests and lifecycle plugin integration remain pending.
