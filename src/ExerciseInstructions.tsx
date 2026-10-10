import { curriculumStatus, timerLabel, type Exercise } from './exercises';

export function ExerciseInstructions({ exercise, historical }: { exercise: Exercise; historical: boolean }) {
  return <section aria-label={historical ? 'Historical source instructions' : 'Modern guided instructions'}>
    <p className="muted">Lesson {exercise.lesson} · PDF pp. {exercise.pdfPages} · printed pp. {exercise.source.printedPages.join(', ')} · Verified excerpt</p>
    {historical ? <>
      <p className="notice">Historical documentation. The English protocol is a source-grounded paraphrase. Historical claims and unsafe instructions are preserved for comparison, not endorsed.</p>
      <p>{exercise.history}</p>
      <ol>{exercise.originalProtocol.map(step => <li key={step}>{step}</li>)}</ol>
      <h3>Timing in the source</h3><p>{exercise.sourceDuration.details}</p>
      <h3>Original Russian excerpt</h3>{exercise.source.originalRussian.map(quote => <blockquote key={quote.text}><p lang="ru">{quote.text}</p><footer>PDF p. {quote.pdfPage} · printed p. {quote.printedPage}</footer></blockquote>)}
      <p className="muted">{exercise.source.transcriptionNote}</p>
      <p><a href={curriculumStatus.sourceUrl} target="_blank" rel="noreferrer">Open the archived source PDF</a></p>
      <p className="muted">{curriculumStatus.note}</p>
    </> : <>
      <p className="notice">Modern guided adaptation. Safety, accessibility and timer choices below are distinguished from the original protocol.</p>
      <ol>{exercise.guided.map(step => <li key={step}>{step}</li>)}</ol>
      <h3>Modern changes</h3><ul>{exercise.modernAdaptations.map(change => <li key={change}>{change}</li>)}</ul>
      <details><summary>Accessible alternatives and purpose</summary><ul>{exercise.accessibleAlternatives.map(item => <li key={item}>{item}</li>)}</ul><p>{exercise.objectives.join(' ')}</p><p>{exercise.prerequisites.join(' ')}</p></details>
    </>}
    <p className="muted">{timerLabel(exercise)} The practice timer uses guided safety adaptations in either tab.</p>
    <p className="notice">{exercise.notice}</p>
  </section>;
}
