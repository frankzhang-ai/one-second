// CI-only driver for simulator verification + screenshots. NEVER shipped:
// the workflow injects it into a throwaway copy of the bundle. It plays the
// real game by tapping when the real ball overlaps the real target, and
// prints "CI:<marker>" lines (Capacitor forwards console.log to stdout).
(() => {
  const log = msg => console.log('CI:' + msg);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  const S = () => window.__ONESECOND__.getState();
  const diff = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  const tap = () => $('game').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse' }));
  const frame = () => new Promise(r => requestAnimationFrame(r));
  let lastTap = 0;
  async function playUntil(score) {
    while (S().score < score) {
      await frame();
      const s = S();
      if (s.state !== 'game') { await wait(50); continue; }
      const win = Math.min(5, s.targetWidth * 0.2) * 0.85;
      if (diff(s.ballAngle, s.targetAngle) <= win && performance.now() - lastTap > 120) { lastTap = performance.now(); tap(); }
    }
  }
  async function missUntilOver() {
    while (S().state !== 'over' && S().state !== 'home') {
      await frame();
      const s = S();
      if (s.state === 'game' && diff(s.ballAngle, s.targetAngle) > 90 && performance.now() - lastTap > 400) { lastTap = performance.now(); tap(); }
    }
  }
  function waitVisibleAfterHidden() {
    return new Promise(resolve => {
      let wasHidden = document.hidden;
      const on = () => {
        if (document.hidden) { wasHidden = true; log('hidden'); }
        else if (wasHidden) { document.removeEventListener('visibilitychange', on); resolve(); }
      };
      document.addEventListener('visibilitychange', on);
    });
  }
  async function playFor(ms) {
    const until = performance.now() + ms;
    while (performance.now() < until) {
      await frame();
      const s = S();
      if (s.state !== 'game') continue;
      const win = Math.min(5, s.targetWidth * 0.2) * 0.85;
      if (diff(s.ballAngle, s.targetAngle) <= win && performance.now() - lastTap > 120) { lastTap = performance.now(); tap(); }
    }
  }
  async function run1() {
    await wait(2500);
    log('home');
    await wait(6000);
    $('play').click();
    await playUntil(5);
    log('levelup score=' + S().score + ' level=' + S().level);
    await wait(6000);
    await playUntil(9);
    log('perfect score=' + S().score + ' combo=' + S().combo);
    await playFor(12000);
    await missUntilOver();
    await wait(1200);
    log('over score=' + $('final-score').textContent.trim() + ' best=' + $('final-best').textContent.trim());
    await wait(6000);
    localStorage.setItem('ci.run1', 'done');
    document.querySelector('.sound').click();
    await wait(500);
    log('run1-done best=' + localStorage.getItem('onesecond.best') + ' sound=' + localStorage.getItem('onesecond.sound'));
  }
  async function run2() {
    await wait(2500);
    const sound = document.querySelector('.sound').getAttribute('aria-pressed');
    log('run2 best=' + $('home-best').textContent.trim() + ' soundOn=' + sound);
    document.querySelector('.sound').click(); // back on for the screenshot
    localStorage.setItem('ci.run1', 'checked');
    await wait(1500);
    log('run2-home soundOn=' + document.querySelector('.sound').getAttribute('aria-pressed'));
    await wait(6000);
    $('play').click();
    await playUntil(3);
    const back = waitVisibleAfterHidden();
    log('bg-ready');
    await back;
    await wait(1000);
    log('resumed state=' + S().state);
    await wait(4000);
    $('resume').click();
    await wait(500);
    log('bg-done state=' + S().state);
  }
  window.addEventListener('load', () => {
    log('boot native=' + !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())
      + ' safeTop=' + getComputedStyle(document.documentElement).getPropertyValue('--safe-top')
      + ' inner=' + innerWidth + 'x' + innerHeight + ' goatcounter=' + (typeof window.goatcounter)
      + ' sw=' + ('serviceWorker' in navigator) + ' audioSession=' + (navigator.audioSession ? navigator.audioSession.type : 'n/a'));
    const phase = localStorage.getItem('ci.run1');
    (phase === 'done' ? run2() : phase === 'checked' ? Promise.resolve(log('idle')) : run1()).catch(e => log('error ' + e));
  });
})();
