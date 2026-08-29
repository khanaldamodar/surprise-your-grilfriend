"use client";

import { useRef, useState } from "react";
import { buzz, celebrate, sfx } from "../fx";
import type { GameProps } from "../types";

const REPLIES = [
  "Hmm. Let me make that Yes a little easier to see…",
  "That No is looking smaller already, isn't it?",
  "Interesting choice. Adjusting the buttons accordingly.",
  "The Yes button is doing push-ups. The No button is not.",
  "You can keep clicking. I have infinite patience and one goal.",
  "Almost microscopic now. Bless it.",
  "Squint and you can still see it. Barely.",
  "And… it's gone. Physics gave up on it.",
];

export default function BeMine({ her, onWin }: GameProps) {
  const yesRef = useRef<HTMLButtonElement>(null);
  const [tries, setTries] = useState(0);
  const [said, setSaid] = useState(false);

  const noGone = tries >= REPLIES.length;

  const pressNo = () => {
    setTries((t) => t + 1);
    sfx.bad();
    buzz(10);
  };

  const sayYes = () => {
    setSaid(true);
    celebrate(yesRef.current);
    onWin();
  };

  if (said) {
    return (
      <div className="stage">
        <div className="center-col">
          <span style={{ fontSize: 62 }}>💍</span>
          <div className="win-note">
            <span className="big">Forever it is.</span>
            {her}, you just signed a legally-binding (in my heart) agreement to be adored,
            annoyed, fed snacks, and loved out loud. No refunds. No take-backs.
          </div>
        </div>
      </div>
    );
  }

  const yesScale = 1 + tries * 0.22;
  const noScale = Math.max(0, 1 - tries * 0.13);

  return (
    <div className="stage">
      <div className="center-col" style={{ minHeight: 300, alignContent: "center" }}>
        <p className="chase-q" style={{ marginBottom: 8 }}>
          Will you be mine, {her}? <span aria-hidden>💐</span>
        </p>
        <p className="lede" style={{ textAlign: "center" }}>
          Take your time. Choose freely. The buttons are completely neutral and fair.
        </p>

        <div
          className="chase-btns"
          style={{ marginTop: 26, minHeight: 90, alignItems: "center" }}
        >
          <button
            ref={yesRef}
            type="button"
            className="btn btn-primary"
            style={{
              transform: `scale(${yesScale})`,
              transition: "transform .35s var(--ease-back)",
            }}
            onClick={sayYes}
          >
            Yes 💖
          </button>

          {!noGone && (
            <button
              type="button"
              className="btn btn-no"
              style={{
                transform: `scale(${noScale}) rotate(${tries * 7}deg)`,
                opacity: noScale,
                transition: "transform .35s var(--ease-back), opacity .35s",
              }}
              onClick={pressNo}
            >
              No
            </button>
          )}
        </div>

        <p className="taunt" key={tries}>
          {noGone ? "The No button has been retired permanently 🕊️" : tries > 0 ? REPLIES[tries - 1] : ""}
        </p>
      </div>
    </div>
  );
}
