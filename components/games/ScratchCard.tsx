"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { celebrate, sfx } from "../fx";
import type { GameProps } from "../types";

const PRIZES = [
  "One free hug, redeemable at any hour, no questions asked 🤗",
  "A whole evening where you pick the movie and I don't complain once 🍿",
  "Breakfast in bed, made badly but with enormous love 🥞",
  "One long walk, hand in hand, phones on silent 🌙",
  "Unlimited forehead kisses. Non-expiring. 💋",
  "I'll do the dishes for a week. Yes, really. 🧽",
  "A surprise date, planned entirely by me 🎁",
  "One argument where I say 'you're right' immediately 🏳️",
];

export default function ScratchCard({ her, onWin }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const wonRef = useRef(false);
  const [index, setIndex] = useState(() => Math.floor(Math.random() * PRIZES.length));
  const [revealed, setRevealed] = useState(false);
  const [collected, setCollected] = useState(0);

  const paintCover = useCallback(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box) return;
    const w = box.clientWidth;
    const h = box.clientHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#5d2050");
    g.addColorStop(0.5, "#8a3568");
    g.addColorStop(1, "#43163b");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,.82)";
    ctx.font = "600 17px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Scratch me 🪙", w / 2, h / 2 - 6);
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.fillText("(drag your finger or mouse across)", w / 2, h / 2 + 18);
  }, []);

  useEffect(() => {
    paintCover();
    const onResize = () => {
      if (!wonRef.current) paintCover();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [index, paintCover]);

  const clearedPercent = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return 0;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    // Sample every 40th pixel — plenty accurate, much cheaper.
    for (let i = 3; i < data.length; i += 160) {
      if (data[i] === 0) clear += 1;
    }
    return clear / (data.length / 160);
  };

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || revealed) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const r = canvas.getBoundingClientRect();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(e.clientX - r.left, e.clientY - r.top, 26, 0, Math.PI * 2);
    ctx.fill();

    if (clearedPercent() > 0.52) {
      wonRef.current = true;
      setRevealed(true);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setCollected((c) => c + 1);
      celebrate();
      onWin();
    }
  };

  const nextCard = () => {
    sfx.click();
    wonRef.current = false;
    setRevealed(false);
    setIndex((i) => (i + 1 + Math.floor(Math.random() * (PRIZES.length - 1))) % PRIZES.length);
  };

  return (
    <div className="stage">
      <div className="center-col">
        <p className="lede" style={{ textAlign: "center" }}>
          Every card is a real coupon. {her}, I will honour every single one.
        </p>

        <div className="scratch-box" ref={boxRef}>
          <div className="scratch-prize">{PRIZES[index]}</div>
          <canvas
            className="scratch-canvas"
            ref={canvasRef}
            onPointerDown={(e) => {
              drawing.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              scratch(e);
            }}
            onPointerMove={scratch}
            onPointerUp={() => {
              drawing.current = false;
            }}
            onPointerLeave={() => {
              drawing.current = false;
            }}
            style={{ display: revealed ? "none" : "block" }}
          />
        </div>

        <span className="chip">
          Coupons unlocked <b>{collected}</b>
        </span>

        <button type="button" className="btn btn-primary" onClick={nextCard}>
          {revealed ? "Another coupon 🎟️" : "Skip this one ⏭️"}
        </button>
      </div>
    </div>
  );
}
