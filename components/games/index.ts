import BeMine from "./BeMine";
import CatchHearts from "./CatchHearts";
import ComplimentSlots from "./ComplimentSlots";
import DoYouLoveMe from "./DoYouLoveMe";
import EmojiDate from "./EmojiDate";
import LoveMeter from "./LoveMeter";
import LoveQuiz from "./LoveQuiz";
import LoveTapper from "./LoveTapper";
import MemoryMatch from "./MemoryMatch";
import ReasonsJar from "./ReasonsJar";
import ScratchCard from "./ScratchCard";
import SlidePuzzle from "./SlidePuzzle";
import SpinWheel from "./SpinWheel";
import TruthOrDare from "./TruthOrDare";
import WhackAHeart from "./WhackAHeart";
import type { Game } from "../types";

export const GAMES: Game[] = [
  {
    id: "do-you-love-me",
    title: "Do You Love Me?",
    tagline: "One simple question, two buttons. Except the No button has other plans.",
    emoji: "💘",
    hue: 336,
    tag: "The impossible no",
    Component: DoYouLoveMe,
  },
  {
    id: "be-mine",
    title: "Will You Be Mine?",
    tagline: "Every time you press No, the Yes gets bigger. Physics is on my side.",
    emoji: "💍",
    hue: 285,
    tag: "Rigged, lovingly",
    Component: BeMine,
  },
  {
    id: "love-tapper",
    title: "Break the Love Meter",
    tagline: "Tap the heart until the meter gives up and admits it's infinite.",
    emoji: "💖",
    hue: 350,
    tag: "Tap to prove it",
    Component: LoveTapper,
  },
  {
    id: "love-meter",
    title: "Love Calculator",
    tagline: "Enter two names. Get one scientifically inevitable result.",
    emoji: "💗",
    hue: 320,
    tag: "100% accurate",
    Component: LoveMeter,
  },
  {
    id: "memory",
    title: "Heart Memory Match",
    tagline: "Eight pairs hiding under love letters. Find every match.",
    emoji: "💌",
    hue: 200,
    tag: "Brain teaser",
    Component: MemoryMatch,
  },
  {
    id: "catch",
    title: "Catch My Heart",
    tagline: "Thirty seconds. Falling hearts. Don't catch the broken ones.",
    emoji: "🧺",
    hue: 42,
    tag: "Arcade",
    Component: CatchHearts,
  },
  {
    id: "whack",
    title: "Pop the Hearts",
    tagline: "They pop up, you tap them. Skip the broken hearts or lose points.",
    emoji: "🔨",
    hue: 4,
    tag: "Reflex test",
    Component: WhackAHeart,
  },
  {
    id: "scratch",
    title: "Scratch & Reveal",
    tagline: "Real coupons, redeemable any time. I'm legally bound to honour them.",
    emoji: "🎟️",
    hue: 25,
    tag: "Prizes inside",
    Component: ScratchCard,
  },
  {
    id: "wheel",
    title: "Wheel of Date Nights",
    tagline: "Spin it and obey it. Flip to the 18+ deck when you're alone.",
    emoji: "🎡",
    hue: 265,
    tag: "Fate decides · 18+",
    Component: SpinWheel,
  },
  {
    id: "quiz",
    title: "How Well Do You Know Us?",
    tagline: "Six questions about us. Spoiler: there are no wrong answers.",
    emoji: "📝",
    hue: 165,
    tag: "Quiz",
    Component: LoveQuiz,
  },
  {
    id: "puzzle",
    title: "Sliding Heart Puzzle",
    tagline: "Slide the tiles until they spell out what I've been saying all along.",
    emoji: "🧩",
    hue: 300,
    tag: "Puzzle",
    Component: SlidePuzzle,
  },
  {
    id: "emoji-date",
    title: "Guess the Date",
    tagline: "Decode the emoji, unlock a date idea I actually want to take you on.",
    emoji: "🎬",
    hue: 105,
    tag: "Riddles",
    Component: EmojiDate,
  },
  {
    id: "truth-dare",
    title: "Truth or Dare",
    tagline: "Two decks — sweet, or the 18+ one. No safe options in either.",
    emoji: "🎲",
    hue: 240,
    tag: "Two players · 18+",
    Component: TruthOrDare,
  },
  {
    id: "slots",
    title: "Compliment Machine",
    tagline: "A slot machine rigged to only produce true things about you.",
    emoji: "🎰",
    hue: 55,
    tag: "320 combos",
    Component: ComplimentSlots,
  },
  {
    id: "reasons",
    title: "The Reasons Jar",
    tagline: "Twenty-five reasons I love you. Pull them out one at a time.",
    emoji: "🫙",
    hue: 345,
    tag: "Read slowly",
    Component: ReasonsJar,
  },
];
