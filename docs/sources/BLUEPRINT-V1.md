ASCEND FOCUS — MASTER BUILD BLUEPRINT v1
Date: 10 October 2026
Repository: https://github.com/admytruk79-netizen/Ascend-focus
Purpose: a source-grounded, secular-accessible but historically faithful practice system for attention, will, imagination, observation and voluntary thought practice, with a real community of practitioners.


1. PRODUCT MISSION
Preserve William Walker Atkinson's practices from the user's 1910 Russian edition while making them practical through guided and historical modes, a journal, gradual progression, and community. Telepathy and thought transmission are presented as historical or exploratory claims, NOT established scientific abilities. Never claim medical treatment, eyesight benefits or verified extrasensory powers.


2. DOCUMENTARY FOUNDATION
Source: Вильям Валькер Аткинсон, Сила мысли в деловой и повседневной жизни, 1910 Russian edition, 138 scanned PDF pages. First verified source sections:
- Lesson VII, PDF pp 51–56: black-point gaze, mirror gaze, controlled eye motion, experiments with partner's gaze.
- Lesson IX, PDF pp 69–74: six historic experiments about attempted mental influence (turning one's head, drawing attention in groups, attempts to influence movement or forgotten words). In modern guided mode only consensual, nonmanipulative versions.
- Lesson X, PDF pp 75–85: telepathic will and mental rapport: relaxation, visualizing a person, imaginary tube or cylinder, intended thought projection, mental boundaries. Historical belief attribution required.
- Lesson XIV, PDF pp 120–125+: seated stillness, arm holding, water-glass steadiness, voluntary movement, thumb circles, pointing finger, pencil observation.
These represent confirmed excerpts, NOT a finished full-page exhaustive extraction. Continue all 138 pages before marking catalog complete. Preserve source page, printed lesson, original wording where legible, normalized English, adaptations, and attribution.


3. TRAINING DISCIPLINES
Attention and gaze; voluntary control/stillness; imagery and memory; thought awareness and refocusing; historical mental rapport/telepathic practice; somatic and emotional regulation; observational recall; real-world applied focus.
Every exercise: stable id, lesson/page, source fidelity, prerequisites, objectives, original protocol, modern adapted protocol, optional timer, accessible alternatives, safety caveats, completion and reflection schema, evidence status.
Adaptive advancement based on user choice, comfort and exercise-specific performance, never a diagnosis. Offer quiet mode, screenreader labels, adjustable durations, high contrast and reduced motion.


4. COMMUNITY REQUIREMENTS
Community is an actual first-class feature, never a decorative Share link. Modes:
A. Circles: opt-in themed groups, pinned practices, clear moderation.
B. Sessions: consent-based buddy pairing, scheduling, mutual reflection.
C. Experiments: two participant accounts, hidden independently assigned targets, timestamped commitment and blinded response, reveal after submission, aggregate results including misses, transparent chance baselines.
D. Journaling: PRIVATE by default; explicit consent for any publication.
E. Safety: no harassment, claims of covert influence, targeting strangers, or coercive claims. Report, block, moderation queues, age policy, privacy and deletion.
Backend not yet connected: community UI must honestly indicate offline/demo status until auth, RLS policies, storage, and moderation are deployed.


5. UX / NAVIGATION
Bottom navigation: Today | Practice | Journal | Community | Profile.
Today: daily plan, resume, optional streak, most recent practice.
Practice: disciplines, lesson-source toggle, searchable catalog, training sequence.
Exercise detail: original/source citation tab, guided instructions, safety, adjustable timer, Start/Pause/Finish.
Journal: private entries, tags, perceived usefulness, free-text, export/delete.
Community: Circles, Sessions, Experiments; show demo states clearly until backed by real service.
Profile: accessibility controls, privacy, data export, notification preference.
Onboarding: goals and comfort preferences, NOT diagnostic intake.


6. MOBILE MOCKUPS (LOW-FIDELITY)
TODAY                  PRACTICE              EXERCISE                COMMUNITY
ASCEND Focus           Explore disciplines   Quiet Observation        ASCEND Circles
Good morning           Search exercises      Historical | Guided     Circles | Experiments
Today's intention      Gaze & observation    Source: L XIV / p113    Focus Circle [Demo]
[Continue 3 min]       Stillness & will      Duration 2:00 +/-       Partner Trial [Demo]
Recent journal         Mental imagery        [Start] [Pause]         Join requires account
Today Practice etc     Thought projection    [Complete & Reflect]    Privacy info


7. SYSTEM ARCHITECTURE
React + TypeScript + Vite + Vitest; responsive web PWA; Capacitor for Android/iOS after baseline green. Content stored as typed versioned JSON/TS with source metadata. Local-first journal/progress. Separate adapter interface for eventual authentication/community backend; never assume connected. No mandatory account to practice alone. Proposed data tables: users, profiles, exercises, practice_sessions, private_journal_entries, circles, memberships, posts, reports, paired_experiments, experiment_trials, consent_records. Server-enforced RLS and access control required.


8. RELEASE PHASES
Phase 0: repository scaffold, typecheck, tests, live navigation and several working lessons.
Phase 1: complete source extraction; exercise engine; local journal; PWA/offline support.
Phase 2: real auth, secure circles, moderation and persistence.
Phase 3: blinded paired experiments with trial integrity and full statistical reporting.
Phase 4: Capacitor Android and iOS builds, store assets and privacy review.
Definition of done: CI green; no placeholder features labelled live; exercises actually run; histories save/reopen offline; app install builds validated on devices; server privacy tests; accessible keyboard/mobile UX.


9. RESEARCH / EVIDENCE
Attention training may improve performance on practiced tasks; transfer to everyday functioning is not assured. Claims from Atkinson about telepathy, psychical influence and magnetic gaze belong to historical worldview, not demonstrated facts. Treat user observations respectfully. When researching hypotheses, use pre-registered controlled and blinded protocols with consent; document misses as well as hits.


10. CODEX EXECUTION BRIEF
You are implementing ASCEND Focus in repository admytruk79-netizen/Ascend-focus. Work directly in this repo (not Tesseract, Keys or Journey). The master document ASCEND Focus — Master Product, Research, Curriculum and Engineering Blueprint v1 is the product specification.
Goals: set up React/TypeScript/Vite, a clean dark accessible app shell, mobile five-tab nav (Today/Practice/Journal/Community/Profile), an exercise schema and first verified Atkinson modules from Lessons VII, IX, X and XIV; timer and local-first private journal; reusable UI; tests. Historical and modern modes must be visibly distinguished and do not misrepresent scientific evidence. Community requires real auth/backend/moderation before it can be called live; render demo state in MVP. Implement and test incrementally, review all files and package scripts, run npm install, npm run typecheck, npm test and npm run build, fix failures, and report verified outputs, test results and commit SHAs. Do not manually rerun existing failed GitHub Actions jobs. Avoid large changes without tests and never claim successful APK/AAB until physically verified.
Design: dark ink/navy, parchment white, subtle bronze; no oversize ornamental emblems, support reduced motion, visible focus outlines, 44px minimum touch targets and readable typography.
IMPORTANT: Continue comprehensive transcription of 138-page Russian edition with page provenance; never invent exercises or durations. Preserve historical gaze instructions separately with modern safety adaptations.
