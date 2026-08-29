"use client";

import { useState } from "react";
import { celebrate, sfx } from "../fx";
import type { GameProps } from "../types";

type Q = { q: string; options: { text: string; reply: string }[] };

const QUESTIONS: Q[] = [
  {
    q: "How much do I love you?",
    options: [
      { text: "A lot", reply: "Understated. Try again with feeling." },
      { text: "To the moon and back", reply: "Closer. The moon is 384,400 km. Rookie numbers." },
      { text: "More than pizza", reply: "Now that is a serious statement, and it's true." },
      { text: "Infinity, obviously", reply: "Correct. Mathematically unprovable, emotionally certain." },
    ],
  },
  {
    q: "What's my favourite thing about you?",
    options: [
      { text: "My smile", reply: "It genuinely rearranges my whole day." },
      { text: "My laugh", reply: "I have made a fool of myself many times just to hear it." },
      { text: "My kindness", reply: "You're kind in the quiet ways nobody claps for. I notice." },
      { text: "All of it", reply: "Cheating. Also the right answer." },
    ],
  },
  {
    q: "When did I know you were the one?",
    options: [
      { text: "The first day", reply: "Something clicked immediately. I just didn't have the words yet." },
      { text: "Our first long talk", reply: "The one where we lost track of time completely. Yes." },
      { text: "Some random Tuesday", reply: "That's the one. You were doing nothing special and I was gone." },
      { text: "Still figuring it out", reply: "Nope — I'm very sure. Have been for a while." },
    ],
  },
  {
    q: "Where would I take you right now if I could?",
    options: [
      { text: "Somewhere with mountains", reply: "Cold air, your hand in my pocket. Booked." },
      { text: "A tiny café", reply: "Two coffees, one dessert, zero rush." },
      { text: "The beach at night", reply: "Waves, no crowd, your head on my shoulder." },
      { text: "Anywhere, honestly", reply: "Right. The location was never the point." },
    ],
  },
  {
    q: "What do I think about when it's late and quiet?",
    options: [
      { text: "You", reply: "Yes." },
      { text: "Us", reply: "Also yes." },
      { text: "Our future", reply: "Constantly. It has you in every version." },
      { text: "Snacks", reply: "Fine — snacks AND you. Mostly you." },
    ],
  },
  {
    q: "Final question. Are you loved?",
    options: [
      { text: "Yes", reply: "Correct." },
      { text: "Absolutely", reply: "Extremely correct." },
      { text: "Beyond words", reply: "Now you're just reading my mind." },
      { text: "Every single day", reply: "That's the one. Every single day, no exceptions." },
    ],
  },
];

export default function LoveQuiz({ her, onWin }: GameProps) {
  const [step, setStep] = useState(0);
  const [reply, setReply] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const pick = (r: string) => {
    sfx.good();
    setReply(r);
  };

  const next = () => {
    setReply(null);
    if (step + 1 >= QUESTIONS.length) {
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
          <span style={{ fontSize: 58 }}>🏆</span>
          <div className="win-note">
            <span className="big">100%. Every time.</span>
            There were no wrong answers, {her} — the quiz was rigged in your favour from the first
            question, exactly like the rest of my life since you turned up in it.
          </div>
        </div>
      </div>
    );
  }

  const current = QUESTIONS[step];

  return (
    <div className="stage">
      <div className="q-bar">
        <i style={{ width: `${((step + (reply ? 1 : 0)) / QUESTIONS.length) * 100}%` }} />
      </div>

      <p className="chip" style={{ display: "inline-block", marginBottom: 12 }}>
        Question <b>{step + 1}</b> / {QUESTIONS.length}
      </p>

      <h3 style={{ fontSize: "clamp(20px, 3vw, 26px)", lineHeight: 1.25 }}>{current.q}</h3>

      {reply === null ? (
        <div className="q-opts">
          {current.options.map((o) => (
            <button key={o.text} type="button" className="q-opt" onClick={() => pick(o.reply)}>
              {o.text}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="win-note">{reply}</div>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button type="button" className="btn btn-primary" onClick={next}>
              {step + 1 >= QUESTIONS.length ? "See my verdict 💖" : "Next question →"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
