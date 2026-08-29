"use client";

import { useEffect, useRef, useState } from "react";
import { celebrate, sfx } from "../fx";
import type { GameProps } from "../types";

type Mode = "sweet" | "spicy";
type Slice = { label: string; emoji: string };

const SLICES: Record<Mode, Slice[]> = {
  sweet: [
    { label: "Movie night", emoji: "🍿" },
    { label: "Dinner date", emoji: "🍝" },
    { label: "Long drive", emoji: "🚗" },
    { label: "Ice cream", emoji: "🍦" },
    { label: "Beach walk", emoji: "🏖️" },
    { label: "Cook together", emoji: "👩‍🍳" },
    { label: "Stargazing", emoji: "🌌" },
    { label: "Lazy cuddles", emoji: "🛋️" },
  ],
  spicy: [
    { label: "Full massage", emoji: "💆" },
    { label: "Shower together", emoji: "🚿" },
    { label: "Your rules tonight", emoji: "👑" },
    { label: "My rules tonight", emoji: "🖤" },
    { label: "Netflix & 'chill'", emoji: "😏" },
    { label: "Wine & no plans", emoji: "🍷" },
    { label: "Slow dance, late", emoji: "💃" },
    { label: "Truth or dare, 18+", emoji: "🔥" },
  ],
};

const COLORS: Record<Mode, string[]> = {
  sweet: ["#ff4d8d", "#a86bff", "#ff9ec7", "#ffd48a", "#ff6fa5", "#8f5cf0", "#ffb3d1", "#ffc46b"],
  spicy: ["#ff2d6f", "#7b1fa2", "#ff7a3d", "#c2185b", "#ff4d8d", "#5e35b1", "#ff9068", "#ad1457"],
};

const SIZE = 320;

export default function SpinWheel({ her, onWin }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("sweet");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const slices = SLICES[mode];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const palette = COLORS[mode];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);

    const r = SIZE / 2;
    const seg = (Math.PI * 2) / slices.length;

    slices.forEach((slice, i) => {
      const start = i * seg - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(r, r);
      ctx.arc(r, r, r - 4, start, start + seg);
      ctx.closePath();
      ctx.fillStyle = palette[i % palette.length];
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.35)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(r, r);
      ctx.rotate(start + seg / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#2a0b22";
      ctx.font = "600 13px system-ui, sans-serif";
      ctx.fillText(slice.label, r - 42, 5);
      ctx.font = "20px serif";
      ctx.fillText(slice.emoji, r - 16, 7);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(r, r, 26, 0, Math.PI * 2);
    ctx.fillStyle = "#150512";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.4)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = "20px serif";
    ctx.textAlign = "center";
    ctx.fillText(mode === "spicy" ? "🔥" : "💘", r, r + 7);
  }, [mode, slices]);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    sfx.swoosh();

    const turns = 5 + Math.floor(Math.random() * 3);
    const extra = Math.random() * 360;
    const next = rotation + turns * 360 + extra;
    setRotation(next);

    window.setTimeout(() => {
      const seg = 360 / slices.length;
      const normalized = (((360 - (next % 360)) % 360) + 360) % 360;
      const idx = Math.floor(normalized / seg) % slices.length;
      setResult(idx);
      setSpinning(false);
      celebrate();
      onWin();
    }, 4700);
  };

  const switchMode = (next: Mode) => {
    if (next === mode || spinning) return;
    setMode(next);
    setResult(null);
    sfx.click();
  };

  return (
    <div className="stage">
      <div className="center-col">
        <div className="mode-switch" role="group" aria-label="Wheel deck">
          <button type="button" aria-pressed={mode === "sweet"} onClick={() => switchMode("sweet")}>
            😇 Sweet
          </button>
          <button
            type="button"
            className="spicy"
            aria-pressed={mode === "spicy"}
            onClick={() => switchMode("spicy")}
          >
            🔥 18+
          </button>
        </div>

        <div className="wheel-wrap">
          <span className="wheel-pin" aria-hidden>
            🔻
          </span>
          <canvas
            className="wheel-canvas"
            ref={canvasRef}
            style={{ transform: `rotate(${rotation}deg)` }}
            aria-label={`Wheel of ${mode === "spicy" ? "after-dark" : "date night"} plans`}
          />
        </div>

        <button type="button" className="btn btn-primary" onClick={spin} disabled={spinning}>
          {spinning ? "Spinning… 🌀" : "Spin the wheel 🎡"}
        </button>

        {result !== null && (
          <div className="win-note">
            <span className="big">
              {slices[result].emoji} {slices[result].label}
            </span>
            The wheel has spoken, {her} — and I&apos;m contractually obliged to obey it. Name the day
            and it&apos;s happening.
          </div>
        )}
      </div>
    </div>
  );
}
