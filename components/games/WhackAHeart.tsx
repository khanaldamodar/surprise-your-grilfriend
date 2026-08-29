"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buzz, celebrate, sfx } from "../fx";
import type { GameProps } from "../types";

const ROUND = 30;
const TARGET = 15;

type Pop = { hole: number; bad: boolean } | null;

export default function WhackAHeart({ her, onWin }: GameProps) {
  const [pop, setPop] = useState<Pop>(null);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [time, setTime] = useState(ROUND);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const hitRef = useRef(false);
  const popRef = useRef<Pop>(null);
  const startedAt = useRef(0);
  const popTimer = useRef<number | null>(null);

  const clearTimer = () => {
    if (popTimer.current) {
      window.clearTimeout(popTimer.current);
      popTimer.current = null;
    }
  };

  const start = () => {
    setScore(0);
    setMisses(0);
    setTime(ROUND);
    setOver(false);
    startedAt.current = Date.now();
    setRunning(true);
    sfx.click();
  };

  const stop = useCallback(() => {
    clearTimer();
    popRef.current = null;
    setPop(null);
    setRunning(false);
    setOver(true);
  }, []);

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

  /* pop scheduler — speeds up as the clock runs down */
  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const schedule = () => {
      if (cancelled) return;
      // Hearts stay up for less time the longer the round has run.
      const elapsed = (Date.now() - startedAt.current) / 1000;
      const visible = Math.max(520, 980 - elapsed * 16);
      hitRef.current = false;
      const next = { hole: Math.floor(Math.random() * 9), bad: Math.random() < 0.22 };
      popRef.current = next;
      setPop(next);

      popTimer.current = window.setTimeout(() => {
        if (cancelled) return;
        const missed = popRef.current;
        if (missed && !missed.bad && !hitRef.current) setMisses((m) => m + 1);
        popRef.current = null;
        setPop(null);
        popTimer.current = window.setTimeout(schedule, 220 + Math.random() * 260);
      }, visible);
    };

    popTimer.current = window.setTimeout(schedule, 400);
    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [running]);

  useEffect(() => {
    if (over && score >= TARGET) {
      celebrate();
      onWin();
    }
  }, [over, score, onWin]);

  const whack = (hole: number) => {
    if (!running || !pop || pop.hole !== hole || hitRef.current) return;
    hitRef.current = true;
    popRef.current = null;
    if (pop.bad) {
      sfx.bad();
      buzz(24);
      setScore((s) => Math.max(0, s - 2));
    } else {
      sfx.pop();
      buzz(10);
      setScore((s) => s + 1);
    }
    setPop(null);
  };

  return (
    <div className="stage tight">
      <div className="hud">
        <span className="chip">
          Score <b>{score}</b>
        </span>
        <span className="chip">
          Time <b>{time}s</b>
        </span>
        <span className="chip">
          Missed <b>{misses}</b>
        </span>
      </div>

      <div className="whack-grid">
        {Array.from({ length: 9 }, (_, i) => {
          const up = pop?.hole === i;
          return (
            <button
              key={i}
              type="button"
              className={`hole${up ? " up" : ""}`}
              onClick={() => whack(i)}
              aria-label={up ? "Pop the heart" : "Empty"}
            >
              <span className="mole" aria-hidden>
                {up ? (pop?.bad ? "💔" : "💗") : ""}
              </span>
            </button>
          );
        })}
      </div>

      {!running && (
        <div className="win-note">
          {over ? (
            <>
              <span className="big">
                {score >= TARGET ? `${score} hearts popped!` : `You got ${score}.`}
              </span>
              {score >= TARGET
                ? `Lightning reflexes, ${her}. Which explains how fast you stole mine.`
                : `Pop ${TARGET} to win. Careful — the broken ones cost you two.`}
              <div style={{ marginTop: 14 }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={start}>
                  Play again 🔁
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="big">Pop the hearts 💗</span>
              Tap every 💗 you see. Skip the 💔 — those cost you points. {TARGET} to win.
              <div style={{ marginTop: 14 }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={start}>
                  Start 🔨
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
