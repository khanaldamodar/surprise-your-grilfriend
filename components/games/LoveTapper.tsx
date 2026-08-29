"use client";

import { useRef, useState } from "react";
import { buzz, celebrate, confettiFrom, sfx } from "../fx";
import type { GameProps } from "../types";

const TARGET = 50;

const STAGES = [
  { at: 0, text: "Tap the heart. Let's see what we're working with." },
  { at: 8, text: "Okay, warming up 🔥" },
  { at: 18, text: "The meter is starting to sweat." },
  { at: 30, text: "Structural warning: meter not rated for this." },
  { at: 42, text: "It's begging you to stop. Don't." },
];

export default function LoveTapper({ her, onWin }: GameProps) {
  const heartRef = useRef<HTMLButtonElement>(null);
  const [taps, setTaps] = useState(0);
  const [broken, setBroken] = useState(false);

  const pct = Math.min(99, Math.round((taps / TARGET) * 99));
  const stage = [...STAGES].reverse().find((s) => taps >= s.at) ?? STAGES[0];

  const tap = () => {
    const next = taps + 1;
    setTaps(next);
    sfx.pop();
    buzz(6);
    if (next % 10 === 0) confettiFrom(heartRef.current, 26);
    if (next >= TARGET && !broken) {
      setBroken(true);
      celebrate(heartRef.current);
      onWin();
    }
  };

  const reset = () => {
    setTaps(0);
    setBroken(false);
    sfx.swoosh();
  };

  return (
    <div className="stage">
      <div className="center-col">
        <p className="chase-q" style={{ marginBottom: 0 }}>
          How much do you love me?
        </p>
        <p className="lede" style={{ textAlign: "center" }}>
          There&apos;s only one way to find out. Tap.
        </p>

        <button
          ref={heartRef}
          type="button"
          onClick={tap}
          aria-label="Tap the heart"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: `clamp(80px, ${18 + Math.min(taps, TARGET) * 0.12}vw, ${120 + Math.min(taps, TARGET)}px)`,
            lineHeight: 1,
            padding: 0,
            filter: `drop-shadow(0 0 ${12 + Math.min(taps, TARGET)}px rgba(255,77,141,.8))`,
            transition: "font-size .18s var(--ease-back), filter .3s",
          }}
        >
          {broken ? "💞" : "💖"}
        </button>

        <div className="meter-track">
          <div
            className="meter-fill"
            style={{ width: broken ? "100%" : `${pct}%` }}
          />
        </div>

        <div className="meter-num grad-text">{broken ? "∞" : `${pct}%`}</div>

        <p className="lede" style={{ textAlign: "center", minHeight: 26 }}>
          {broken ? "Meter destroyed. Immeasurable. Off the charts." : stage.text}
        </p>

        <span className="chip">
          Taps <b>{taps}</b>
        </span>

        {broken && (
          <>
            <div className="win-note">
              <span className="big">You broke the love meter.</span>
              {her}, you tapped {taps} times and snapped a perfectly good instrument in half. For the
              record: mine broke a long time ago, the first time you looked at me.
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
              Fix it and go again 🔁
            </button>
          </>
        )}
      </div>
    </div>
  );
}
