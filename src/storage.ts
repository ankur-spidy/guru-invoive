export function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

export function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export interface HistoryEntry {
  id: string;
  type: 'invoice' | 'agreement';
  label: string;
  date: string;
  data: unknown;
}

export function getHistory(): HistoryEntry[] {
  return load<HistoryEntry[]>('history', []);
}

export function addHistory(entry: Omit<HistoryEntry, 'id'>) {
  const history = getHistory();
  const newEntry = { ...entry, id: Date.now().toString() };
  save('history', [newEntry, ...history].slice(0, 50));
  return newEntry;
}

export function deleteHistory(id: string) {
  save('history', getHistory().filter(e => e.id !== id));
}
