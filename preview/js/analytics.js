// Cookie-less GoatCounter event tracking. Events that happen during startup
// wait briefly for the optional remote script, then disappear silently.
export function scoreBand(score) {
  if (score < 5) return '0-4';
  if (score < 10) return '5-9';
  if (score < 20) return '10-19';
  return '20+';
}

export function track(name, title) {
  return; // preview: analytics disabled
  try {
    if (window.goatcounter && typeof window.goatcounter.count === 'function') {
      window.goatcounter.count({ path: name, title: title || name, event: true });
    }
  } catch {}
}

export function trackWhenReady(name, title) {
  return; // preview: analytics disabled
  const started = Date.now();
  const attempt = () => {
    try {
      if (window.goatcounter && typeof window.goatcounter.count === 'function') {
        track(name, title);
        return;
      }
    } catch { return; }
    if (Date.now() - started < 10000) setTimeout(attempt, 250);
  };
  attempt();
}

export function trackReturns(now = new Date()) {
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  try {
    const first = localStorage.getItem('onesecond.first');
    if (!first) {
      localStorage.setItem('onesecond.first', date);
      return;
    }
    if (date <= first) return;
    if (localStorage.getItem('onesecond.lastReturn') !== date) {
      trackWhenReady('return-d1');
      localStorage.setItem('onesecond.lastReturn', date);
    }
    const firstDate = new Date(`${first}T00:00:00`);
    const today = new Date(`${date}T00:00:00`);
    const days = Math.round((today - firstDate) / 86400000);
    if (days === 1 && localStorage.getItem('onesecond.lastDay1') !== date) {
      trackWhenReady('return-day1');
      localStorage.setItem('onesecond.lastDay1', date);
    }
  } catch {}
}
