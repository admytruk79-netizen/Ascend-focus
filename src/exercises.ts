export type Discipline = 'Attention' | 'Will' | 'Imagination' | 'Mental Rapport';
export type SourceDuration =
  | { kind: 'verified'; initialMinutes: number; progressionMinutes: number[]; details: string; pdfPage: number }
  | { kind: 'cross-reference' | 'not-specified'; details: string };
export type Exercise = {
  id: string; title: string; discipline: Discipline; lesson: string; pdfPages: string;
  minutes: number; guided: string[]; history: string; notice: string;
  source: {
    edition: '1910 Russian'; fidelity: 'verified-excerpt'; ledgerIds: string[];
    scanPages: number[]; printedPages: number[]; checkedAgainst: 'primary-scan';
    originalRussian: { text: string; pdfPage: number; printedPage: number }[];
    transcriptionNote: string;
  };
  originalProtocol: string[]; sourceDuration: SourceDuration;
  timerProvenance: 'source-initial' | 'modern-choice';
  modernAdaptations: string[]; accessibleAlternatives: string[];
  prerequisites: string[]; objectives: string[];
  evidence: 'historical-attention-practice' | 'historical-unverified-claim';
  reflection: { fields: readonly ['notes', 'comfort', 'perceived-usefulness']; privateByDefault: true };
};
export const curriculumStatus = {
  version: 5, complete: false, totalScanPages: 138,
  sourceSha256: 'aae7f2aae38b281177fa0eecf2136b8bd99e18b07ce229c41396cfc37edaadbe',
  sourceUrl: 'https://drive.google.com/file/d/1jWooZQ-arFVtNDHOCoqalcsBShRdxewb/view',
  note: 'Partial catalog. Only the included excerpts have been checked against scans. Whole-page transcription and exhaustive extraction remain incomplete.',
} as const;
const reflection: Exercise['reflection'] = { fields: ['notes', 'comfort', 'perceived-usefulness'], privateByDefault: true };
const note = 'Short Russian excerpt checked against the scan; line breaks and spacing normalized. English instructions below are a paraphrase, not a quotation or full transcription.';
function source(ledgerIds: string[], scanPages: number[], quote: string, quotePage: number): Exercise['source'] {
  return { edition: '1910 Russian', fidelity: 'verified-excerpt', ledgerIds, scanPages, printedPages: scanPages.map(p => p - 12), checkedAgainst: 'primary-scan', originalRussian: [{ text: quote, pdfPage: quotePage, printedPage: quotePage - 12 }], transcriptionNote: note };
}

export const exercises: Exercise[] = [
  {
    id: 'black-dot', title: 'The Black Dot', discipline: 'Attention', lesson: 'VII', pdfPages: '52–53', minutes: 2,
    source: source(['VII-1'], [52, 53], 'Прикрѣпите затѣмъ этотъ рисунокъ къ стѣнѣ на высотѣ вашихъ глазъ, при сидячемъ вашемъ положеніи.', 52),
    originalProtocol: [
      'Use white writing paper, described as six square inches, with an inked circle approximately the size of a half-rouble coin. Attach it to the wall at seated eye level; place the chair in the middle of the room facing it.',
      'The historical instruction is to gaze without blinking for one minute, rest the eyes, and repeat about five times.',
      'Keeping the chair in place, move the paper three feet to the right. Look toward it without turning the head for one minute; repeat about four times. Move it three feet left and repeat five times.',
      'After three days, use two-minute bouts; after another three days, use three minutes. Add one minute every three days, with the author advising a limit of fifteen minutes.',
    ],
    history: 'Atkinson describes a fixed black-point gaze, followed by right and left positions and a timed progression. His no-blinking instruction is preserved here as historical documentation, not a safety recommendation.',
    sourceDuration: { kind: 'verified', initialMinutes: 1, progressionMinutes: [2, 3], pdfPage: 52, details: 'One-minute bouts initially; two after three days, three after another three days, then one-minute increases every three days up to fifteen. Central and right repetitions are approximate (about five and about four); five leftward repetitions are stated.' },
    timerProvenance: 'modern-choice',
    guided: ['Sit comfortably and choose a stationary point at a comfortable height.', 'Blink naturally. If attention wanders, return gently without forcing a fixed gaze.', 'Use the optional timer as a limit, not a target to endure; stop for discomfort.'],
    modernAdaptations: ['Natural blinking and shorter, optional sessions replace forced staring.', 'The app’s two-minute suggestion is a modern choice, not the original starting duration.', 'Screen-based tracking, its direction and pace controls are modern additions, not Atkinson’s paper-target protocol.'],
    accessibleAlternatives: ['Attend to a sound or the feel of a held object instead of a visual point. This is a modern alternative.'],
    prerequisites: ['A comfortable visual point; visual practice is optional.'], objectives: ['Practice voluntarily returning attention to a chosen point.'],
    evidence: 'historical-attention-practice', notice: 'Do not suppress blinking, strain the eyes, or follow the historical progression automatically. No eyesight benefit is claimed.', reflection,
  },
  {
    id: 'mirror-gaze', title: 'Mirror Observation', discipline: 'Attention', lesson: 'VII', pdfPages: '53–54', minutes: 2,
    source: source(['VII-2'], [53, 54], 'Станьте передъ зеркаломъ и пристально смотрите въ отраженіе своихъ глазъ такъ, какъ было указано въ первомъ упражненіи.', 53),
    originalProtocol: ['Stand before a mirror and look at the reflection of your own eyes as in the first gaze exercise.', 'Gradually increase the time, following the first exercise; the text recommends combining both practices.'],
    history: 'Atkinson’s mirror exercise refers back to the first gaze exercise. It is distinct from the app’s nonjudgmental observation prompt.',
    sourceDuration: { kind: 'cross-reference', details: 'PDF p. 53 refers to the first gaze exercise and gradual increases; it does not specify a separate mirror starting duration.' }, timerProvenance: 'modern-choice',
    guided: ['Look at your reflection only if comfortable.', 'Notice facial expression without judgment; blink naturally.', 'Look away, change position or stop whenever needed.'],
    modernAdaptations: ['Nonjudgmental expression observation and a two-minute suggestion are modern additions.', 'Natural blinking replaces the fixed gaze inherited from the first exercise.'],
    accessibleAlternatives: ['Skip the mirror and observe a neutral object or a sound; this is a modern alternative.'], prerequisites: ['An optional mirror.'], objectives: ['Choose and sustain a comfortable observation task.'], evidence: 'historical-attention-practice', notice: 'Do not force staring. Skip this practice if looking at your reflection is distressing.', reflection,
  },
  {
    id: 'stillness', title: 'Comfortable Stillness', discipline: 'Will', lesson: 'XIV', pdfPages: '120–121', minutes: 5,
    source: source(['XIV-A1'], [120, 121], 'Вы не должны переутомлять себя какъ этимъ, такъ и какимъ-либо другимъ упражненіемъ.', 121),
    originalProtocol: ['Sit in a comfortable chair, take a comfortable position and relax all muscles.', 'Remain still for five minutes. Once this is easy, increase to ten minutes, then fifteen.', 'The author explicitly warns against overfatigue and rigid or tense sitting.'],
    history: 'The source progression is five, ten and fifteen minutes of relaxed sitting, not rigid posture or muscular tension.',
    sourceDuration: { kind: 'verified', initialMinutes: 5, progressionMinutes: [10, 15], pdfPage: 121, details: 'Increase from five to ten, then fifteen minutes only after the earlier duration becomes easy; avoid overfatigue.' }, timerProvenance: 'source-initial',
    guided: ['Choose a supported, relaxed position.', 'Notice natural movement and breathing without trying to suppress them.', 'Try gentle stillness; move or adjust whenever needed.'],
    modernAdaptations: ['Comfortable movement and posture adjustments are explicitly allowed.', 'Longer sessions are user choices, never automatic advancement.'],
    accessibleAlternatives: ['Rest lying down or attend to a supported body area; adaptations need not involve whole-body stillness.'], prerequisites: ['A comfortable resting position.'], objectives: ['Notice the difference between relaxed attention and tension.'], evidence: 'historical-attention-practice', notice: 'Necessary movement is always allowed. This is not medical treatment.', reflection,
  },
  {
    id: 'water-glass', title: 'Steady Hand', discipline: 'Will', lesson: 'XIV', pdfPages: '122', minutes: 1,
    source: source(['XIV-A3'], [122], 'Начинайте это упражненіе съ минуты и постепенно увеличьте его до пяти минутъ; здѣсь будетъ граница;', 122),
    originalProtocol: ['Fill a small glass with water to the brim, hold it with the fingers and extend the right arm in front.', 'Look at the glass and try to hold it still enough that the water does not visibly move.', 'Start at one minute and gradually increase to five, the stated limit; alternate right and left hands.'],
    history: 'The brim-full glass, extended arm and one-to-five-minute progression are confirmed on PDF p. 122, printed p. 110.',
    sourceDuration: { kind: 'verified', initialMinutes: 1, progressionMinutes: [5], pdfPage: 122, details: 'Start with one minute and gradually increase to five; the text does not give intermediate increments.' }, timerProvenance: 'source-initial',
    guided: ['Use a lightweight, unbreakable cup with only a little water; keep it over a safe surface.', 'Support your arm if needed and notice the water’s movement without demanding perfect stillness.', 'Rest or put the cup down as soon as it becomes uncomfortable.'],
    modernAdaptations: ['Partial filling, an unbreakable container, arm support and early rest replace spill/strain risks in the source.'],
    accessibleAlternatives: ['Observe a safely placed cup instead of holding it, or attend to a supported hand.'], prerequisites: ['A safe container and surface; holding is optional.'], objectives: ['Observe voluntary movement without demanding perfect stillness.'], evidence: 'historical-attention-practice', notice: 'Do not use heavy or breakable containers or hold an uncomfortable arm position.', reflection,
  },
  {
    id: 'pencil', title: 'Explore an Ordinary Object', discipline: 'Imagination', lesson: 'XIV', pdfPages: '125–126', minutes: 5,
    source: source(['XIV-C'], [125, 126], 'Возьмите какой-нибудь неинтересный предметъ, напримѣръ карандашъ, и сконцентрируйте на немъ все свое вниманіе въ теченіе пяти минутъ!', 125),
    originalProtocol: ['Choose an ordinary, uninteresting object such as a pencil and attend to it for five minutes.', 'Look at it, turn and examine it; consider its use, qualities, materials and manufacture.', 'Keep attention on the object and imagine that only you and the pencil exist in the world. The continuation on PDF p. 126 specifies an ordinary rather than especially interesting object.'],
    history: 'The pencil exercise begins on PDF p. 125 and continues on p. 126. Five minutes is source-stated, and a pencil is an example of an ordinary object.',
    sourceDuration: { kind: 'verified', initialMinutes: 5, progressionMinutes: [], pdfPage: 125, details: 'Five minutes; no timed advancement is specified in this passage.' }, timerProvenance: 'source-initial',
    guided: ['Choose a safe everyday object.', 'Notice its form, texture and material; consider its use and manufacture.', 'When attention wanders, return gently; shorten or stop the session as needed.'],
    modernAdaptations: ['Gentle refocusing and optional shorter sessions replace the source’s punitive metaphors about controlling attention.'],
    accessibleAlternatives: ['Explore a safe object by touch, or listen to an object’s description.'], prerequisites: ['A safe ordinary object or accessible description.'], objectives: ['Explore several aspects of one ordinary object.'], evidence: 'historical-attention-practice', notice: 'Use safe objects; do not handle sharp items. Benefits beyond the practiced task are not assured.', reflection,
  },
  {
    id: 'rapport', title: 'Mental Rapport Visualization', discipline: 'Mental Rapport', lesson: 'X', pdfPages: '79–81', minutes: 4,
    source: source(['X-1', 'X-2', 'X-3', 'X-4'], [79, 80, 81], 'Вы можете имѣть хорошіе результаты и безъ примѣненія трубы, однако лучшіе результаты получатъ тѣ, кто окажется способнымъ воспользоваться ею.', 81),
    originalProtocol: ['In a quiet place, sit or lie comfortably, relax the muscles and settle distracting thoughts.', 'Form an image of the intended person, remaining relaxed rather than frowning or clenching the fists.', 'Atkinson asks the reader to imagine that person carrying out the reader’s wishes; he interprets increasingly vivid imagery as rapport.', 'He proposes imagining a long hollow tube about one foot in diameter between the imagined people, gradually extending it; he also says the tube is not essential.'],
    history: 'This is Atkinson’s historical telepathic-will claim, not established communication. The original wish-influence framing differs from the consensual, nonmanipulative guided visualization.',
    sourceDuration: { kind: 'not-specified', details: 'No numerical session duration is specified in PDF pp. 79–81.' }, timerProvenance: 'modern-choice',
    guided: ['Rest comfortably and let breathing be natural.', 'If you imagine another person, use someone who has agreed to this practice, or imagine a fictional person.', 'Optionally imagine a connecting corridor and a kind conversation, without attempting to control another person.', 'Record your own experience without assuming anyone else received it.'],
    modernAdaptations: ['Consent, fictional-person alternatives, kind-conversation imagery and nonmanipulation are modern safeguards.', 'The four-minute suggestion is a modern choice, not a historical duration.'],
    accessibleAlternatives: ['Use words or a written description instead of visual imagery; imagining another person is optional.'], prerequisites: ['No other participant is required; involving a real person requires consent.'], objectives: ['Observe an imagined scenario while keeping imagination distinct from external evidence.'], evidence: 'historical-unverified-claim', notice: 'Telepathic communication is not scientifically established. Do not target strangers or assume an imagined response is a real message.', reflection,
  },
  {
    id: 'arm-observation', title: 'Arm and Fingertip Observation', discipline: 'Will', lesson: 'XIV', pdfPages: '121–122', minutes: 1,
    source: source(['XIV-A2'], [121, 122], 'Ладонь руки при этомъ должна быть обращена къ низу, такъ какъ это является наиболѣе легкимъ положеніемъ.', 122),
    originalProtocol: ['Sit upright with the head raised, chin forward and shoulders back. Extend the right arm sideways at shoulder level; turn the head to look at the arm.', 'Hold the position for one minute, then do the same with the left arm.', 'Keep the palm downward and look toward the fingertips to observe steadiness; advance to two, then three, and eventually five minutes.'],
    history: 'The arm-holding and fingertip-observation instructions span PDF pp. 121–122.',
    sourceDuration: { kind: 'verified', initialMinutes: 1, progressionMinutes: [2, 3, 5], pdfPage: 121, details: 'One minute for each arm initially; two, three, and eventually five are named. The passage gives no daily schedule.' }, timerProvenance: 'source-initial',
    guided: ['Rest your arm on a comfortable support and choose a position that does not strain the shoulder or neck.', 'Notice small movements in the hand or fingertips.', 'Rest, change position or stop before discomfort.'],
    modernAdaptations: ['Arm support and a comfortable position replace the shoulder-height hold and prescribed head/posture position.'], accessibleAlternatives: ['Observe a resting hand or a safe object instead of extending an arm.'], prerequisites: ['Comfortable arm support; arm extension is optional.'], objectives: ['Notice voluntary steadiness and small movements.'], evidence: 'historical-attention-practice', notice: 'Do not hold your arm at shoulder height if uncomfortable. No forced endurance or automatic progression.', reflection,
  },
  {
    id: 'finger-unfolding', title: 'Slow Finger Unfolding', discipline: 'Will', lesson: 'XIV', pdfPages: '123–124', minutes: 1,
    source: source(['XIV-B1'], [123, 124], 'Продолжайте то же самое съ лѣвой рукой.', 123),
    originalProtocol: ['Sit before a table with the hands resting on it; form a fist with the palm upward and the thumb across the fingers.', 'Move the thumb away, then slowly unfold the index finger and the remaining fingers in order, watching each movement.', 'Reverse the movement from the little finger until the fist is closed and the thumb rests across the fingers; repeat with the left hand.', 'The text names five repetitions per session, later ten, while keeping attention on the movements.'],
    history: 'Section XIV-B1 is confirmed directly on PDF pp. 123–124; it was missing from the earlier partial ledger.',
    sourceDuration: { kind: 'not-specified', details: 'Five, later ten repetitions are source-stated on PDF p. 123; no timed session duration is specified.' }, timerProvenance: 'modern-choice',
    guided: ['Rest one hand comfortably and move only fingers that can move without pain.', 'Slowly open and close the hand in a comfortable order, attending to the movement.', 'Use as few repetitions as feels comfortable; the one-minute app timer is optional.'],
    modernAdaptations: ['Comfortable movement range/order and fewer repetitions are modern adaptations; one minute is not an original duration.'], accessibleAlternatives: ['Imagine a hand opening, or observe a described sequence without moving your own hand.'], prerequisites: ['Comfortable supported hand or a nonmovement alternative.'], objectives: ['Attend to a simple movement sequence.'], evidence: 'historical-attention-practice', notice: 'Do not force stiff, painful or restricted joints. The historical repetition counts are not a requirement.', reflection,
  },
  {
    id: 'thumb-circles', title: 'Slow Thumb Circles', discipline: 'Will', lesson: 'XIV', pdfPages: '124', minutes: 1,
    source: source(['XIV-B2'], [124], 'большіе пальцы оставьте свободными.', 124),
    originalProtocol: ['Interlace the fingers of the two hands, leaving the thumbs free.', 'Slowly rotate one thumb around the other while attending to the tips of the thumbs.'],
    history: 'Atkinson describes thumb rotation with attention on the thumb tips on PDF p. 124.', sourceDuration: { kind: 'not-specified', details: 'No timer or repetition count is specified for this exercise on PDF p. 124.' }, timerProvenance: 'modern-choice',
    guided: ['Rest your hands comfortably; interlace fingers only if easy.', 'Move the thumbs gently around each other while noticing the movement.', 'Stop or use a nonmovement alternative whenever needed.'],
    modernAdaptations: ['Resting support, optional interlacing and a one-minute optional timer are modern additions.'], accessibleAlternatives: ['Observe or describe a circular motion without moving your hands.'], prerequisites: ['Comfortable hands or a nonmovement alternative.'], objectives: ['Attend to one simple, slow movement.'], evidence: 'historical-attention-practice', notice: 'Avoid pain or force; joint movement is optional.', reflection,
  },
  {
    id: 'pointing-finger', title: 'Index Finger Observation', discipline: 'Will', lesson: 'XIV', pdfPages: '124', minutes: 1,
    source: source(['XIV-B3'], [124], 'сосредоточивъ все свое вниманіе на его кончикѣ.', 124),
    originalProtocol: ['Rest the right hand on the knee, forming a fist except for the extended index finger.', 'Move the index finger slowly from side to side while attending to its tip.'],
    history: 'Section XIV-B3 describes the extended index finger moving slowly from side to side.', sourceDuration: { kind: 'not-specified', details: 'No numerical duration or repetition count is specified for this exercise on PDF p. 124.' }, timerProvenance: 'modern-choice',
    guided: ['Support a hand in a comfortable position.', 'If easy, move the index finger gently from side to side and notice its tip.', 'Release the hand and rest whenever needed.'],
    modernAdaptations: ['Any comfortable support, relaxed fingers and a one-minute optional timer replace the prescribed fist/knee position.'], accessibleAlternatives: ['Observe a static point or listen to a movement description.'], prerequisites: ['Comfortable supported hand or a nonmovement alternative.'], objectives: ['Keep voluntary attention on a small movement.'], evidence: 'historical-attention-practice', notice: 'Do not force the finger or fist position. Stop before discomfort.', reflection,
  },
  {
    id: 'fixed-mark-head-motion', title: 'Fixed Mark Observation', discipline: 'Attention', lesson: 'VII', pdfPages: '54', minutes: 1,
    source: source(['VII-3'], [54], 'самое же упражненіе должно производить вначалѣ очень умѣренно, не утомляя глазъ.', 54),
    originalProtocol: ['Stand facing a wall at a distance of three feet and attach a sheet of white paper at eye level.', 'Keep looking at the mark while rotating the head, changing the direction of rotation.', 'The author says to begin very moderately without tiring the eyes. His claimed development of eye nerves and muscles is a historical claim, not an app benefit.'],
    history: 'Lesson VII, exercise III, describes a fixed mark with head rotation. It gives no numerical duration; the app does not recommend reproducing head circles.',
    sourceDuration: { kind: 'not-specified', details: 'PDF p. 54 specifies a very moderate beginning without eye fatigue, but no timer or repetition count.' }, timerProvenance: 'modern-choice',
    guided: ['Choose a stationary point at a comfortable distance and keep your head in a comfortable position.', 'If comfortable, make a small, slow head turn while noticing the point; blinking and looking away are allowed.', 'Skip movement entirely or stop immediately for dizziness, pain or visual discomfort.'],
    modernAdaptations: ['Small optional turns replace historical head rotation; full head circles are not required.', 'Seated support, natural blinking and the one-minute optional timer are modern choices.'],
    accessibleAlternatives: ['Keep the head still and attend to a point, sound or held object instead; these are modern alternatives.'], prerequisites: ['A comfortable observation point; head movement is optional.'], objectives: ['Notice attention during a small optional change of position.'], evidence: 'historical-attention-practice', notice: 'Stop for dizziness, neck pain or eye discomfort. No eyesight or eye-muscle benefit is claimed.', reflection,
  },
  {
    id: 'wall-point-shifting', title: 'Attention Between Points', discipline: 'Attention', lesson: 'VII', pdfPages: '54', minutes: 1,
    source: source(['VII-4'], [54], 'Упражненіе это слѣдуетъ немедленно прекратить, какъ только глаза станутъ уставать.', 54),
    originalProtocol: ['Stand with your back to a wall, facing the opposite wall.', 'Move the gaze rapidly between points on that wall: right, left, up, down, in zigzags, circles and other directions.', 'Stop immediately when the eyes begin to tire. Before finishing, the author recommends resting the gaze on one point. His eye-strengthening claim is not an established app benefit.'],
    history: 'Lesson VII, exercise IV, describes rapid gaze shifts and an explicit fatigue stop. Slow comfortable shifts in guided mode are a modern adaptation.',
    sourceDuration: { kind: 'not-specified', details: 'PDF p. 54 gives a fatigue-based stop and a final stationary point, but no numerical duration or repetition count.' }, timerProvenance: 'modern-choice',
    guided: ['Choose two stationary points that are easy to see without strain.', 'Shift attention slowly between them at your own pace; blink naturally and avoid large or rapid eye movements.', 'Stop for fatigue or discomfort. If comfortable, finish by resting attention on one point.'],
    modernAdaptations: ['Two points and slow self-paced shifts replace rapid multidirectional movements.', 'A seated position and a one-minute optional timer are modern choices; the timer never overrides discomfort.'],
    accessibleAlternatives: ['Attend to one stationary point, or alternate between two sounds or tactile objects; these are modern alternatives.'], prerequisites: ['Comfortable stationary points or a nonvisual alternative.'], objectives: ['Choose where to direct attention and notice a change of focus.'], evidence: 'historical-attention-practice', notice: 'Stop immediately for eye fatigue, dizziness or discomfort. No eyesight benefit is claimed.', reflection,
  },
  {
    id: 'thought-absorption', title: 'Quality and Action Imagery', discipline: 'Imagination', lesson: 'XII', pdfPages: '107–109', minutes: 2,
    source: source(['XII-1', 'XII-2', 'XII-3', 'XII-4', 'XII-5', 'XII-6'], [107, 108, 109], 'Всѣ свои мечты всегда заканчивайте рѣшительной мыслью: «я есмь».', 108),
    originalProtocol: [
      '1. Find a quiet, secluded place, as free from noise as possible. If ideal conditions are unavailable, choose the most suitable place available; the stated aim is to remove distractions and turn attention inward.',
      '2. Rest comfortably on a sofa, bed or chair; relax muscles and release tension and worry. The historical text prescribes slow deep breaths with a pause before exhaling until calm. Breath retention is documented here, not used in guided mode.',
      '3. Direct attention to oneself and set aside external impressions. The continuation on PDF p. 108 says concentration exercises prepare the reader for this.',
      '4. After mental and physical relaxation, concentrate calmly and persistently on a chosen word and its meaning. The author uses fearlessness as an example and asks the reader to consider the qualities of a person possessing it.',
      '5. Imagine oneself already possessing the quality and acting with it, including interactions with other people. Keep imagery on that subject, finish with the affirmation I am, and alternate imagery with the affirmation.',
      '6. Repeat often. The author recommends practice before sleep and during insomnia, allowing drowsiness rather than resisting it. PDF p. 109 explains that fearlessness is only an example: choose the desired quality, or the opposite of an unwanted quality. His promises of inevitable character change and sleep benefit are historical claims, not established outcomes.',
    ],
    history: 'Lesson XII presents one six-stage thought-absorption sequence, not six separate exercises. The original breathing, affirmation, repetition and pre-sleep advice are preserved as attributed history; the app makes no treatment or guaranteed personality-change claim.',
    sourceDuration: { kind: 'not-specified', details: 'PDF pp. 107–109 give six stages and frequent repetition, but no numerical session duration or timed progression.' }, timerProvenance: 'modern-choice',
    guided: ['Choose a reasonably quiet place; perfect silence is not required.', 'Rest comfortably and breathe naturally, without deep-breathing targets or breath holds.', 'Notice your current experience; if distracted, gently return without trying to suppress thoughts.', 'Choose an optional quality such as patience and consider what it means to you.', 'Imagine one ordinary action expressing that quality. Use words instead of imagery if preferred; affirmations are optional.', 'Finish whenever ready. Optionally record an observation or repeat another day; repetition and pre-sleep practice are not requirements.'],
    modernAdaptations: ['Natural breathing replaces the historical deep breaths and breath retention.', 'Gentle noticing, optional affirmations, nonvisual descriptions and a two-minute optional timer are modern choices.', 'No promise of curing fear, improving sleep or inevitably changing character; no blame for difficult thoughts or anxiety.'],
    accessibleAlternatives: ['Write or describe a possible action rather than visualizing it. Keep movement and external supports available.'],
    prerequisites: ['Historical stage 3 refers to preparation through concentration exercises; guided practice requires only a comfortable setting and may be skipped.'], objectives: ['Explore a chosen quality through one imagined or described action, distinguishing intention from guaranteed change.'], evidence: 'historical-attention-practice', notice: 'Do not hold your breath or force relaxation. Stop or change the practice if uncomfortable; this is not treatment for anxiety or insomnia.', reflection,
  },
];

export function timerLabel(exercise: Exercise): string {
  return exercise.timerProvenance === 'source-initial'
    ? `Source-stated starting duration: ${exercise.minutes} minute${exercise.minutes === 1 ? '' : 's'}. Shortening is a modern adaptation.`
    : `Modern optional timer suggestion: ${exercise.minutes} minute${exercise.minutes === 1 ? '' : 's'}; not an original starting duration.`;
}

// Incoming main catalog names retained as aliases; unreviewed content is not published.
export const exerciseAliases: Readonly<Record<string, string>> = {
 'finger-sequence': 'finger-unfolding', 'index-motion': 'pointing-finger',
 'fixed-mark-head': 'fixed-mark-head-motion', 'gaze-shifting': 'wall-point-shifting',
};
export function getExercise(id: string): Exercise | undefined {
 return exercises.find(e => e.id === (exerciseAliases[id] ?? id));
}

export type HistoricalLessonNotes = {
 pdfPages: number[]; printedPages: number[]; paraphrases: string[];
 originalRussian: { text: string; pdfPage: number; printedPage: number }[];
 notice: string;
};
/** Chapter-wide advice is historical data, not a shared guided instruction. */
export const historicalLessonNotes: Readonly<Partial<Record<string, HistoricalLessonNotes>>> = {
 VII: {
  pdfPages: [55, 56], printedPages: [43, 44],
  paraphrases: [
   'PDF p. 55: Atkinson advises keeping gaze and personal-magnetism studies secret. This is historical advice, not the app’s policy for involving other people.',
   'PDF p. 55: Set aside time and develop gradually without unnecessary haste; no universal daily duration is supplied in this closing advice.',
   'PDF p. 56: The author says to avoid blinking, squinting and unnaturally widening the eyelids. Guided practice instead permits natural blinking and stopping for discomfort.',
   'PDF p. 56: For eye fatigue, the author recommends cold-water eye rinsing and promises immediate relief and less fatigue after days. These are attributed historical claims, not app eye-care guidance.',
  ],
  originalRussian: [{ text: 'Избѣгайте мигать, щуриться или неестественно расширять вѣки.', pdfPage: 56, printedPage: 44 }],
  notice: 'Historical documentation only. No eye-care, eyesight or influence benefit is established by these passages. Consent, natural blinking, accessible alternatives and stopping remain part of modern guidance.',
 },
};
