// Bind one attempt input source to the game area.
export function bindInput(target, callback) {
  let last = -Infinity;
  let activeTouch = false;

  // Debounce attempts (the multi-touch guard lives in the pointerdown listener).
  const handle = event => {
    const now = performance.now();
    if (now - last < 80) return;
    last = now;
    callback(event);
  };

  target.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') {
      event.preventDefault();
      if (activeTouch) return;
      activeTouch = true;
    }
    handle(event);
  }, { passive: false });

  // Clear touch state even when the browser cancels or loses capture.
  const releaseTouch = event => {
    if (event.pointerType === 'touch') activeTouch = false;
  };
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    target.addEventListener(type, releaseTouch);
    window.addEventListener(type, releaseTouch);
  }

  target.addEventListener('keydown', event => {
    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault();
      handle(event);
    }
  });
  return () => {};
}
