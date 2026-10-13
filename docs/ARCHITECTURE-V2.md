# ASCEND Focus architecture package

Contract: [complete v2 snapshot](sources/SPECIFICATION-V2.md), cross-reference
[earlier blueprint](sources/BLUEPRINT-V1.md). Specifications describe target behavior;
[access audit](DOCUMENT-ACCESS-AUDIT.md) and release evidence describe actual status.
This package belongs only to Ascend-focus; it changes no Keys/Journey/Tesseract code.

## Status and section traceability

I = implemented in this branch, P = planned, V = execution evidence required,
B = blocked by a named dependency. I does not imply V, deployment or release.

| V2 sections | Canonical design location | Implemented / missing |
| --- | --- | --- |
| 1–2 mission/audiences | v2 §§1–2 | I solo no account, historical attribution; P onboarding/goals |
| 3,14 screens/wireframes | v2 §§3,14; SCREEN-MOCKUPS.md | I five tabs, detail, player, journal, circles/moderation; P other views, deep links |
| 4,5,18,23 source/modules | exercises.ts; SOURCE-REVIEW.json; source ledger | I typed partial catalog, XII six stages; P exhaustive translation/editorial review |
| 6 modern additions | v2 §6 | P external-provenance modules; no modern exercise disguised as historical |
| 7 player FSM | practiceSession.ts; PracticePlayer.tsx | I READY/RUNNING/PAUSED/INTERRUPTED/REFLECTION/SAVED; stop/end reasons retained; READY encapsulates IDLE setup and REFLECTION encapsulates COMPLETED. P full event log/IndexedDB |
| 8 decision gates | v2 §8; gates below | I safety/storage/motion and server membership gates; P reusable typed policy results |
| 9,17 adaptation/feedback | v2 §§9,17 | I active time and optional private comfort/usefulness; P opt-in ranking and progress charts |
| 10–12 layers/data/API | v2 §§10–12; COMMUNITY.md; server/schema.sql | I local adapters and server-authoritative SQLite; P IndexedDB/versioned API contract and account export |
| 13 security | COMMUNITY.md and server tests | I session/CSRF/permissions/rate limits; P recovery/MFA/global moderation/deployment review |
| 15 accessibility | v2 §15; CSS and browser tests | I quiet default, OS motion, labels/touch targets/skip link; P axe/manual VoiceOver/TalkBack and all-screen fixtures |
| 16 evidence/competitors | RESEARCH-COMPARISON.md | Initial primary-page observations; P hands-on competitor audits and comprehensive literature review |
| 19 mobile/PWA | v2 §19 | I incoming Capacitor/config/workflow preparation; P/B signing, lifecycle plugins and device validation; no installed native app claim |
| 20–21 tests/release | CI, Node/Vitest/Playwright suites; milestone report | I test pipeline; V only executed results; B local web checks by network/TCP restrictions |
| 22,24 source truth/DoD | access audit, source manifest, milestone report | P source completion; independent release gates stay open |

## Runtime boundaries and data flow

```
PDF → page ledger → visually reviewed excerpt → typed curriculum → source/guided UI
UI → pure session transitions → local draft snapshot → reflection → private journal
Community UI → same-origin API → authentication → membership/role checks → SQLite
Paired UI (planned) → consent → sealed server target/response → verified reveal → outcomes
```

Solo data never flows to the community API. Current local storage is a bounded-scope
adapter chosen to repair the existing implementation; v2's IndexedDB with schema
migrations remains the next persistence layer. The journal reader accepts existing
v1 arrays without changing their dates or notes. Corrupt raw data is preserved;
quota failures retain unsaved reflection. Session IDs make completion/save retries
idempotent. Multi-tab transactional writes are not yet guaranteed.

Session snapshots persist curriculum version, exercise ID, foreground elapsed time,
stage, timing choice and optional reflection. Monotonic anchors are not resumed after
reload. Hidden/pagehide/unmount suspends active practice; resume requires a user
choice and safety acknowledgement. Interrupted time is not treated as attention.
Changing source revision blocks automatic restore. Replacing another draft requires
confirmation with an export route. Crash recovery can lose at most the unsaved time
since a five-second checkpoint; this conservative loss is preferable to inventing
active time. No browser snapshot is proof of performance or identity.

## Decision and permission gates

- Solo start = source excerpt verified AND guided steps present AND safety accepted
  AND (snapshot storage writable OR explicit temporary-practice acceptance).
- Motion = explicit target choice AND not quiet AND not OS reduced motion. Motion
  settings reset to static when disabled; toggling quiet off cannot start motion.
- Save = reflection state AND successful latest-journal read AND successful write.
  OR user exports unsaved data; export is never labelled a successful local save.
- Remote read/write = server session AND current resource permissions AND validation
  AND consent/rate limits for the specific operation. UI visibility is not authority.
- Public journal share = DENY until per-item ownership/consent/moderation flow exists.
- Paired start/reveal = DENY until auth, separate consent, hidden commitments,
  independent locked responses, server reveal guards and audit are implemented.
- Progression = manual choice today; automatic progression = DENY until explicit
  opt-in, comfort threshold and exercise prerequisites are implemented.

Formal ALLOW/DENY/REQUIRE_CONSENT/FALLBACK reason-code objects are planned. Current
server routes use session cookies under /api rather than the illustrative bearer
/v1 design: preserve this tested implementation; document/version changes before
migrating clients. SQLite is not a direct browser database; per-route permissions
are the current equivalent enforcement boundary, not a claim of deployed RLS.

## Screen states and interaction contracts

All target screens and wireframes are enumerated in v2 §§3/14. Current states:
Today ready/resume/stale draft; Practice ready/filtered-empty; Detail source/guided;
Player ready/running/paused/interrupted/reflection/storage fallback; Journal
empty/ready/read-error/write-error/delete/export; Community health-loading/offline,
auth-required/connected/pending/denied/discussion/moderation; Profile ready/preference
write-error. Remote loading/error text must never fabricate live members or content.
Remaining screen states/fixtures and navigation stack are planned.

Back/tab changes suspend the player. Journal and source text are escaped React text.
No automatic journal publication, clinical intake, public diagnosis, punitive streak
or telepathy efficacy score. Reflection fields are optional and self-reported.

## Animation contract

Existing orb is decorative progress, not breathing instruction. Static targets are
default. Target motion is explicitly modern, opt-in, never an original-paper claim.
Quiet defaults on and persists. CSS OS reduction overrides all motion; background
player interruption stops its running flag. Planned central tokens: selection
100–180ms, page transition150–300ms, optional ambient5s, no flashes. Current page
entry CSS is350ms and must be reconciled in the tokenization milestone. Motion
settings require equivalent stationary labels and instructions; audio defaults off.

## Experiments and release boundaries

See v2 §§8–13/17 for the normative protocol. Future trials require server cryptographic
RNG, versioned target sets, nonce+target+trial ID SHA-256 commitments, sender-only
pre-reveal access, independent receiver response, transactionally immutable locks,
withdrawal/expiry and idempotent reveal. Include misses, missing and invalid trials;
report chance baseline and uncertainty. Unblinded or selectively reported data is not
evidence of telepathy. Membership is not pairing consent.

Release R0 requires install/typecheck/test/build. R1 additionally requires actual
solo browser, keyboard and accessibility evidence. R2 needs all138-page source audit
and editorial review. R3 needs deployed auth/privacy/moderation and operational tests.
R4 needs trial integrity/statistics evidence. R5 needs signed builds installed on
actual Android/iOS devices. Passing CI does not satisfy later gates automatically.
