"use client";

import { useEffect, useRef, useState } from "react";
import { celebrate, sfx } from "../fx";
import type { GameProps } from "../types";

const CHECKS = [
  "Scanning heartbeats…",
  "Cross-referencing smiles…",
  "Measuring butterfly activity…",
  "Consulting the stars ✨",
  "Verifying: yes, still obsessed.",
];

export default function LoveMeter({ her, me, onWin }: GameProps) {
  const [a, setA] = useState(her);
  const [b, setB] = useState(me);
  const [value, setValue] = useState(0);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [step, setStep] = useState(0);
  const rafRef = useRef(0);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const run = () => {
    if (phase === "running") return;
    setPhase("running");
    setStep(0);
    setValue(0);
    sfx.heartbeat();

    // The result is rigged, obviously. It was always going to be rigged.
    const target = 97 + Math.floor(Math.random() * 4);
    const start = performance.now();
    const dur = 2600;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      // Ease out, with a little suspense wobble on the way up.
      const eased = 1 - Math.pow(1 - t, 3);
      const wobble = t < 0.85 ? Math.sin(t * 26) * 3 * (1 - t) : 0;
      setValue(Math.max(0, Math.min(target, Math.round(eased * target + wobble))));
      setStep(Math.min(CHECKS.length - 1, Math.floor(t * CHECKS.length)));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
        setPhase("done");
        celebrate(btnRef.current);
        onWin();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  return (
    <div className="stage">
      <div className="center-col">
        <div style={{ display: "grid", gap: 10, width: "min(420px, 100%)" }}>
          <input
            className="field"
            style={{ marginTop: 0 }}
            value={a}
            onChange={(e) => setA(e.target.value)}
            placeholder="Her name"
            aria-label="First name"
          />
          <span style={{ fontSize: 26 }} aria-hidden>
            💞
          </span>
          <input
            className="field"
            style={{ marginTop: 0 }}
            value={b}
            onChange={(e) => setB(e.target.value)}
            placeholder="Your name"
            aria-label="Second name"
          />
        </div>

        <div className="meter-num grad-text">{value}%</div>

        <div className="meter-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
          <div className="meter-fill" style={{ width: `${value}%` }} />
        </div>

        <p className="lede" style={{ textAlign: "center", minHeight: 26 }}>
          {phase === "running" ? CHECKS[step] : phase === "done" ? "" : "Purely scientific. Peer-reviewed by me."}
        </p>

        <button ref={btnRef} type="button" className="btn btn-primary" onClick={run} disabled={phase === "running"}>
          {phase === "done" ? "Run it again 🔁" : "Calculate our love 💘"}
        </button>

        {phase === "done" && (
          <div className="win-note">
            <span className="big">{value}% compatible</span>
            The machine tried to say {value}%, but it kept crashing every time it tried to measure
            how much I love you, {a || "you"}. The remaining {100 - value}%? That&apos;s just the part of
            you I haven&apos;t discovered yet — and I plan to spend a very long time on it.
          </div>
        )}
      </div>
    </div>
  );
}
