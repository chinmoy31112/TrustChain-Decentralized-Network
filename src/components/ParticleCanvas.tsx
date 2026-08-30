'use client';

import React, { useEffect, useRef, useCallback } from 'react';

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return () => {};

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Fewer particles + skip connecting lines = much better perf
    const particleCount = Math.min(Math.floor(width / 40), 30);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = ['#00d4aa', '#7c3aed', '#9d65ff', '#ffffff'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    // Throttle to ~30fps instead of 60fps to save CPU
    let lastFrame = 0;
    const FRAME_INTERVAL = 1000 / 30;

    const render = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(render);

      if (timestamp - lastFrame < FRAME_INTERVAL) return;
      lastFrame = timestamp;

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      // Draw connecting lines only between nearby particles (limited to reduce O(n²) cost)
      ctx.globalAlpha = 0.04;
      ctx.strokeStyle = '#00d4aa';
      ctx.lineWidth = 0.5;
      const maxLines = 20;
      let lineCount = 0;
      for (let i = 0; i < particles.length && lineCount < maxLines; i++) {
        for (let j = i + 1; j < particles.length && lineCount < maxLines; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          // Use squared distance to avoid sqrt
          const distSq = dx * dx + dy * dy;
          if (distSq < 10000) { // ~100px
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            lineCount++;
          }
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    const cleanup = init();
    return cleanup;
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      id="particles"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
