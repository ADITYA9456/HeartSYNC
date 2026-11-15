// Hand-written canvas confetti. One burst, ~2.5s, no loop. Returns a cancel fn.
export function burstConfetti(colors, { duration = 2500 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '70',
  });
  document.body.appendChild(canvas);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = (canvas.width = window.innerWidth * dpr);
  const h = (canvas.height = window.innerHeight * dpr);
  const ctx = canvas.getContext('2d');

  const count = window.innerWidth < 500 ? 70 : 120;
  const pieces = Array.from({ length: count }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
    const speed = (6 + Math.random() * 9) * dpr;
    return {
      x: w / 2,
      y: h * 0.62,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: (5 + Math.random() * 6) * dpr,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });

  const start = performance.now();
  let raf = 0;
  let done = false;

  function cleanup() {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    canvas.remove();
  }

  function frame(now) {
    const t = now - start;
    if (t >= duration) return cleanup();
    ctx.clearRect(0, 0, w, h);
    const fade = t > duration - 500 ? (duration - t) / 500 : 1;
    ctx.globalAlpha = Math.max(0, fade);
    for (const p of pieces) {
      p.vy += 0.28 * dpr;
      p.vx *= 0.992;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return cleanup;
}
