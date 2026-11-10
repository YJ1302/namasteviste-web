import React, { useEffect, useRef } from 'react';

// Glowing spice embers drifting upward (saffron, turmeric, chili).
const COLORS = ['255,159,28', '255,201,60', '230,57,70', '255,236,200'];

export default function SpiceParticles({ density = 70 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, visible = true;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const make = (anywhere) => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: Math.random() * 2.2 + 0.4,
      vy: Math.random() * 0.6 + 0.2,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.005,
      alpha: Math.random() * 0.6 + 0.4,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    });

    resize();
    const particles = Array.from({ length: density }, () => make(true));

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.vy;
        p.sway += p.swaySpeed;
        p.x += Math.sin(p.sway) * 0.4;
        if (p.y < -10) particles[i] = make(false);
        const a = p.alpha * Math.max(0, Math.min(1, (p.y / h) * 1.4));
        ctx.fillStyle = `rgba(${p.c},${a * 0.15})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${p.c},${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    tick();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [density]);

  return <canvas ref={ref} className="mx-particles" aria-hidden="true" />;
}
