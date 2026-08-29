"use client";

import { useState } from "react";
import { celebrate, sfx } from "../fx";
import type { GameProps } from "../types";

type Riddle = { emoji: string; answer: string; options: string[]; note: string };

const RIDDLES: Riddle[] = [
  {
    emoji: "🍿🎬🛋️",
    answer: "Movie night in",
    options: ["Movie night in", "Trip to the cinema", "Cooking show"],
    note: "You'll fall asleep halfway through. I'll let you.",
  },
  {
    emoji: "🕯️🍝🍷",
    answer: "Candlelit dinner",
    options: ["Fast food run", "Candlelit dinner", "Picnic"],
    note: "I'll even iron a shirt.",
  },
  {
    emoji: "🎒⛰️🌄",
    answer: "Sunrise hike",
    options: ["Beach day", "Sunrise hike", "Museum trip"],
    note: "You'll complain for an hour and love it for a lifetime.",
  },
  {
    emoji: "🚗🎶🌙",
    answer: "Late night drive",
    options: ["Late night drive", "Bus tour", "Road trip abroad"],
    note: "Your playlist. My driving. No destination.",
  },
  {
    emoji: "🧁☕📖",
    answer: "Café afternoon",
    options: ["Library date", "Bakery class", "Café afternoon"],
    note: "Two hours, one dessert, zero plans.",
  },
  {
    emoji: "🌊🏖️👣",
    answer: "Walk on the beach",
    options: ["Pool day", "Walk on the beach", "Boat ride"],
    note: "Shoes in hand, the good kind of quiet.",
  },
  {
    emoji: "🎡🍭🎯",
    answer: "Carnival date",
    options: ["Carnival date", "Shopping trip", "Concert"],
    note: "I will lose at every game and still win.",
  },
  {
    emoji: "🌌🔭🫂",
    answer: "Stargazing",
    options: ["Camping", "Stargazing", "Rooftop party"],
    note: "A blanket, the sky, and absolutely nowhere to be.",
  },
];

export default function EmojiDate({ her, onWin }: GameProps) {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const current = RIDDLES[step];
  const correct = picked === current?.answer;

  const choose = (option: string) => {
    if (picked) return;
    setPicked(option);
    if (option === current.answer) {
      setScore((s) => s + 1);
      sfx.good();
    } else {
      sfx.bad();
    }
  };

  const next = () => {
    setPicked(null);
    if (step + 1 >= RIDDLES.length) {
      setDone(true);
      celebrate();
      onWin();
    } else {
      setStep((s) => s + 1);
      sfx.click();
    }
  };

  if (done) {
    return (
      <div className="stage">
        <div className="center-col">
          <span style={{ fontSize: 56 }}>🎬</span>
          <div className="win-note">
            <span className="big">
              {score} / {RIDDLES.length} decoded
            </span>
            That&apos;s eight dates on the table, {her}. Pick your favourite and consider it booked —
            I&apos;m free every single one of those nights.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stage">
      <div className="q-bar">
        <i style={{ width: `${(step / RIDDLES.length) * 100}%` }} />
      </div>

      <div className="center-col">
        <span className="chip">
          Riddle <b>{step + 1}</b> / {RIDDLES.length} · Score <b>{score}</b>
        </span>

        <p className="emoji-riddle" aria-label={`Emoji riddle: ${current.emoji}`}>
          {current.emoji}
        </p>
        <p className="lede" style={{ textAlign: "center" }}>
          Which date am I describing?
        </p>

        <div className="q-opts" style={{ width: "min(420px, 100%)" }}>
          {current.options.map((o) => (
            <button
              key={o}
              type="button"
              className="q-opt"
              onClick={() => choose(o)}
              style={
                picked
                  ? o === current.answer
                    ? { borderColor: "rgba(107,227,198,.55)", background: "rgba(107,227,198,.18)" }
                    : o === picked
                      ? { borderColor: "rgba(255,77,141,.55)", background: "rgba(255,77,141,.14)" }
                      : { opacity: 0.5 }
                  : undefined
              }
            >
              {o}
            </button>
          ))}
        </div>

        {picked && (
          <>
            <div className="win-note">
              {correct ? "Exactly right. " : `It was “${current.answer}”. `}
              {current.note}
            </div>
            <button type="button" className="btn btn-primary" onClick={next}>
              {step + 1 >= RIDDLES.length ? "See the plan 💌" : "Next riddle →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
