import type { PracticeSession } from './practiceSession';
export const journalKey = 'ascend-focus-journal-v1';
export const sessionKey = 'ascend-focus-session-v1';
export type JournalEntry = { id: string; exercise: string; date: string; notes: string; exerciseId?: string; catalogVersion?: number; activeMs?: number; endReason?: PracticeSession['endReason']; comfort?: string; usefulness?: string };
export type LocalStoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type JournalResult = { ok: true; entries: JournalEntry[] } | { ok: false; error: string };
export function decodeJournal(raw: string | null): JournalResult {
  if (!raw) return { ok: true, entries: [] };
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data) || data.some(e => !e || typeof e !== 'object' || typeof e.id !== 'string' || !e.id || typeof e.exercise !== 'string' || typeof e.date !== 'string' || typeof e.notes !== 'string' || (e.activeMs !== undefined && (!Number.isFinite(e.activeMs) || e.activeMs < 0)))) throw new Error();
    if (new Set(data.map(e => e.id)).size !== data.length) throw new Error();
    return { ok: true, entries: data as JournalEntry[] };
  } catch { return { ok: false, error: 'Saved journal data could not be read. It has not been overwritten. Export the original data before repairing it.' }; }
}
export function readJournal(storage: LocalStoragePort): JournalResult {
  try { return decodeJournal(storage.getItem(journalKey)); }
  catch { return { ok: false, error: 'Browser storage is unavailable. Existing entries have not been changed.' }; }
}
export function saveEntry(storage: LocalStoragePort, entry: JournalEntry): JournalResult {
  const current = readJournal(storage);
  if (!current.ok) return current;
  // Read the latest data before writing, and use session identity for retry safety.
  if (current.entries.some(e => e.id === entry.id)) return current;
  const entries = [entry, ...current.entries];
  try { storage.setItem(journalKey, JSON.stringify(entries)); return { ok: true, entries }; }
  catch { return { ok: false, error: 'Your reflection was not saved. Storage may be full or unavailable. Your text is still here; retry or export it.' }; }
}
export function deleteEntry(storage: LocalStoragePort, id: string): JournalResult {
  const current = readJournal(storage);
  if (!current.ok) return current;
  const entries = current.entries.filter(e => e.id !== id);
  try { storage.setItem(journalKey, JSON.stringify(entries)); return { ok: true, entries }; }
  catch { return { ok: false, error: 'Could not delete this entry. Saved data has not changed.' }; }
}
export function exportJSON(value: unknown, filename: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
