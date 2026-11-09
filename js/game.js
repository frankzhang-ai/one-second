// Angle helpers and timing thresholds shared by the game and tests.
export const TAU = Math.PI * 2;
export const radians = degrees => degrees * Math.PI / 180;

export function angleDifference(a, b) {
  return Math.abs(((a - b + 540) % 360) - 180);
}

export function thresholds(targetWidth) {
  const half = targetWidth / 2;
  return { perfect: Math.min(5, half * 0.4), good: half };
}

export function judge(ballAngle, targetAngle, targetWidth) {
  const error = angleDifference(ballAngle, targetAngle);
  const limits = thresholds(targetWidth);
  return error <= limits.perfect ? 'PERFECT' : error <= limits.good ? 'GOOD' : 'MISS';
}

export function levelStats(level) {
  return {
    speed: Math.min(180 * Math.pow(1.12, level - 1), 520),
    targetWidth: Math.max(35 - 3 * (level - 1), 12)
  };
}

const randomAngle = () => Math.random() * 360;

// Create a fresh run with its initial difficulty and animation state.
export function newGame(best = 0) {
  return {
    state: 'game', score: 0, best, combo: 0, lives: 3, level: 1,
    ...levelStats(1), ballAngle: randomAngle(), targetAngle: randomAngle(),
    direction: 1, elapsed: 0, feedback: '', feedbackUntil: 0,
    shakeUntil: 0, particles: [], toast: '', toastUntil: 0,
    levelUp: false, lastAttempt: -Infinity
  };
}

// Judge one tap, update the run, and create success effects.
export function attempt(s, now, rng = Math.random) {
  if (s.state !== 'game' || now - s.lastAttempt < 80) return { ...s, duplicate: true };
  const rating = judge(s.ballAngle, s.targetAngle, s.targetWidth);
  const next = {
    ...s, lastAttempt: now, feedback: rating, feedbackUntil: now + 850,
    duplicate: false, levelUp: false
  };

  if (rating === 'MISS') {
    next.lives--;
    next.combo = 0;
    next.shakeUntil = now + 230;
    if (next.lives <= 0) next.state = 'over';
    return next;
  }

  next.score++;
  next.best = Math.max(next.best, next.score);
  next.combo++;
  next.direction *= -1;
  next.particles = Array.from({ length: 8 }, (_, i) => ({
    angle: i * Math.PI / 4,
    speed: 50 + rng() * 70,
    color: ['#EFB7A8', '#B9D8C5', '#C9BDE8', '#E9D99D'][i % 4],
    life: 1
  }));

  let candidate = rng() * 360;
  if (angleDifference(candidate, next.ballAngle) < 90) candidate = (candidate + 180) % 360;
  next.targetAngle = candidate;
  if (next.combo % 5 === 0) {
    next.level++;
    Object.assign(next, levelStats(next.level));
    next.toast = `LEVEL ${next.level} · FASTER`;
    next.toastUntil = now + 1400;
    next.levelUp = true;
  }
  return next;
}

// Advance motion and expire feedback and particle effects.
export function tick(s, dt, now) {
  if (s.state !== 'game') return s;
  return {
    ...s,
    ballAngle: (s.ballAngle + s.direction * s.speed * dt / 1000 + 360) % 360,
    elapsed: s.elapsed + dt,
    feedback: now < s.feedbackUntil ? s.feedback : '',
    particles: s.particles
      .map(p => ({ ...p, life: Math.max(0, p.life - dt / 480) }))
      .filter(p => p.life > 0)
  };
}
