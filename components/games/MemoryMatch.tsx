"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { celebrate, sfx } from "../fx";
import type { GameProps } from "../types";

const FACES = ["💖", "🌹", "🍫", "🧸", "🎀", "💍", "🌙", "🧁"];

type Card = { id: number; face: string; up: boolean; done: boolean };

function deal(): Card[] {
  const deck = [...FACES, ...FACES].map((face, i) => ({ id: i, face, up: false, done: false }));
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function MemoryMatch({ her, onWin }: GameProps) {
  const [cards, setCards] = useState<Card[]>(deal);
  const [picked, setPicked] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const lockRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const flip = useCallback(
    (idx: number) => {
      if (lockRef.current || won) return;
      const card = cards[idx];
      if (card.up || card.done) return;

      sfx.click();
      const next = cards.map((c, i) => (i === idx ? { ...c, up: true } : c));
      const chosen = [...picked, idx];
      setCards(next);
      setPicked(chosen);

      if (chosen.length < 2) return;

      setMoves((m) => m + 1);
      const [x, y] = chosen;
      lockRef.current = true;

      if (next[x].face === next[y].face) {
        timerRef.current = window.setTimeout(() => {
          const solved = next.map((c, i) => (i === x || i === y ? { ...c, done: true } : c));
          setCards(solved);
          setPicked([]);
          lockRef.current = false;
          sfx.good();
          if (solved.every((c) => c.done)) {
            setWon(true);
            celebrate();
            onWin();
          }
        }, 380);
      } else {
        timerRef.current = window.setTimeout(() => {
          setCards(next.map((c, i) => (i === x || i === y ? { ...c, up: false } : c)));
          setPicked([]);
          lockRef.current = false;
        }, 760);
      }
    },
    [cards, picked, won, onWin],
  );

  const restart = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    lockRef.current = false;
    setCards(deal());
    setPicked([]);
    setMoves(0);
    setWon(false);
  };

  const found = cards.filter((c) => c.done).length / 2;

  return (
    <div className="stage tight">
      <div className="hud">
        <span className="chip">
          Moves <b>{moves}</b>
        </span>
        <span className="chip">
          Pairs <b>{found}/8</b>
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={restart}>
          Shuffle 🔀
        </button>
      </div>

      <div className="mem-grid">
        {cards.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={`mem-card${c.up || c.done ? " up" : ""}${c.done ? " done" : ""}`}
            onClick={() => flip(i)}
            aria-label={c.up || c.done ? c.face : "Hidden card"}
          >
            <span className="mem-inner">
              <span className="mem-face mem-front" aria-hidden>
                💌
              </span>
              <span className="mem-face mem-back" aria-hidden>
                {c.face}
              </span>
            </span>
          </button>
        ))}
      </div>

      {won && (
        <div className="win-note">
          <span className="big">Matched, just like us.</span>
          Eight perfect pairs in {moves} moves. {her}, finding your other half is apparently easy —
          I did it the day I found you.
        </div>
      )}
    </div>
  );
}
