// Persist the best score and sound setting when storage is available.
const BEST = 'onesecond.best';
const SOUND = 'onesecond.sound';

export function getBest() {
  try {
    return Math.max(0, Number(localStorage.getItem(BEST)) || 0);
  } catch {
    return 0;
  }
}

export function saveBest(score) {
  try {
    localStorage.setItem(BEST, String(score));
  } catch {}
}

export function getSound() {
  try {
    return localStorage.getItem(SOUND) !== 'off';
  } catch {
    return true;
  }
}

export function saveSound(enabled) {
  try {
    localStorage.setItem(SOUND, enabled ? 'on' : 'off');
  } catch {}
}
