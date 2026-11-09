// Draw the ring, target, moving ball, and short-lived hit particles.
const colors = {
  ink: '#353431', ivory: '#FAF7F0', peach: '#EFB7A8',
  mint: '#B9D8C5', lavender: '#C9BDE8', butter: '#E9D99D'
};

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = 1;

  // Match the canvas backing store to its displayed size.
  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Paint the gameplay scene in canvas coordinates.
  function draw(state, now) {
    if (!width || !height) resize();
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.36;
    const angle = degrees => degrees * Math.PI / 180 - Math.PI / 2;

    ctx.save();
    if (now < state.shakeUntil) {
      ctx.translate(Math.sin(now * 0.11) * 3, Math.cos(now * 0.13) * 2);
    }

    // The outer guide stays faint; the main lavender ring carries the shape.
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#e5dfd3';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = colors.lavender;
    ctx.lineWidth = Math.min(width, height) * 0.027;
    ctx.stroke();

    // Highlight the timing window with a softly glowing mint arc.
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, angle(state.targetAngle - state.targetWidth / 2), angle(state.targetAngle + state.targetWidth / 2));
    ctx.strokeStyle = colors.mint;
    ctx.lineWidth = Math.min(width, height) * 0.034;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#9fc6ad99';
    ctx.shadowBlur = 9;
    ctx.stroke();
    ctx.restore();

    const ballAngle = angle(state.ballAngle);
    const bx = cx + Math.cos(ballAngle) * radius;
    const by = cy + Math.sin(ballAngle) * radius;

    // A small inner guide keeps the ball's orbit easy to read.
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 21, 0, Math.PI * 2);
    ctx.strokeStyle = '#eee9df';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(bx, by, 17, 0, Math.PI * 2);
    ctx.fillStyle = '#EFB7A855';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bx, by, 9, 0, Math.PI * 2);
    ctx.fillStyle = colors.peach;
    ctx.shadowColor = '#c8867480';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Fade particles outward from the ball after a successful hit.
    for (const particle of state.particles) {
      const distance = (1 - particle.life) * particle.speed;
      ctx.globalAlpha = particle.life;
      ctx.beginPath();
      ctx.arc(
        bx + Math.cos(particle.angle) * distance,
        by + Math.sin(particle.angle) * distance,
        3.5 * particle.life,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = particle.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  resize();
  return { draw, resize };
}
