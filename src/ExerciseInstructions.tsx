import transcriptions from './sourceTranscriptions.json';
import { curriculumStatus, historicalLessonNotes, timerLabel, type Exercise } from './exercises';

export function ExerciseInstructions({ exercise, historical }: { exercise: Exercise; historical: boolean }) {
  const lessonNotes = historicalLessonNotes[exercise.lesson];
  const transcription = transcriptions.passages.find(p => p.exerciseId === exercise.id || ('relatedExerciseIds' in p && Array.isArray(p.relatedExerciseIds) && p.relatedExerciseIds.includes(exercise.id)));
  return <section aria-label={historical ? 'Historical source instructions' : 'Modern guided instructions'}>
    <p className="muted">Lesson {exercise.lesson} · PDF pp. {exercise.pdfPages} · printed pp. {exercise.source.printedPages.join(', ')} · Verified excerpt</p>
    {historical ? <>
      <p className="notice">Historical documentation. The English protocol is a source-grounded paraphrase. Historical claims and unsafe instructions are preserved for comparison, not endorsed.</p>
      <p>{exercise.history}</p>
      <ol>{exercise.originalProtocol.map(step => <li key={step}>{step}</li>)}</ol>
      <h3>Timing in the source</h3><p>{exercise.sourceDuration.details}</p>
      <h3>Original Russian excerpt</h3>{exercise.source.originalRussian.map(quote => <blockquote key={quote.text}><p lang="ru">{quote.text}</p><footer>PDF p. {quote.pdfPage} · printed p. {quote.printedPage}</footer></blockquote>)}
      <p className="muted">{exercise.source.transcriptionNote}</p>
      {transcription && <details><summary>Russian transcription and English translation · draft</summary>
        <p className="notice">Draft compared with the scans; independent proofreading is pending. English is an editorial translation of the Russian edition, not the original English text. Historical claims are not endorsed.</p>
        <p className="muted">{transcription.coverage} {transcription.editorialPolicy}</p>
        {transcription.paragraphs.map(paragraph => <section key={paragraph.id} aria-label={`Source paragraph ${paragraph.id}`}>
          <h4>PDF p. {paragraph.pdfPage} · printed p. {paragraph.printedPage}</h4>
          {paragraph.boundary !== 'complete-paragraph' && <p className="muted">Page boundary: {paragraph.boundary.replaceAll('-', ' ')}</p>}
          <h5>Russian transcription</h5><p lang="ru">{paragraph.russian}</p>
          <h5>English translation</h5><p lang="en">{paragraph.english}</p>
        </section>)}
        <h4>Editorial questions</h4><ul>{transcription.uncertainties.map(item => <li key={item}>{item}</li>)}</ul>
      </details>}
      {lessonNotes && <details><summary>Additional historical lesson advice</summary><p className="muted">Lesson {exercise.lesson} · PDF pp. {lessonNotes.pdfPages.join(', ')} · printed pp. {lessonNotes.printedPages.join(', ')}</p><ul>{lessonNotes.paraphrases.map(item => <li key={item}>{item}</li>)}</ul>{lessonNotes.originalRussian.map(quote => <blockquote key={quote.text}><p lang="ru">{quote.text}</p><footer>PDF p. {quote.pdfPage} · printed p. {quote.printedPage}</footer></blockquote>)}<p className="notice">{lessonNotes.notice}</p></details>}

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
