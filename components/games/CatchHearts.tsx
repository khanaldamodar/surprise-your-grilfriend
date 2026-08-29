"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buzz, celebrate, sfx } from "../fx";
import type { GameProps } from "../types";

type Item = { id: number; x: number; y: number; speed: number; bad: boolean; glyph: string };

const ROUND = 30;
const GOOD = ["💖", "💕", "💗", "🌹", "✨"];
const BAD = ["💔", "🥀"];

export default function CatchHearts({ her, onWin }: GameProps) {
  const arenaRef = useRef<HTMLDivElement>(null);
  const basketRef = useRef(50); // percent across the arena
  const itemsRef = useRef<Item[]>([]);
  const livesRef = useRef(3);
  const idRef = useRef(0);
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const spawnRef = useRef(0);

  const [items, setItems] = useState<Item[]>([]);
  const [basket, setBasket] = useState(50);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(ROUND);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    setRunning(false);
    setOver(true);
  }, []);

  const start = () => {
    itemsRef.current = [];
    idRef.current = 0;
    spawnRef.current = 0;
    lastRef.current = 0;
    livesRef.current = 3;
    setItems([]);
    setScore(0);
    setLives(3);
    setTime(ROUND);
    setOver(false);
    setRunning(true);
    sfx.click();
  };

  /* countdown */
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      setTime((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          stop();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [running, stop]);

  /* main loop */
  useEffect(() => {
    if (!running) return;
    const arena = arenaRef.current;
    if (!arena) return;

    const frame = (now: number) => {
      const h = arena.clientHeight;
      const dt = lastRef.current ? Math.min(48, now - lastRef.current) : 16;
      lastRef.current = now;

      spawnRef.current -= dt;
      if (spawnRef.current <= 0) {
        spawnRef.current = 520 + Math.random() * 420;
        const bad = Math.random() < 0.24;
        itemsRef.current.push({
          id: (idRef.current += 1),
          x: 6 + Math.random() * 88,
          y: -34,
          speed: 0.075 + Math.random() * 0.075,
          bad,
          glyph: bad ? BAD[Math.floor(Math.random() * BAD.length)] : GOOD[Math.floor(Math.random() * GOOD.length)],
        });
      }

      const catchY = h - 62;
      const kept: Item[] = [];

      for (const it of itemsRef.current) {
        it.y += it.speed * dt * (h / 340);
        const nearBasket = it.y >= catchY && it.y <= h - 12;
        if (nearBasket && Math.abs(it.x - basketRef.current) < 11) {
          if (it.bad) {
            sfx.bad();
            buzz(24);
            livesRef.current = Math.max(0, livesRef.current - 1);
            setLives(livesRef.current);
            if (livesRef.current === 0) stop();
          } else {
            sfx.pop();
            setScore((s) => s + 1);
          }
          continue;
        }
        if (it.y < h + 40) kept.push(it);
      }

      itemsRef.current = kept;
      setItems([...kept]);
      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastRef.current = 0;
    };
  }, [running, stop]);

  /* celebrate a good round once it ends */
  useEffect(() => {
    if (over && score >= 10) {
      celebrate();
      onWin();
    }
  }, [over, score, onWin]);

  const move = (clientX: number) => {
    const arena = arenaRef.current;
    if (!arena) return;
    const r = arena.getBoundingClientRect();
    const pct = Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100));
    basketRef.current = pct;
    setBasket(pct);
  };

  return (
    <div className="stage tight">
      <div className="hud">
        <span className="chip">
          Caught <b>{score}</b>
        </span>
        <span className="chip">
          Time <b>{time}s</b>
        </span>
        <span className="chip">
          Hearts <b>{"💗".repeat(lives) || "—"}</b>
        </span>
      </div>

      <div
        className="catch-arena"
        ref={arenaRef}
        onPointerMove={(e) => move(e.clientX)}
        onPointerDown={(e) => move(e.clientX)}
      >
        {items.map((it) => (
          <span key={it.id} className="falling" style={{ left: `${it.x}%`, top: it.y, transform: "translateX(-50%)" }}>
            {it.glyph}
          </span>
        ))}

        <span className="basket" style={{ left: `${basket}%` }} aria-hidden>
          🧺
        </span>

        {!running && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              gap: 14,
              background: "rgba(10, 2, 8, .6)",
              backdropFilter: "blur(3px)",
              padding: 20,
              textAlign: "center",
            }}
          >
            {over ? (
              <div>
                <p style={{ fontSize: 21, margin: "0 0 6px" }}>
                  {score >= 10 ? "You caught them all 💘" : "Round over 💫"}
                </p>
                <p className="lede" style={{ margin: "0 auto 16px" }}>
                  {score >= 10
                    ? `${score} hearts. ${her}, you have a gift for catching those.`
                    : `${score} caught. Need 10 to win my (already yours) heart. One more go?`}
                </p>
                <button type="button" className="btn btn-primary" onClick={start}>
                  Play again 🔁
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 20, margin: "0 0 6px" }}>Catch the falling hearts 💖</p>
                <p className="lede" style={{ margin: "0 auto 16px" }}>
                  Move the basket with your finger or mouse. Dodge the broken ones — you get three.
                </p>
                <button type="button" className="btn btn-primary" onClick={start}>
                  Start catching 🧺
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
