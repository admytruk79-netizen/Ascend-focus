import { useEffect, useRef, useState } from 'react';
import { MovementDemonstration } from './MovementDemonstration';
import { GuidedSteps } from './GuidedSteps';
import { ExerciseInstructions } from './ExerciseInstructions';
import { FocusOrb } from './FocusOrb';
import { VisualAttentionTarget } from './VisualAttentionTarget';
import { curriculumStatus, type Exercise } from './exercises';
import { advance, createSession, remainingSeconds, restoreSession, transition, type PracticeSession, type SessionEvent } from './practiceSession';
import { exportJSON, saveEntry, sessionKey, type JournalEntry } from './privateJournal';

export function readPracticeDraft(): PracticeSession | null {
  try { return restoreSession(localStorage.getItem(sessionKey)); } catch { return null; }
}
function initialSession(exercise: Exercise): PracticeSession {
  const draft = readPracticeDraft();
  if (draft?.exerciseId === exercise.id && draft.catalogVersion === curriculumStatus.version) return draft;
  return createSession(crypto.randomUUID(), exercise.id, curriculumStatus.version, exercise.minutes * 60000);
}

export function PracticePlayer({ exercise, quiet, onBack, onSaved }: { exercise: Exercise; quiet: boolean; onBack: () => void; onSaved: (entries: JournalEntry[]) => void }) {
  const [session, setSession] = useState(() => initialSession(exercise));
  const current = useRef(session);
  const [historical, setHistorical] = useState(false);
  const [message, setMessage] = useState('');
  const [ephemeralAccepted, setEphemeralAccepted] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const lastCheckpoint = useRef(0);
  function persist(next: PracticeSession) {
    try {
      if (next.state === 'SAVED') localStorage.removeItem(sessionKey);
      else localStorage.setItem(sessionKey, JSON.stringify({ ...next, lastTick: null }));
      setStorageReady(true); return true;
    } catch {
      setStorageReady(false); setMessage('Practice draft could not be saved. Keep this page open or export your reflection.'); return false;
    }
  }
  function update(next: PracticeSession, checkpoint = true) {
    current.current = next; setSession(next);
    if (checkpoint) persist(next);
  }
  function dispatch(event: SessionEvent) {
    update(transition(current.current, event, performance.now(), new Date().toISOString()));
  }
  useEffect(() => {
    persist(current.current);
    const visibility = () => { if (document.hidden) dispatch('INTERRUPT'); };
    const pageHide = () => dispatch('INTERRUPT');
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', pageHide);
    return () => {
      document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', pageHide);
      const next = transition(current.current, 'INTERRUPT', performance.now(), new Date().toISOString());
      current.current = next;
      try { if (next.state !== 'SAVED') localStorage.setItem(sessionKey, JSON.stringify({ ...next, lastTick: null })); } catch { /* in-memory fallback was explained before start */ }
    };
    // This lifecycle belongs to the mounted exercise, not each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (session.state !== 'RUNNING') return;
    const timer = window.setInterval(() => {
      const now = performance.now(); const next = advance(current.current, now);
      const checkpoint = now - lastCheckpoint.current >= 5000 || next.state !== 'RUNNING';
      if (checkpoint) lastCheckpoint.current = now;
      update(next, checkpoint);
    }, 250);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.state]);
  const running = session.state === 'RUNNING';
  const reflection = session.state === 'REFLECTION';
  const seconds = remainingSeconds(session);
  const canStart = exercise.source.fidelity === 'verified-excerpt' && exercise.guided.length > 0 && session.safetyAccepted && (storageReady || ephemeralAccepted);
  function finishSave() {
    if (current.current.state !== 'REFLECTION') return;
    const s = current.current;
    const entry: JournalEntry = { id: s.id, exerciseId: exercise.id, exercise: exercise.title, catalogVersion: s.catalogVersion, date: new Date().toISOString(), activeMs: s.activeMs, endReason: s.endReason, notes: s.notes, comfort: s.comfort, usefulness: s.usefulness };
    let result;
    try { result = saveEntry(localStorage, entry); }
    catch { setMessage('Your reflection was not saved. Your text is still here; export it or retry.'); return; }
    if (!result.ok) { setMessage(result.error); return; }
    update(transition(s, 'SAVE', performance.now(), new Date().toISOString()));
    onSaved(result.entries);
  }
  function changeMode(value: boolean) { dispatch('PAUSE'); setHistorical(value); }
  return <section className="panel" aria-labelledby="practice-heading">
    <button className="back" onClick={() => { dispatch('PAUSE'); onBack(); }}>← All practices</button>
    <p className="eyebrow">{exercise.discipline} · Lesson {exercise.lesson}</p><h2 id="practice-heading">{exercise.title}</h2>
    <div className="mode"><button aria-pressed={!historical} onClick={() => changeMode(false)}>Guided practice</button><button aria-pressed={historical} onClick={() => changeMode(true)}>Historical source</button></div>
    {!historical && !reflection && (exercise.id === 'finger-unfolding' || exercise.id === 'thumb-circles') && <MovementDemonstration key={exercise.id} kind={exercise.id === 'finger-unfolding' ? 'fingers' : 'thumbs'} motionAllowed={!quiet} available={session.startedAt === null}/> }
    <ExerciseInstructions exercise={exercise} historical={historical}/>
    <p role="status">{message || (session.state === 'INTERRUPTED' ? 'Practice interrupted. Background time was not counted. Review safety, then resume when ready.' : reflection ? 'Practice ended. Reflection is optional; saving records this session once.' : session.state === 'PAUSED' ? 'Practice paused. Resume when you choose.' : '')}</p>
    {!reflection && <>
      {!storageReady && <label className="toggle"><input type="checkbox" checked={ephemeralAccepted} onChange={e => setEphemeralAccepted(e.target.checked)}/> Practice without saved progress. I understand that closing this page may lose my draft.</label>}
      <label className="toggle"><input type="checkbox" checked={session.safetyAccepted} disabled={running} onChange={e => update({ ...current.current, safetyAccepted: e.target.checked })}/> I understand I can move, blink naturally, pause or stop for discomfort.</label>
      <label className="toggle"><input type="checkbox" checked={session.durationMs !== null} disabled={session.startedAt !== null} onChange={e => update({ ...current.current, durationMs: e.target.checked ? exercise.minutes * 60000 : null })}/> Use an optional practice timer</label>
      {session.durationMs !== null && <><label htmlFor="practice-duration">Selected duration — app choice, not historical progression</label><select id="practice-duration" value={session.durationMs / 1000} disabled={session.startedAt !== null} onChange={e => update({ ...current.current, durationMs: Number(e.target.value) * 1000 })}>{[30, 60, 120, 240, 300, 600, 900].map(value => <option value={value} key={value}>{value < 60 ? `${value} seconds` : `${value / 60} minute${value === 60 ? '' : 's'}`}</option>)}</select></>}
      {!historical && <GuidedSteps exerciseId={exercise.id} steps={exercise.guided} position={session.stage} onPositionChange={stage => update({ ...current.current, stage })}/>}

      {exercise.id === 'black-dot' && !historical && <VisualAttentionTarget enabled={running} motionAllowed={!quiet}/>}
      <FocusOrb progress={session.durationMs ? session.activeMs / session.durationMs : 0} running={running}/>
      <div className="timer" aria-label={seconds === null ? 'Untimed practice' : 'Time remaining'}>{seconds === null ? 'Untimed' : `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`}</div>
      <div className="actions"><button disabled={!running && !canStart} onClick={() => dispatch(running ? 'PAUSE' : 'START')}>{running ? 'Pause' : session.startedAt ? 'Resume' : 'Start'}</button><button className="secondary" disabled={!session.startedAt} onClick={() => dispatch('FINISH')}>Finish practice</button><button className="secondary" disabled={!session.startedAt} onClick={() => dispatch('STOP')}>Stop early</button><button className="secondary" onClick={() => { if (window.confirm('Reset this unsaved session and reflection? Saved journal entries will remain.')) update(createSession(crypto.randomUUID(), exercise.id, curriculumStatus.version, exercise.minutes * 60000)); }}>Reset</button></div>
    </>}
    {reflection && <><h3>Private reflection</h3><p className="muted">Active foreground time: {Math.floor(session.activeMs / 1000)} seconds. {session.endReason === 'early-stop' ? 'You stopped early; there is no penalty.' : 'This is a descriptive practice record, not a performance or intelligence score.'}</p><label htmlFor="reflection">What did you notice? (optional)</label><textarea id="reflection" value={session.notes} maxLength={10000} onChange={e => update({ ...current.current, notes: e.target.value })} rows={4}/><label htmlFor="comfort">Comfort (optional)</label><select id="comfort" value={session.comfort} onChange={e => update({ ...current.current, comfort: e.target.value })}><option value="">Skip</option><option value="1">1 — uncomfortable</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5 — comfortable</option></select><label htmlFor="usefulness">Perceived usefulness (optional)</label><select id="usefulness" value={session.usefulness} onChange={e => update({ ...current.current, usefulness: e.target.value })}><option value="">Skip</option><option value="helpful">Helpful</option><option value="not-helpful">Not helpful</option><option value="unsure">Unsure</option></select><div className="actions"><button onClick={finishSave}>Save private record</button><button className="secondary" onClick={() => exportJSON(session, 'ascend-focus-unsaved-reflection.json')}>Export unsaved reflection</button></div></>}
  </section>;
}
