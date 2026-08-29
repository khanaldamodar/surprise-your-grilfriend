"use client";

import { useEffect, useRef } from "react";

const GLYPHS = ["💖", "💕", "💗", "🌸", "✨", "💘", "🤍"];

/**
 * Everything that lives behind the page: gradient stage, drifting blobs,
 * a canvas of floating hearts, and the custom cursor.
 */
export default function Ambient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  /* ----- floating hearts ----- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = window.innerWidth < 640 ? 16 : 30;
    const parts = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h + h * 0.2,
      size: 12 + Math.random() * 20,
      speed: 0.22 + Math.random() * 0.6,
      sway: 0.4 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.18 + Math.random() * 0.42,
      glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    }));

    let raf = 0;
    let t = 0;

    const frame = () => {
      t += 0.01;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y -= p.speed;
        if (p.y < -50) {
          p.y = h + 40;
          p.x = Math.random() * w;
        }
        const x = p.x + Math.sin(t * p.sway + p.phase) * 26;
        ctx.globalAlpha = p.alpha;
        ctx.font = `${p.size}px serif`;
        ctx.fillText(p.glyph, x, p.y);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    if (!reduced) {
      raf = requestAnimationFrame(frame);
    } else {
      // Still draw one static field so the page is not empty.
      parts.forEach((p) => {
        ctx.globalAlpha = p.alpha;
        ctx.font = `${p.size}px serif`;
        ctx.fillText(p.glyph, p.x, p.y % h);
      });
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ----- custom cursor ----- */
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      const target = e.target as Element | null;
      const hot = !!target?.closest?.("button, a, input, .game-card, .mem-card, .hole, .puz-tile");
      ring.classList.toggle("hot", hot);
    };

    const frame = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(frame);
    };

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(frame);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="bg-stage" aria-hidden>
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>
      <div className="grain" aria-hidden />
      <canvas id="hearts-canvas" ref={canvasRef} aria-hidden />
      <div className="cursor-dot" ref={dotRef} aria-hidden />
      <div className="cursor-ring" ref={ringRef} aria-hidden />
    </>
  );
}
