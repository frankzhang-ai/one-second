const KEY = 'onesecond.leaderboard';
const NAME_KEY = 'onesecond.lastName';

export function qualifies(list, score) {
  if (!(score > 0)) return false;
  return list.length < 10 || score > Number(list[list.length - 1]?.score || 0);
}

export function insert(list, entry) {
  const added = { ...entry };
  const sorted = [...list.map(item => ({ item, added: false })), { item: added, added: true }].sort((a, b) => Number(b.item.score) - Number(a.item.score) || Date.parse(a.item.date) - Date.parse(b.item.date)).slice(0, 10);
  return { list: sorted.map(row => row.item), index: sorted.findIndex(row => row.added) };
}

export function getLeaderboard() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(value) ? value.slice(0, 10).map(item => ({ name: String(item.name || 'Player'), score: Number(item.score) || 0, date: String(item.date || '') })) : [];
  } catch { return []; }
}

export function saveLeaderboard(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 10))); } catch {}
}

export function getLastName() {
  try { return localStorage.getItem(NAME_KEY) || ''; } catch { return ''; }
}

export function saveLastName(name) {
  try { localStorage.setItem(NAME_KEY, name); } catch {}
}
