"use client";

/* ============================================================
   fx.ts — sound, confetti and haptics for the Love Arcade.
   All browser-only: every export must be called from an event
   handler or an effect, never during render.
   ============================================================ */

let audioCtx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

let muted = false;

export function setMuted(next: boolean) {
  muted = next;
  if (next) stopMusic();
}

export function isMuted() {
  return muted;
}

function tone(freq: number, dur = 0.14, type: OscillatorType = "sine", vol = 0.16, delay = 0) {
  const c = ac();
  if (!c || muted) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  click: () => tone(520, 0.07, "triangle", 0.1),
  pop: () => {
    tone(680, 0.09, "sine", 0.16);
    tone(1020, 0.07, "sine", 0.09, 0.03);
  },
  good: () => {
    tone(660, 0.1, "sine", 0.14);
    tone(880, 0.14, "sine", 0.12, 0.08);
  },
  bad: () => tone(160, 0.22, "sawtooth", 0.09),
  swoosh: () => tone(320, 0.16, "triangle", 0.07),
  win: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.4, "sine", 0.14, i * 0.11));
  },
  heartbeat: () => {
    tone(90, 0.13, "sine", 0.22);
    tone(80, 0.16, "sine", 0.18, 0.19);
  },
};

export function buzz(ms = 12) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {
      /* some browsers block it behind a user gesture — ignore */
    }
  }
}

/* ---------------- background music ---------------- */

let musicTimer: number | null = null;

/** A slow, soft major-7 progression. Deliberately quiet — it sits under the page. */
export function startMusic() {
  const c = ac();
  if (!c || musicTimer !== null) return;
  muted = false;
  const chords = [
    [261.63, 329.63, 392.0, 493.88], // Cmaj7
    [220.0, 261.63, 329.63, 415.3], // Am
    [174.61, 220.0, 261.63, 349.23], // Fmaj7
    [196.0, 246.94, 293.66, 392.0], // G
  ];
  let step = 0;
  const play = () => {
    const chord = chords[step % chords.length];
    chord.forEach((f, i) => tone(f, 2.6, "sine", 0.035, i * 0.09));
    tone(chord[3] * 2, 1.4, "triangle", 0.02, 1.2);
    step += 1;
  };
  play();
  musicTimer = window.setInterval(play, 3000);
}

export function stopMusic() {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
}

export function musicPlaying() {
  return musicTimer !== null;
}

/* ---------------- confetti ---------------- */

type Bit = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  life: number;
  color: string;
  glyph: string | null;
};

let cvs: HTMLCanvasElement | null = null;
let c2d: CanvasRenderingContext2D | null = null;
let bits: Bit[] = [];
let raf = 0;

const PALETTE = ["#ff4d8d", "#ff9ec7", "#ffd48a", "#a86bff", "#6be3c6", "#ffffff"];

function ensureCanvas() {
  if (typeof document === "undefined") return null;
  if (!cvs) {
    cvs = document.createElement("canvas");
    cvs.id = "confetti-canvas";
    document.body.appendChild(cvs);
    c2d = cvs.getContext("2d");
    const resize = () => {
      if (!cvs) return;
      cvs.width = window.innerWidth;
      cvs.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
  }
  return c2d;
}

function loop() {
  const ctx = c2d;
  if (!ctx || !cvs) return;
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  bits = bits.filter((b) => b.life > 0 && b.y < cvs!.height + 60);
  for (const b of bits) {
    b.vy += 0.42;
    b.vx *= 0.99;
    b.x += b.vx;
    b.y += b.vy;
    b.rot += b.vr;
    b.life -= 1;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rot);
    ctx.globalAlpha = Math.min(1, b.life / 40);
    if (b.glyph) {
      ctx.font = `${b.size * 2.4}px serif`;
      ctx.textAlign = "center";
      ctx.fillText(b.glyph, 0, 0);
    } else {
      ctx.fillStyle = b.color;
      ctx.fillRect(-b.size / 2, -b.size / 2, b.size, b.size * 1.6);
    }
    ctx.restore();
  }
  if (bits.length) {
    raf = requestAnimationFrame(loop);
  } else {
    cancelAnimationFrame(raf);
    raf = 0;
  }
}

export function confetti(count = 90, origin?: { x: number; y: number }, hearts = true) {
  const ctx = ensureCanvas();
  if (!ctx || !cvs) return;
  const ox = origin?.x ?? cvs.width / 2;
  const oy = origin?.y ?? cvs.height * 0.38;
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 5 + Math.random() * 13;
    const useGlyph = hearts && Math.random() < 0.35;
    bits.push({
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      size: 5 + Math.random() * 7,
      life: 90 + Math.random() * 70,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      glyph: useGlyph ? (Math.random() < 0.5 ? "💖" : "💕") : null,
    });
  }
  if (!raf) raf = requestAnimationFrame(loop);
}

/** Confetti aimed from a specific element — used when a button is clicked. */
export function confettiFrom(el: Element | null, count = 70) {
  if (!el) return confetti(count);
  const r = el.getBoundingClientRect();
  confetti(count, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
}

/** One big celebration: sound + a triple burst. */
export function celebrate(el?: Element | null) {
  sfx.win();
  buzz(30);
  confettiFrom(el ?? null, 80);
  window.setTimeout(() => confetti(60, { x: window.innerWidth * 0.2, y: window.innerHeight * 0.3 }), 180);
  window.setTimeout(() => confetti(60, { x: window.innerWidth * 0.8, y: window.innerHeight * 0.3 }), 340);
}
