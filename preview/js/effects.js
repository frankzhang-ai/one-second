import { arpeggio, fanfare, sparkle } from './audio.js';

const colors = ['#EFB7A8', '#B9D8C5', '#C9BDE8', '#E9D99D', '#FAF7F0'];

export function createEffects() {
  const flash = document.createElement('div');
  flash.className = 'milestone-flash';
  flash.setAttribute('aria-hidden', 'true');
  const confetti = document.createElement('canvas');
  confetti.className = 'milestone-confetti';
  confetti.setAttribute('aria-hidden', 'true');
  const title = document.createElement('div');
  title.className = 'milestone-title';
  title.setAttribute('aria-hidden', 'true');
  const bestPop = document.createElement('div');
  bestPop.className = 'new-best-pop';
  bestPop.textContent = 'NEW BEST!';
  bestPop.setAttribute('aria-hidden', 'true');
  document.body.append(flash, confetti, title, bestPop);

  let pieces = [], raf = 0, flashTimer = 0, titleTimer = 0, bestTimer = 0, burstTimer = 0, pulseTimer = 0, shakeTimer = 0;
  let lastTime = 0;
  const ctx = confetti.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    confetti.width = Math.round(innerWidth * dpr);
    confetti.height = Math.round(innerHeight * dpr);
    confetti.style.width = `${innerWidth}px`;
    confetti.style.height = `${innerHeight}px`;
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function burst(count, y = -20) {
    for (let i = 0; i < count; i++) pieces.push({
      x: Math.random() * innerWidth, y: y - Math.random() * 80,
      vx: (Math.random() - .5) * 150, vy: 60 + Math.random() * 180,
      size: 4 + Math.random() * 9, angle: Math.random() * 6.28,
      spin: (Math.random() - .5) * 8, life: 1.4 + Math.random() * .45,
      color: colors[Math.floor(Math.random() * colors.length)],
      circle: Math.random() < .32
    });
    if (pieces.length > 240) pieces.splice(0, pieces.length - 240);
  }

  function animate(time) {
    raf = 0;
    const dt = Math.min((time - (lastTime || time)) / 1000, .04);
    lastTime = time;
    ctx?.clearRect(0, 0, innerWidth, innerHeight);
    pieces = pieces.filter(p => p.life > 0 && p.y < innerHeight + 30);
    for (const p of pieces) {
      p.life -= dt; p.vy += 290 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.angle += p.spin * dt;
      if (!ctx) continue;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.min(1, p.life * 1.6);
      if (p.circle) { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * .7);
      ctx.restore();
    }
    if (pieces.length) raf = requestAnimationFrame(animate);
    else ctx?.clearRect(0, 0, innerWidth, innerHeight);
  }

  function milestone(combo) {
    let tier, label, size;
    if (combo === 10) { tier = 'tier2'; label = 'AMAZING!'; size = 10; }
    else if (combo >= 20 && combo % 10 === 0) {
      tier = 'tier3';
      const names = ['UNSTOPPABLE!', 'LEGENDARY!', 'GODLIKE!'];
      label = names[(combo / 10 - 2) % names.length]; size = 7.5;
    } else if (combo >= 5 && combo % 5 === 0 && combo % 10 !== 0) {
      tier = 'tier1'; label = ''; size = 0;
    } else return null;

    flash.classList.remove('show', 'big');
    void flash.offsetWidth;
    flash.classList.add('show');
    if (tier !== 'tier1') flash.classList.add('big');
    clearTimeout(flashTimer); flashTimer = setTimeout(() => flash.classList.remove('show', 'big'), 500);
    arpeggio();
    if (tier !== 'tier1') {
      fanfare(tier === 'tier3' ? 3 : 2);
      burst(100);
      if (tier === 'tier3') { clearTimeout(burstTimer); burstTimer = setTimeout(() => { burst(100, innerHeight * .3); if (!raf) raf = requestAnimationFrame(animate); }, 190); document.body.classList.add('pastel-pulse'); clearTimeout(pulseTimer); pulseTimer = setTimeout(() => document.body.classList.remove('pastel-pulse'), 1600); }
      if (!reduced.matches) document.getElementById('game')?.classList.add('milestone-shake');
      clearTimeout(shakeTimer); shakeTimer = setTimeout(() => document.getElementById('game')?.classList.remove('milestone-shake'), reduced.matches ? 0 : 420);
      title.textContent = label; title.style.setProperty('--title-size', `clamp(2rem, ${size}vw, ${tier === 'tier3' ? '2.8rem' : '3.6rem'})`);
      title.classList.remove('show'); void title.offsetWidth; title.classList.add('show');
      clearTimeout(titleTimer); titleTimer = setTimeout(() => title.classList.remove('show'), 1200);
      if (tier === 'tier3' && typeof navigator.vibrate === 'function') navigator.vibrate([60, 40, 60, 40, 120]);
    }
    if (pieces.length && !raf) raf = requestAnimationFrame(animate);
    return tier;
  }

  function newBest() {
    bestPop.classList.remove('show'); void bestPop.offsetWidth; bestPop.classList.add('show');
    clearTimeout(bestTimer); bestTimer = setTimeout(() => bestPop.classList.remove('show'), 850);
    sparkle();
  }

  function reset() {
    pieces = []; if (raf) cancelAnimationFrame(raf); raf = 0; lastTime = 0;
    ctx?.clearRect(0, 0, innerWidth, innerHeight);
    clearTimeout(flashTimer); clearTimeout(titleTimer); clearTimeout(bestTimer); clearTimeout(burstTimer); clearTimeout(pulseTimer); clearTimeout(shakeTimer);
    flash.classList.remove('show', 'big'); title.classList.remove('show'); bestPop.classList.remove('show');
    document.body.classList.remove('pastel-pulse');
    document.getElementById('game')?.classList.remove('milestone-shake');
  }
  return { milestone, newBest, reset };
}
