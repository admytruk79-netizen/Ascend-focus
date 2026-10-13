import transcriptions from './sourceTranscriptions.json';

export function exerciseSourceParagraphs(exerciseId: string) {
  const selection = transcriptions.exerciseSelections.find(s => s.exerciseId === exerciseId);
  if (!selection) return [];
  const paragraphs = transcriptions.passages.flatMap(p => p.paragraphs);
  return selection.paragraphIds.map(id => {
    const paragraph = paragraphs.find(p => p.id === id);
    if (!paragraph) throw new Error(`Missing source paragraph: ${id}`);
    return paragraph;
  });
}
