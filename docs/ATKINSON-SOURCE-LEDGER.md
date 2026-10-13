# Atkinson exercise source ledger — partial verified passages (v0.1)

Edition: William Walker Atkinson, Сила мысли в деловой и повседневной жизни, scanned Russian edition (1910), 138 PDF pages.

IMPORTANT: The original uploaded PDF is not accessible to Codex from this repository. This ledger was extracted from selected pages of the user's PDF in ChatGPT. It paraphrases rather than reproduces the source. Old-Russian OCR is imperfect. This is NOT a comprehensive extraction. PDF page numbers are 1-indexed scan pages, not printed page numbers.

## Lesson VII — Magnetic gaze (PDF pp. 51–56, printed pp. 39–44)
- VII-1 Black point (PDF 52–53): Draw a black circle on white paper at eye level, hold visual attention, move target right and left; historical instruction discourages blinking and increases durations. Modern app: allow blinking and brief optional sessions; never force staring or strain.
- VII-2 Mirror gaze (PDF 53–54): Look at one's own eyes in a mirror. Modern app: nonstraining self-observation.
- VII-3 Head motion/fixed mark (PDF 54): Keep target under observation while moving head slowly. Modern app: allow opt-out, stop dizziness.
- VII-4 Moving attention between targets (PDF 54): Shift gaze among points on a wall; source says to stop when fatigued. Modern app: adjustable slow motion and reduced-motion setting.
- VII-5 Partner gaze (PDF 54–55): Atkinson suggests partner gaze and experiments with animals. App: only consensual, comfortable human partner; no distressing animals.

## Lesson IX — Will and attempted influence (PDF pp. 69–74, printed pp. 57–62)
Six historical experiments are described. Their purported remote influence effects are unverified and should never be implemented as covert behavioral manipulation.
- IX-1 PDF 69–70: Imagine prompting a person walking ahead to turn.
- IX-2 PDF 70: Imagine drawing the attention of a seated person.
- IX-3 PDF 70–71: Attempt to attract another's attention without gaze.
- IX-4 PDF 71: Imagine transmitting a word to a person searching for it.
- IX-5 PDF 72–73: Imagine influencing movement direction.
- IX-6 PDF 73: From a window imagine a passerby looking toward you.
Modern adaptations: private visualization, optional consenting paired word/picture guessing, and pre-registered blind trials; not stranger targeting.

## Lesson X — Telepathic Will (PDF pp. 75–85, printed pp. 63–73)
STATUS: fully read and ledgered end-to-end (PDF 75–85) via direct PDF text extraction (`pdftotext`, not the earlier partial Drive-text pull this ledger was built from). Lesson X ends and Lesson XI ("Attractive Power of Thought," theory only, no exercises - Mulford/Williams quotations on "thoughts are things") begins on PDF 85.
- X-0 PDF 75–78 (printed 63–66): Theoretical setup for "telepathic willing" - no numbered exercise here, just the rapport/vibration theory and Atkinson's warning against using these techniques to cause harm ("you will pay for it with your own suffering"; do not cause damage to the influenced person). Not implemented as an exercise, but is the textual source backing the app's existing non-covert-influence safety notices on the Mental Rapport exercises.
- X-1 PDF 79: Find a quiet place; sit or lie comfortably; relax muscles and settle thoughts.
- X-2 PDF 79: Form a mental image of another person; historical text treats vividness as evidence of rapport, which is not established.
- X-3 PDF 79–80: Imagine the person's behavior as mental communication.
- X-4 PDF 80–81: Visualize a long hollow tube/corridor connecting imagined people as a concentration method.
- X-5 PDF 81: Affirm personal agency ('I am') as a historical mental-boundary technique.
- X-6 PDF 82–83 (printed 70–71): Atkinson extends the 'I am' affirmation into an explicit defensive practice - surrounding the affirmed self-image with "guarding thoughts," described as a protective "mental castle," used to think clearly under outside pressure or crowd feeling before returning (same page) to the chapter's main thread on influencing others. Implemented as `mental-shielding` ("The Mental Castle").
Modern adaptation must not claim telepathic communication is scientifically established or encourage belief in unwanted external thought intrusion.

## Lesson XIV — Concentration (PDF pp. 120–125 and continuing; printed pp. 108–113+)
- XIV-A1 PDF 120–121: Relaxed seated stillness, historically 5 then 10 then 15 minutes. App allows comfortable movement.
- XIV-A2 PDF 121–122: Observe the fingers of an extended arm, starting with 1 minute; stop physical discomfort.
- XIV-A3 PDF 122: Hold water-filled glass still, watch liquid; safer app uses partial-filled unbreakable container.
- XIV-A4 PDF 122–123: Observe movement habits; do not stigmatize fidgeting/neurodivergence.
- XIV-B1 PDF 123: Sit at a table with fists palms upward; extend thumb, then each finger in sequence, then fold back in reverse order. Repeat using the other hand. The original suggests five repetitions, progressing to ten. Adapt with pain-free movement or optional imagery. This wording has been checked in text extraction; visual proofreading is still required.
- XIV-B2 PDF 124: Interlace fingers and rotate thumbs slowly while observing the movement.
- XIV-B3 PDF 124: Extend index finger and move side to side while attending to it.
- XIV-C PDF 125: Study a pencil for five minutes, investigating shape, materials, purpose and manufacture.

## Codex source protocol
- Keep historical and adapted exercise instructions separate.
- Every exercise requires stable id, lesson, scan page reference, fidelity state, duration with provenance, safety adaptation, and evidence category.
- States: verified-excerpt; needs-page-review; proposed-modern.
- Never claim the exercise inventory is complete until all 138 PDF pages are audited, including the continuation beyond PDF 125.
- Do not silently invent historically attributed exercises or durations.
- Obtain the scanned PDF through an authorized accessible workspace if exact transcription or complete extraction is requested.
- Extraction method note: the PDF already has an embedded OCR text layer (Adobe Acrobat Pro Paper Capture), 138 pages confirmed via `pdfinfo`. Fetching it through a generic "read this Drive file as text" tool truncated at ~120K characters (roughly through PDF page 80). Downloading the raw file and running `pdftotext -layout` locally (or `pdftotext -f N -l N` per page) extracts the full 138 pages (~400K characters) and is the reliable method - use that, not a generic Drive text read, when auditing pages beyond ~80.

## Lesson XII — Thought absorption (PDF pp 107–109; printed pp 95–97)
These six numbered instructions belong to ONE continuous historical protocol, not six unrelated lessons.
- XII-1 Seek quiet and relative seclusion.
- XII-2 Adopt comfortable rest and relax; original includes deep breathing and breath retention. Modern version uses natural breathing and avoids breath holds.
- XII-3 Direct attention inward while letting unrelated impressions settle.
- XII-4 Choose a quality/word (author uses fearlessness) and concentrate on its meaning.
- XII-5 Imagine acting as if already exhibiting the quality and use the historical 'I am' affirmation.
- XII-6 Repeat the practice optionally, sometimes before sleep according to the source; do not imply psychological treatment or guaranteed change.
Review: scan text verified on PDF pp 107–109, image proofreading still pending.

## Full application specification
[ASCEND Focus Complete Application Master Specification v2](https://docs.google.com/document/d/16U1Rs7_o1CjWGCzHBDjXCB2-hjpxapimrF27x4Qhebk/edit) defines screens, user journeys, state machine, AND/OR gates, matching and adaptation algorithms, data flows, API, backend permissions, community, paired experiments, animations, neuroinclusive requirements, acceptance tests and delivery stages. This does not mean all features exist in code.
