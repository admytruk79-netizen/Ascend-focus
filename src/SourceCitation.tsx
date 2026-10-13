import { atkinsonSource } from './exercises';

export function SourceCitation() {
  return <aside className="source-citation" aria-label="Historical book source">
    <p><strong>{atkinsonSource.author}</strong> · {atkinsonSource.edition}</p>
    <p><cite lang="ru">{atkinsonSource.titleRussian}</cite></p>
    <p className="muted">{atkinsonSource.titleEnglishTranslation} — title translated from Russian. {atkinsonSource.scanPages} scanned PDF pages.</p>
    <a href={atkinsonSource.url} target="_blank" rel="noreferrer">Read the original 1910 Russian PDF</a>
  </aside>;
}
