import { newGame, attempt, tick } from './game.js';
import { createRenderer } from './render.js';
import { bindInput } from './input.js';
import { getBest, saveBest, getSound, saveSound } from './storage.js';
import { setEnabled, unlock, tone } from './audio.js';
import { track, trackReturns, scoreBand } from './analytics.js';
import { isNative, platform, haptic, initNative } from './native.js';

// Cache app elements and initialize the current run.
const $ = id => document.getElementById(id);
const home = $('home');
const game = $('game');
const over = $('over');
const pauseOverlay = $('pause-overlay');
let best = getBest();
let state = null;
let paused = false;
let lastFrame = 0;
let anim = 0;
let newBestThisRun = false;
const renderer = createRenderer($('board'));
let tapsThisRun = 0;
let runsThisPage = 0;
const tapHint = document.querySelector('.tap-hint');
trackReturns();

// Switch between the three main screens.
function show(screen) {
  for (const element of [home, game, over]) element.classList.add('hidden');
  screen.classList.remove('hidden');
}

// Keep stored and displayed best scores in sync.
function updateBest(score) {
  if (score > best) {
    best = score;
    saveBest(best);
  }
  $('home-best').textContent = best;
  $('final-best').textContent = best;
}

// Reflect the current run in the HUD and feedback labels.
function updateUI() {
  if (!state) return;
  $('score').textContent = state.score;
  $('combo').innerHTML = `COMBO&nbsp; ${state.combo}`;
  $('level').textContent = `LEVEL ${state.level}`;
  $('lives').setAttribute('aria-label', `${state.lives} lives`);
  [...$('lives').children].forEach((dot, index) => dot.classList.toggle('lost', index >= state.lives));

  const feedback = $('feedback');
  if (state.feedback) {
    feedback.textContent = state.feedback;
    feedback.className = `feedback show ${state.feedback.toLowerCase()}`;
  } else {
    feedback.className = 'feedback';
  }
  const toast = $('toast');
  if (state.toast) {
    toast.textContent = state.toast;
    toast.className = 'toast show';
  }
}

// Start a run directly from a Play control.
function start() {
  unlock();
  runsThisPage++;
  track('game-start');
  if (runsThisPage === 2) track('second-game');
  tapsThisRun = 0;
  tapHint.classList.remove('faded');
  newBestThisRun = false;
  state = newGame(best);
  paused = false;
  pauseOverlay.classList.add('hidden');
  show(game);
  updateUI();
  lastFrame = performance.now();
}

// Show the final score and save a new record when a run ends.
function finish() {
  track('game-over', `score ${scoreBand(state.score)}`);
  updateBest(state.score);
  $('final-score').textContent = state.score;
  $('new-best').classList.toggle('hidden', !newBestThisRun);
  // Briefly lock the game-over buttons so the losing tap (or its trailing
  // click) cannot land on "Play again" and instantly restart the run.
  over.classList.add('locked');
  setTimeout(() => over.classList.remove('locked'), 700);
  show(over);
}

// Advance animation and draw each active game frame.
function frame(now) {
  anim = requestAnimationFrame(frame);
  if (!state || state.state !== 'game' || paused) return;
  const dt = Math.min(now - lastFrame, 50);
  lastFrame = now;
  state = tick(state, dt, now);
  renderer.draw(state, now);
  updateUI();
  if (state.state === 'over') finish();
}

// Score a single game area tap or keyboard attempt.
function playAttempt() {
  if (!state || paused || state.state !== 'game') return;
  unlock();
  const previousBest = best;
  state = attempt(state, performance.now());
  if (state.duplicate) return;
  tapsThisRun++;
  if (tapsThisRun >= 3) tapHint.classList.add('faded');
  if (state.score > previousBest) {
    newBestThisRun = true;
    updateBest(state.score);
  }
  if (state.feedback) {
    if (state.feedback === 'PERFECT' || state.feedback === 'GOOD') haptic('hit');
    if (state.feedback === 'MISS') haptic('miss');
    tone(state.feedback);
    // Restart the feedback animation even when the same rating repeats.
    const feedback = $('feedback');
    feedback.className = 'feedback';
    void feedback.offsetWidth;
    updateUI();
    if (state.levelUp) tone('LEVEL');
  }
  if (state.state === 'over') finish();
}

// Bind game input once on the section, excluding interactive controls.
$('play').addEventListener('click', start);
$('again').addEventListener('click', start);
$('menu').addEventListener('click', () => {
  state = null;
  show(home);
});
bindInput(game, playAttempt);

// Pause and resume without allowing the pause tap to become an attempt.
function setPaused(value) {
  paused = value;
  pauseOverlay.classList.toggle('hidden', !paused);
  if (!paused) lastFrame = performance.now();
}
$('pause').addEventListener('pointerdown', event => {
  event.preventDefault();
  event.stopPropagation();
  setPaused(true);
}, { passive: false });
$('resume').addEventListener('click', () => setPaused(false));
$('quit').addEventListener('click', () => {
  setPaused(false);
  state = null;
  show(home);
});

// Persist and apply the sound preference.
let sound = getSound();
function refreshSound() {
  setEnabled(sound);
  document.querySelectorAll('.sound').forEach(button => {
    button.classList.toggle('off', !sound);
    button.setAttribute('aria-pressed', String(sound));
  });
}
document.querySelectorAll('.sound').forEach(button => button.addEventListener('click', () => {
  sound = !sound;
  saveSound(sound);
  refreshSound();
  if (sound) {
    unlock();
    tone('GOOD');
  }
}));
refreshSound();
updateBest(best);

// Pause on app backgrounding and resize the canvas when needed.
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state?.state === 'game' && !paused) setPaused(true);
});
window.addEventListener('resize', () => renderer.resize());
window.addEventListener('orientationchange', () => setTimeout(() => renderer.resize(), 100));
document.addEventListener('touchmove', event => event.preventDefault(), { passive: false });
document.addEventListener('gesturestart', event => event.preventDefault());
document.addEventListener('dblclick', event => event.preventDefault());
requestAnimationFrame(frame);
setTimeout(() => $('launch').classList.add('done'), 800);
setTimeout(() => $('launch').remove(), 1250);

// Expose the stable read-only state shape for tests and automation.
window.__ONESECOND__ = { getState() { return state ? Object.freeze({ state: paused ? 'paused' : state.state, score: state.score, best, combo: state.combo, lives: state.lives, level: state.level, speed: state.speed, targetWidth: state.targetWidth, ballAngle: state.ballAngle, targetAngle: state.targetAngle }) : Object.freeze({ state: 'home', score: 0, best, combo: 0, lives: 3, level: 1, speed: 180, targetWidth: 35, ballAngle: 0, targetAngle: 0 }); } };

if (isNative) {
  if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(registrations => registrations.forEach(registration => registration.unregister())).catch(() => {});
} else if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});

let pageviewSent = false;
function trackPageviewWhenReady() {
  if (pageviewSent) return;
  if (window.goatcounter?.count) {
    pageviewSent = true;
    window.goatcounter.count({ path: '/app/' + platform, title: 'ONE SECOND ' + platform });
  } else setTimeout(trackPageviewWhenReady, 100);
}
if (isNative) trackPageviewWhenReady();

initNative({ onBack: () => {
  if (state?.state === 'game' && !paused) setPaused(true);
  else if (paused) { setPaused(false); state = null; show(home); }
  else if (state?.state === 'over') { state = null; show(home); }
  else window.Capacitor?.Plugins?.App?.exitApp();
} });
