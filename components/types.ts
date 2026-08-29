import type { ComponentType } from "react";

export type GameProps = {
  /** Her name, as entered on the welcome gate. */
  her: string;
  /** Your name. */
  me: string;
  /** Call when the game is beaten — marks the arcade card as played. */
  onWin: (message?: string) => void;
};

export type Game = {
  id: string;
  title: string;
  tagline: string;
  emoji: string;
  /** Hue drives the card's gradient, glow and accent colour. */
  hue: number;
  tag: string;
  Component: ComponentType<GameProps>;
};
