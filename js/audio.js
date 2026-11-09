// Generate short tones with the browser's built-in Web Audio API.
let context;
let enabled = true;

export function setEnabled(value) {
  enabled = value;
}

// Create or resume audio after a user gesture.
export function unlock() {
  if (!context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) context = new AudioContextClass();
  }
  if (context?.state === 'suspended') context.resume().catch(() => {});
}

// iOS Safari may require a short buffer source during a user gesture before
// later oscillator tones become audible.
function gestureUnlock() {
  try {
    unlock();
    if (!context) return;
    const buffer = context.createBuffer(1, 1, context.sampleRate);
    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.value = 0;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(context.destination);
    source.start(0);
    document.removeEventListener('pointerdown', gestureUnlock);
    document.removeEventListener('touchend', gestureUnlock);
  } catch {}
}

document.addEventListener('pointerdown', gestureUnlock, { passive: true });
document.addEventListener('touchend', gestureUnlock, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && context?.state === 'suspended') context.resume().catch(() => {});
});

// Play the tone associated with a judgment or level up.
export function tone(kind) {
  if (!enabled || !context) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const time = context.currentTime;
  const frequencies = kind === 'PERFECT' ? [740, 980]
    : kind === 'GOOD' ? [520, 690]
      : kind === 'MISS' ? [210, 140] : [620, 810];

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequencies[0], time);
  oscillator.frequency.exponentialRampToValueAtTime(frequencies[1], time + 0.12);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.09, time + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(time);
  oscillator.stop(time + 0.19);
}
