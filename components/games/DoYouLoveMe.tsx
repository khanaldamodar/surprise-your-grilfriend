"use client";

import { useRef, useState } from "react";
import { buzz, celebrate, sfx } from "../fx";
import type { GameProps } from "../types";

const TAUNTS = [
  "Nice try. Catch it if you can 😏",
  "The No button is scared of you.",
  "It said it has somewhere else to be.",
  "Still running. Still in love.",
  "You're persistent. I like that about you.",
  "No is simply not an option today.",
  "It's getting tired… you're getting warmer 🔥",
  "Okay it's basically begging now.",
  "Last chance for the poor thing.",
];

const BTN_W = 116;
const BTN_H = 48;

export default function DoYouLoveMe({ her, onWin }: GameProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const [dodges, setDodges] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [said, setSaid] = useState(false);

  const gone = dodges >= TAUNTS.length;

  const flee = () => {
    if (said || gone) return;
    const field = fieldRef.current;
    if (!field) return;
    const r = field.getBoundingClientRect();
    const maxX = Math.max(8, r.width - BTN_W - 12);
    const maxY = Math.max(8, r.height - BTN_H - 12);
    // Jump somewhere clearly different from where it currently sits.
    let x = 0;
    let y = 0;
    for (let i = 0; i < 6; i += 1) {
      x = 8 + Math.random() * maxX;
      y = 8 + Math.random() * maxY;
      if (!pos || Math.hypot(x - pos.x, y - pos.y) > 110) break;
    }
    setPos({ x, y });
    setDodges((d) => d + 1);
    sfx.swoosh();
    buzz(8);
  };

  const sayYes = () => {
    setSaid(true);
    celebrate(yesRef.current);
    onWin();
  };

  const yesScale = 1 + Math.min(dodges, 9) * 0.13;

  if (said) {
    return (
      <div className="stage">
        <div className="center-col">
          <span style={{ fontSize: 62 }}>💞</span>
          <div className="win-note">
            <span className="big">I knew it, {her}.</span>
            You just made a button, a website, and one very lucky person extremely happy.
            The No button never stood a chance — and neither did I, the day I met you.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stage">
      <div className="chase-field" ref={fieldRef}>
        <div style={{ width: "100%" }}>
          <p className="chase-q">
            {her}, do you love me? <span aria-hidden>🥺</span>
          </p>

          <div className="chase-btns">
            <button
              ref={yesRef}
              type="button"
              className="btn btn-primary"
              style={{ transform: `scale(${yesScale})`, transition: "transform .3s var(--ease-back)" }}
              onClick={sayYes}
            >
              Yes 💖
            </button>

            {!gone && pos === null && (
              <button
                type="button"
                className="btn btn-no"
                onMouseEnter={flee}
                onFocus={flee}
                onTouchStart={(e) => {
                  e.preventDefault();
                  flee();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  flee();
                }}
              >
                No
              </button>
            )}
          </div>

          <p className="taunt" key={dodges}>
            {gone
              ? "The No button rage-quit and ran off the screen 🏃‍♀️💨 Only one option left…"
              : dodges > 0
                ? TAUNTS[dodges - 1]
                : "Go on. Pick one. No pressure at all."}
          </p>
        </div>

        {!gone && pos !== null && (
          <button
            type="button"
            className="btn btn-no loose"
            style={{ left: pos.x, top: pos.y, width: BTN_W, height: BTN_H }}
            onMouseEnter={flee}
            onFocus={flee}
            onTouchStart={(e) => {
              e.preventDefault();
              flee();
            }}
            onClick={(e) => {
              e.preventDefault();
              flee();
            }}
          >
            No
          </button>
        )}
      </div>
    </div>
  );
}
