"use client";

import { useState } from "react";
import { sfx } from "../fx";
import type { GameProps } from "../types";

type Mode = "sweet" | "spicy";

const TRUTHS: Record<Mode, string[]> = {
  sweet: [
    "What was the exact moment you knew you liked me?",
    "What's one thing I do that you'd never admit is cute?",
    "What's the most romantic thing you've ever imagined us doing?",
    "If you could relive one day with me, which one?",
    "What's a compliment about me you've thought but never said out loud?",
    "What song instantly makes you think of me?",
    "What's your favourite photo of us and why that one?",
    "What do you tell your friends about me when I'm not around?",
    "What's one small thing I do that makes you feel safe?",
    "Where do you picture us in five years?",
  ],
  spicy: [
    "What was the first thing you noticed about me physically?",
    "Where's the most unexpected place you've thought about kissing me?",
    "What's something you want me to do more of when we're alone?",
    "Describe our best kiss in three words. Take your time.",
    "Which outfit of mine gets to you the most — and be honest?",
    "What's a fantasy about us you've never said out loud?",
    "When did you first want me to make a move?",
    "What's the most attractive thing I do without realising it?",
    "Rate our chemistry out of ten and then defend your answer.",
    "What's something you think about at night that you'd blush to admit?",
    "What's the boldest thing you've ever wanted to do with me?",
    "If we had the house to ourselves for 24 hours, what's the plan?",
  ],
};

const DARES: Record<Mode, string[]> = {
  sweet: [
    "Send me a voice note saying 'I love you' in your silliest voice 🎙️",
    "Text me the first three words that come to mind about me. Right now.",
    "Take a selfie making the exact face you make when I'm being annoying 📸",
    "Call me and hum our song until I guess it 🎵",
    "Write me a two-line poem. It's allowed to be terrible ✍️",
    "Describe our first date in exactly five words.",
    "Do your best impression of me and send it over 🎭",
    "Name three things you want us to do this month. Then we're doing them.",
    "Say something nice about yourself. I'll wait — and I'll agree.",
    "Send me the last photo in your camera roll. No cropping 😏",
  ],
  spicy: [
    "Kiss me somewhere you've never kissed me before 💋",
    "Whisper exactly what you want in my ear. Details matter.",
    "Give me a sixty-second neck and shoulder massage. No talking.",
    "Hold eye contact with me for thirty seconds. First one to look away loses.",
    "Recreate our first kiss, right now, properly.",
    "Send me a voice note saying my name the way you say it when we're alone 🎙️",
    "Slow dance with me. No music. No phones.",
    "Take off one thing. Jewellery counts — if you're feeling shy 😏",
    "Text me the thought about me you'd be most embarrassed to say out loud.",
    "Describe, out loud, your favourite thing I've ever done to you.",
    "Bite your lip and hold my gaze until I break first.",
    "Pick anywhere on me and kiss it for ten seconds. Your choice.",
    "Tell me one thing you want tonight. No hedging, no jokes.",
    "Trace one word on my back with your finger. I have to guess it.",
  ],
};

export default function TruthOrDare({ her, onWin }: GameProps) {
  const [mode, setMode] = useState<Mode>("sweet");
  const [kind, setKind] = useState<"truth" | "dare" | null>(null);
  const [card, setCard] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const draw = (which: "truth" | "dare") => {
    const pool = which === "truth" ? TRUTHS[mode] : DARES[mode];
    let next = pool[Math.floor(Math.random() * pool.length)];
    if (next === card && pool.length > 1) next = pool[(pool.indexOf(next) + 1) % pool.length];
    setKind(which);
    setCard(next);
    sfx.pop();
    const n = count + 1;
    setCount(n);
    if (n === 3) onWin();
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setCard(null);
    setKind(null);
    sfx.click();
  };

  return (
    <div className="stage">
      <div className="center-col">
        <div className="mode-switch" role="group" aria-label="Card deck">
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

        <p className="lede" style={{ textAlign: "center" }}>
          {mode === "spicy"
            ? `Grown-up deck unlocked. ${DARES.spicy.length} dares, ${TRUTHS.spicy.length} truths — play it just between us, ${her}.`
            : `Pick your poison, ${her}. Play it honestly — that's the whole point.`}
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button type="button" className="btn btn-primary" onClick={() => draw("truth")}>
            Truth 🤍
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => draw("dare")}>
            Dare 🔥
          </button>
        </div>

        {card && (
          <div className="pull-card" key={`${mode}-${kind}-${card}`}>
            <div>
              <span className="kicker">
                {kind === "truth" ? "Truth" : "Dare"}
                {mode === "spicy" ? " · 18+" : ""}
              </span>
              {card}
            </div>
          </div>
        )}

        {count > 0 && (
          <span className="chip">
            Cards drawn <b>{count}</b>
          </span>
        )}
      </div>
    </div>
  );
}
