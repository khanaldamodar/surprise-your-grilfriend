"use client";

import { useEffect, useRef, useState } from "react";
import { celebrate, sfx } from "../fx";
import type { GameProps } from "../types";

const OPENERS = ["You are", "You're honestly", "Somehow you're", "On top of everything, you're", "Genuinely, you're"];

const ADJECTIVES = [
  "ridiculously",
  "unfairly",
  "quietly",
  "effortlessly",
  "dangerously",
  "impossibly",
  "consistently",
  "outrageously",
];

const ENDINGS = [
  "beautiful, and you don't even notice.",
  "kind in a way that changes rooms.",
  "funny — and you know exactly when to be.",
  "smart, and it's extremely attractive.",
  "the best part of my day.",
  "the reason my phone is always in my hand.",
  "someone I'd choose again, every time.",
  "impossible to get over. I've tried. Failed.",
];

const REELS = [OPENERS, ADJECTIVES, ENDINGS];

export default function ComplimentSlots({ her, onWin }: GameProps) {
  const [slots, setSlots] = useState([0, 0, 0]);
  const [spinning, setSpinning] = useState(false);
  const [spins, setSpins] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearInterval(t));
      timers.current = [];
    },
    [],
  );

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    sfx.swoosh();

    timers.current.forEach((t) => window.clearInterval(t));
    timers.current = [];

    REELS.forEach((reel, r) => {
      const cycle = window.setInterval(() => {
        setSlots((prev) => {
          const next = [...prev];
          next[r] = Math.floor(Math.random() * reel.length);
          return next;
        });
        sfx.click();
      }, 70);
      timers.current.push(cycle);

      window.setTimeout(
        () => {
          window.clearInterval(cycle);
          setSlots((prev) => {
            const next = [...prev];
            next[r] = Math.floor(Math.random() * reel.length);
            return next;
          });
          sfx.pop();
          if (r === REELS.length - 1) {
            setSpinning(false);
            setSpins((s) => {
              const n = s + 1;
              if (n === 3) {
                celebrate();
                onWin();
              }
              return n;
            });
          }
        },
        900 + r * 520,
      );
    });
  };

  return (
    <div className="stage">
      <div className="center-col">
        <p className="lede" style={{ textAlign: "center" }}>
          A machine that only produces true statements about {her}. Pull the lever.
        </p>

        <div className="pull-card" style={{ minHeight: 190 }}>
          <div>
            <span className="kicker">{spinning ? "Spinning…" : "The verdict"}</span>
            <span style={{ display: "block", fontSize: "clamp(18px, 3vw, 24px)", lineHeight: 1.5 }}>
              {OPENERS[slots[0]]} <b style={{ color: "var(--gold)" }}>{ADJECTIVES[slots[1]]}</b>{" "}
              {ENDINGS[slots[2]]}
            </span>
          </div>
        </div>

        <button type="button" className="btn btn-primary" onClick={spin} disabled={spinning}>
          {spinning ? "🎰 Rolling…" : spins === 0 ? "Pull the lever 🎰" : "Again 🔁"}
        </button>

        {spins > 0 && (
          <span className="chip">
            Compliments generated <b>{spins}</b> · possible combinations{" "}
            <b>{OPENERS.length * ADJECTIVES.length * ENDINGS.length}</b>
          </span>
        )}
      </div>
    </div>
  );
}
