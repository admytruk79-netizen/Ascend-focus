import { useEffect, useRef, useState } from 'react';
import { BookOpen, Brain, Compass, Home, Users, UserRound } from 'lucide-react';
import { Community } from './Community';
import { FocusOrb } from './FocusOrb';
import { PracticePlayer, readPracticeDraft } from './PracticePlayer';
import { exercises, curriculumStatus, type Exercise } from './exercises';
import { deleteEntry, exportJSON, journalKey, readJournal, type JournalEntry, type JournalResult } from './privateJournal';

type Tab = 'Today' | 'Practice' | 'Journal' | 'Community' | 'Profile';
const tabs: Tab[] = ['Today', 'Practice', 'Journal', 'Community', 'Profile'];
const navIcons = [Home, Compass, BookOpen, Users, UserRound];
function initialJournal(): JournalResult {
  try { return readJournal(localStorage); } catch { return { ok: false, error: 'Browser storage is unavailable.' }; }
}
function initialQuiet() { try { return localStorage.getItem('ascend-focus-quiet') !== 'false'; } catch { return true; } }

export default function App() {
  const [tab, setTab] = useState<Tab>('Today');
  const [active, setActive] = useState<Exercise | null>(null);
  const [journal, setJournal] = useState<JournalResult>(initialJournal);
  const [draft, setDraft] = useState(readPracticeDraft);
  const [quiet, setQuiet] = useState(initialQuiet);
  const [query, setQuery] = useState('');
  const [discipline, setDiscipline] = useState('All');
  const [journalQuery, setJournalQuery] = useState('');
  const [message, setMessage] = useState('');
  const main = useRef<HTMLElement>(null);
  const entries = journal.ok ? journal.entries : [];
  useEffect(() => { main.current?.focus(); }, [tab, active]);
  useEffect(() => {
    const refresh = () => { setJournal(initialJournal()); setDraft(readPracticeDraft()); };
    window.addEventListener('storage', refresh); return () => window.removeEventListener('storage', refresh);
  }, []);
  function navigate(next: Tab) {
    if (active) {
      try { if (!localStorage.getItem('ascend-focus-session-v1') && !window.confirm('This practice could not be saved. Leave and lose the in-memory draft?')) return; }
      catch { if (!window.confirm('Storage is unavailable. Leave and lose the in-memory draft?')) return; }
    }
    setActive(null); setTab(next); setMessage(''); setDraft(readPracticeDraft());
  }
  function openExercise(exercise: Exercise) {
    const savedDraft = readPracticeDraft();
    if (savedDraft && (savedDraft.exerciseId !== exercise.id || savedDraft.catalogVersion !== curriculumStatus.version) && !window.confirm('Starting this practice replaces your previous unsaved draft. Export the draft from Profile first if you want to keep it. Continue?')) return;
    setActive(exercise);
  }
  function saved(next: JournalEntry[]) { setJournal({ ok: true, entries: next }); setActive(null); setDraft(null); setTab('Journal'); setMessage('Private practice record saved on this device.'); }
  function remove(id: string) {
    if (!window.confirm('Delete this private entry from this device? Export first if you want a copy.')) return;
    try { const result = deleteEntry(localStorage, id); if (result.ok) { setJournal(result); setMessage('Entry deleted.'); } else setMessage(result.error); }
    catch { setMessage('Could not delete the entry.'); }
  }
  const matches = exercises.filter(e => (discipline === 'All' || e.discipline === discipline) && `${e.id} ${e.title} ${e.discipline} Lesson ${e.lesson} ${e.guided.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  const resume = draft && draft.catalogVersion === curriculumStatus.version ? exercises.find(e => e.id === draft.exerciseId) : null;
  return <div className={quiet ? 'app quiet' : 'app'}>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header><span className="mark" aria-hidden="true">A</span><div><small>ASCEND</small><h1>Focus</h1></div><span className="edition">THE ART OF ATTENTION</span></header>
    <main id="main-content" tabIndex={-1} ref={main}>
      {active ? <PracticePlayer key={active.id} exercise={active} quiet={quiet} onBack={() => navigate('Practice')} onSaved={saved}/> : <>
        {tab === 'Today' && <>
          <p className="eyebrow">YOUR PRACTICE TODAY</p><h2>Return to attention.</h2><p className="muted">A quiet space for deliberate practice. Your journal is saved on this device.</p>
          {resume && <section className="entry"><h3>Continue your practice</h3><p>{resume.title} · Your draft is saved. Background time is not counted.</p><button onClick={() => openExercise(resume)}>Review and resume</button></section>}
          {draft && !resume && <p className="notice">A saved practice uses an older catalog revision. It has not been resumed automatically. Export the draft before starting a new practice.</p>}
          <div className="feature"><FocusOrb progress={0} running={false}/><span>OPTIONAL · 5 MIN</span><h3>Comfortable Stillness</h3><p>A relaxed starting practice with movement allowed. This is a fixed suggestion; adaptive ranking is not active.</p><button onClick={() => openExercise(exercises.find(e => e.id === 'stillness')!)}>Begin practice</button></div>
          <h3>Explore your path</h3><div className="tiles">{['Attention', 'Will', 'Imagination', 'Mental Rapport'].map(x => <button className="tile" key={x} onClick={() => { setDiscipline(x); navigate('Practice'); }}><Brain size={22} aria-hidden="true"/>{x}</button>)}</div>
        </>}
        {tab === 'Practice' && <>
          <p className="eyebrow">THE LIBRARY</p><h2>Practices</h2><p className="muted">{curriculumStatus.note} Historical protocols and modern adaptations remain separate.</p>
          <label htmlFor="practice-search">Search practices or lessons</label><input id="practice-search" value={query} onChange={e => setQuery(e.target.value)}/>
          <label htmlFor="discipline-filter">Discipline</label><select id="discipline-filter" value={discipline} onChange={e => setDiscipline(e.target.value)}>{['All', 'Attention', 'Will', 'Imagination', 'Mental Rapport'].map(x => <option key={x}>{x}</option>)}</select>
          {!matches.length && <p className="empty">No matching practices. <button className="secondary" onClick={() => { setQuery(''); setDiscipline('All'); }}>Clear filters</button></p>}
          <div className="cards">{matches.map(e => <button className="exercise" key={e.id} onClick={() => openExercise(e)}><span className="eyebrow">{e.discipline} · Optional guided timer {e.minutes} min</span><strong>{e.title}</strong><span className="muted">Lesson {e.lesson} · PDF pp. {e.pdfPages}</span><span className="open">Explore →</span></button>)}</div>
        </>}
        {tab === 'Journal' && <>
          <p className="eyebrow">PERSONAL RECORD</p><h2>Your journal</h2><p className="muted">Private by default, stored only in this browser. Clearing browser storage erases these entries. Export a backup when needed.</p>
          <p role="status">{message || (!journal.ok ? journal.error : '')}</p>
          <label htmlFor="journal-search">Search private entries</label><input id="journal-search" value={journalQuery} onChange={e => setJournalQuery(e.target.value)}/>
          {entries.length ? entries.filter(e => `${e.exercise} ${e.notes}`.toLowerCase().includes(journalQuery.toLowerCase())).map(e => <article className="entry" key={e.id}><small>{e.date}</small><h3>{e.exercise}</h3><p>{e.notes || 'Session recorded without a written reflection.'}</p>{e.activeMs !== undefined && <p className="muted">Active time: {Math.floor(e.activeMs / 1000)} seconds{e.endReason === 'early-stop' ? ' · stopped early' : ''}. {e.comfort ? `Comfort: ${e.comfort}/5.` : ''} {e.usefulness ? `Perceived usefulness: ${e.usefulness}.` : ''}</p>}<button className="secondary" onClick={() => remove(e.id)}>Delete entry</button></article>) : journal.ok && <div className="empty">No entries yet. Finish a practice to begin your journal.</div>}
          <button className="secondary" disabled={!journal.ok} onClick={() => exportJSON(entries, 'ascend-focus-journal.json')}>Export journal JSON</button>
          {!journal.ok && <button className="secondary" onClick={() => { try { exportJSON({ rawJournal: localStorage.getItem(journalKey) }, 'ascend-focus-journal-recovery.json'); } catch { setMessage('Browser storage cannot be read for export.'); } }}>Export original data for recovery</button>}
        </>}
        {tab === 'Community' && <Community/>}
        {tab === 'Profile' && <>
          <p className="eyebrow">PREFERENCES</p><h2>Your practice, your pace.</h2><label className="toggle"><input type="checkbox" checked={quiet} onChange={e => { setQuiet(e.target.checked); try { localStorage.setItem('ascend-focus-quiet', String(e.target.checked)); } catch { setMessage('Preference applies now but could not be saved.'); } }}/> Quiet mode — reduced visual effects</label>
          <p className="muted">Quiet mode is on by default. Operating-system reduced motion is always respected. No account required for solo practice.</p>
          <p role="status">{message}</p><button className="secondary" disabled={!journal.ok} onClick={() => exportJSON(entries, 'ascend-focus-journal.json')}>Export private journal</button>
          {draft && <button className="secondary" onClick={() => exportJSON(draft, 'ascend-focus-practice-draft.json')}>Export practice draft</button>}
          <p className="notice">Historical teachings are not medical advice or evidence of telepathy. Stop any practice causing discomfort.</p>
        </>}
      </>}
    </main>
    <nav aria-label="Main navigation">{tabs.map((t, i) => { const Icon = navIcons[i]!; return <button className={tab === t ? 'selected' : ''} key={t} onClick={() => navigate(t)} aria-current={tab === t ? 'page' : undefined}><Icon size={21} aria-hidden="true"/><span>{t}</span></button>; })}</nav>
  </div>;
}
