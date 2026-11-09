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

// Short celebratory notes used by combo milestones. These share the same
// context and preference gate as the ordinary judgment sounds.
export function arpeggio() {
  if (!enabled || !context) return;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  const start = context.currentTime;
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const time = start + index * 0.06;
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.075, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.start(time); oscillator.stop(time + 0.23);
  });
}

export function fanfare(tier = 3) {
  if (!enabled || !context) return;
  const start = context.currentTime;
  const filter = context.createBiquadFilter();
  const master = context.createGain();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1900, start);
  master.gain.setValueAtTime(0.0001, start);
  master.gain.exponentialRampToValueAtTime(0.11, start + 0.04);
  master.gain.setValueAtTime(0.09, start + 0.58);
  master.gain.exponentialRampToValueAtTime(0.0001, start + 1.08);
  filter.connect(master); master.connect(context.destination);
  const notes = [392, 523.25, 659.25, 783.99, 1046.5];
  notes.forEach((frequency, index) => {
    const time = start + index * 0.1;
    for (const [type, detune] of [['sawtooth', -7], ['square', 7]]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, time);
      oscillator.detune.setValueAtTime(detune, time);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(type === 'sawtooth' ? 0.16 : 0.07, time + 0.025);
      gain.gain.setValueAtTime(0.12, start + 0.58);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.07);
      oscillator.connect(gain); gain.connect(filter);
      oscillator.start(time); oscillator.stop(start + 1.09);
    }
  });
}

export function sparkle() {
  if (!enabled || !context) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const time = context.currentTime;
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(1320, time);
  oscillator.frequency.exponentialRampToValueAtTime(1760, time + 0.07);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.045, time + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.13);
  oscillator.connect(gain); gain.connect(context.destination);
  oscillator.start(time); oscillator.stop(time + 0.14);
}
