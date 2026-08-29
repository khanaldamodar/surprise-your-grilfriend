"use client";

import { useCallback, useState } from "react";
import { celebrate, sfx } from "../fx";
import type { GameProps } from "../types";

/** Solved layout, read left-to-right: I ❤ L O V E Y U + blank. */
const GOAL = ["I", "❤️", "L", "O", "V", "E", "Y", "U", ""];
const BLANK = "";

const neighbours = (i: number) => {
  const row = Math.floor(i / 3);
  const col = i % 3;
  const out: number[] = [];
  if (row > 0) out.push(i - 3);
  if (row < 2) out.push(i + 3);
  if (col > 0) out.push(i - 1);
  if (col < 2) out.push(i + 1);
  return out;
};

/** Shuffle by walking the blank around, so the board is always solvable. */
function shuffle(): string[] {
  const board = [...GOAL];
  let blank = board.indexOf(BLANK);
  let prev = -1;
  for (let n = 0; n < 160; n += 1) {
    const options = neighbours(blank).filter((i) => i !== prev);
    const pick = options[Math.floor(Math.random() * options.length)];
    [board[blank], board[pick]] = [board[pick], board[blank]];
    prev = blank;
    blank = pick;
  }
  return board;
}

export default function SlidePuzzle({ her, onWin }: GameProps) {
  const [board, setBoard] = useState<string[]>(shuffle);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const slide = useCallback(
    (i: number) => {
      if (won) return;
      const blank = board.indexOf(BLANK);
      if (!neighbours(blank).includes(i)) return;

      const next = [...board];
      [next[blank], next[i]] = [next[i], next[blank]];
      setBoard(next);
      setMoves((m) => m + 1);
      sfx.click();

      if (next.every((v, idx) => v === GOAL[idx])) {
        setWon(true);
        celebrate();
        onWin();
      }
    },
    [board, won, onWin],
  );

  const reset = () => {
    setBoard(shuffle());
    setMoves(0);
    setWon(false);
    sfx.swoosh();
  };

  return (
    <div className="stage">
      <div className="hud">
        <span className="chip">
          Moves <b>{moves}</b>
        </span>
        <span className="chip">
          Goal <b>I ❤️ L O V E Y U</b>
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
          Shuffle 🔀
        </button>
      </div>

      <div className="puz-grid">
        {board.map((tile, i) => (
          <button
            key={`${tile}-${i}`}
            type="button"
            className={`puz-tile${tile === BLANK ? " empty" : ""}`}
            onClick={() => slide(i)}
            aria-label={tile === BLANK ? "Empty space" : `Tile ${tile}`}
          >
            {tile}
          </button>
        ))}
      </div>

      {won && (
        <div className="win-note">
          <span className="big">I ❤️ LOVE YOU</span>
          Solved in {moves} moves. It took you a minute to put those letters in order, {her} — it
          took me one look to know I meant them.
        </div>
      )}
    </div>
  );
}
