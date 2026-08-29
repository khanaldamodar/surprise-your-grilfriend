"use client";

import { useState } from "react";
import { celebrate, sfx } from "../fx";
import type { GameProps } from "../types";

const REASONS = [
  "The way you laugh at your own jokes before you finish them.",
  "You make ordinary days feel like something worth remembering.",
  "You listen properly — not just waiting for your turn to talk.",
  "Your hand fits mine like it was measured for it.",
  "You're brave in ways you don't give yourself credit for.",
  "You remember the small things I mention once.",
  "The face you make when you're concentrating. Devastating.",
  "You forgive me faster than I deserve.",
  "You make me want to be a better version of myself.",
  "Your excitement about things you love is contagious.",
  "You look beautiful at 3pm and at 3am, and I have evidence.",
  "You call me out, kindly, when I need it.",
  "Every silence with you is comfortable.",
  "You turn my worst days around with one message.",
  "You're the person I want to tell everything to first.",
  "The way you take care of people without being asked.",
  "You're stubborn about the things that actually matter.",
  "You dance badly and completely without shame. I love it.",
  "You make me laugh until my face hurts.",
  "You believed in me before there was any proof.",
  "Your voice is my favourite sound in any room.",
  "You make 'home' a person instead of a place.",
  "You're still the most interesting person I've ever met.",
  "You never make me feel like too much.",
  "Because loving you has been the easiest thing I've ever done.",
];

export default function ReasonsJar({ her, onWin }: GameProps) {
  const [remaining, setRemaining] = useState<number[]>(() => REASONS.map((_, i) => i));
  const [current, setCurrent] = useState<number | null>(null);

  const pull = () => {
    if (remaining.length === 0) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    const left = remaining.filter((i) => i !== pick);
    setCurrent(pick);
    setRemaining(left);
    sfx.good();
    if (left.length === 0) {
      celebrate();
      onWin();
    }
  };

  const refill = () => {
    setRemaining(REASONS.map((_, i) => i));
    setCurrent(null);
    sfx.swoosh();
  };

  const pulled = REASONS.length - remaining.length;

  return (
    <div className="stage">
      <div className="center-col">
        <span style={{ fontSize: 50 }} aria-hidden>
          🫙
        </span>

        <div className="pull-card" key={current ?? "empty"}>
          {current === null ? (
            <div>
              <span className="kicker">The jar</span>
              {REASONS.length} reasons I love you, {her}. Pull one out.
            </div>
          ) : (
            <div>
              <span className="kicker">
                Reason {pulled} of {REASONS.length}
              </span>
              {REASONS[current]}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button type="button" className="btn btn-primary" onClick={pull} disabled={remaining.length === 0}>
            {remaining.length === 0 ? "Jar is empty 🤍" : "Pull a reason 💌"}
          </button>
          {pulled > 0 && (
            <button type="button" className="btn btn-ghost" onClick={refill}>
              Refill the jar 🔁
            </button>
          )}
        </div>

        {remaining.length === 0 && (
          <div className="win-note">
            <span className="big">That&apos;s all {REASONS.length}.</span>
            And that was just what fit in the jar. Ask me again tomorrow and I&apos;ll have more.
          </div>
        )}
      </div>
    </div>
  );
}
