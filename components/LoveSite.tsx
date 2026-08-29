"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Ambient from "./Ambient";
import { GAMES } from "./games";
import { celebrate, isMuted, musicPlaying, setMuted, sfx, startMusic, stopMusic } from "./fx";

const PLAYED_KEY = "love-arcade:played";

/* Names come from the environment (.env.local), with these as the built-in default
   so the site still renders correctly if the env file is missing on a deploy. */
const HER = process.env.NEXT_PUBLIC_GIRL || "Ruby";
const ME = process.env.NEXT_PUBLIC_BOY || "Deepak";

const TYPE_LINES = [
  "I built this instead of sleeping.",
  "Fifteen games. All of them about you.",
  "Warning: the No button does not work here.",
  "Scroll down. It gets sweeter.",
];

const MARQUEE_A = [
  "Your laugh is my favourite sound",
  "You make ordinary days feel rare",
  "I'd pick you again, every time",
  "You are my favourite notification",
  "Home is wherever you are",
  "You're the best decision I ever made",
  "Still obsessed, years later",
];

const MARQUEE_B = [
  "You make me a better person",
  "Every love song makes sense now",
  "I love your terrible dancing",
  "You remember the small things",
  "My favourite person, easily",
  "You're worth every mile",
  "I'd cross oceans, but I'd rather cross the room",
];

/** Progress lives in localStorage, so it is read lazily and only in the browser. */
function readPlayed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PLAYED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/* `useSyncExternalStore` gives us "is this the client yet?" and the reduced-motion
   preference without a single setState-in-effect. */

const neverChanges = () => () => {};

/** Result panels that must never be left below the fold of a scrolling modal. */
const RESULT_SELECTOR = ".win-note, .pull-card";

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export default function LoveSite() {
  const hydrated = useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );

  const her = HER;
  const me = ME;

  const [openId, setOpenId] = useState<string | null>(null);
  const [played, setPlayed] = useState<string[]>(readPlayed);
  const [typed, setTyped] = useState("");
  const [stuck, setStuck] = useState(false);
  const [music, setMusic] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const toastTimer = useRef<number | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  /* ---------- typewriter ---------- */
  useEffect(() => {
    if (!hydrated || reducedMotion) return;
    let line = 0;
    let char = 0;
    let deleting = false;
    let timer = 0;

    const step = () => {
      const text = TYPE_LINES[line];
      char += deleting ? -1 : 1;
      setTyped(text.slice(0, char));

      let delay = deleting ? 32 : 58;
      if (!deleting && char === text.length) {
        delay = 2100;
        deleting = true;
      } else if (deleting && char === 0) {
        deleting = false;
        line = (line + 1) % TYPE_LINES.length;
        delay = 420;
      }
      timer = window.setTimeout(step, delay);
    };

    timer = window.setTimeout(step, 700);
    return () => window.clearTimeout(timer);
  }, [hydrated, reducedMotion]);

  /* ---------- scroll reveal + sticky nav ---------- */
  useEffect(() => {
    if (!hydrated) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" },
    );

    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    const onScroll = () => setStuck(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [hydrated]);

  /* ---------- music starts on the first real interaction ----------
     Browsers block audio until the user has touched the page, so we wait for
     that first gesture rather than trying (and failing) to autoplay on load. */
  useEffect(() => {
    if (!hydrated) return;
    const onFirst = (e: PointerEvent) => {
      // Don't fight the user if their very first click is the mute/music button.
      if ((e.target as Element | null)?.closest?.(".float-controls")) return;
      window.removeEventListener("pointerdown", onFirst);
      startMusic();
      setMusic(true);
    };
    window.addEventListener("pointerdown", onFirst);
    return () => window.removeEventListener("pointerdown", onFirst);
  }, [hydrated]);

  /* ---------- modal: lock scroll + escape to close ---------- */
  useEffect(() => {
    if (!openId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  /* ---------- keep result messages on screen ----------
     Win notes and per-question replies render below the fold of a tall game,
     so watch for one appearing and scroll it into view automatically. */
  useEffect(() => {
    const body = bodyRef.current;
    if (!openId || !body) return;

    const bring = (el: Element) =>
      window.requestAnimationFrame(() =>
        el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" }),
      );

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          const note = node.matches(RESULT_SELECTOR) ? node : node.querySelector(RESULT_SELECTOR);
          if (note) {
            bring(note);
            return;
          }
        }
      }
    });

    mo.observe(body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [openId, reducedMotion]);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const say = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const openGame = (id: string) => {
    setOpenId(id);
    sfx.click();
  };

  const markPlayed = useCallback(
    (id: string) => {
      setPlayed((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        try {
          localStorage.setItem(PLAYED_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        if (next.length === GAMES.length) {
          window.setTimeout(() => {
            celebrate();
            say("🏆 Every single game beaten. You're unstoppable.");
          }, 900);
        }
        return next;
      });
    },
    [say],
  );

  const surprise = () => {
    const pool = GAMES.filter((g) => g.id !== openId);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    openGame(pick.id);
    say(`🎲 ${pick.title} it is!`);
  };

  const toggleMusic = () => {
    if (musicPlaying()) {
      stopMusic();
      setMusic(false);
    } else {
      startMusic();
      setMusic(true);
      if (isMuted()) {
        setMuted(false);
        setQuiet(false);
      }
    }
  };

  const toggleQuiet = () => {
    const next = !quiet;
    setQuiet(next);
    setMuted(next);
    if (next) setMusic(false);
  };

  const openGameDef = useMemo(() => GAMES.find((g) => g.id === openId) ?? null, [openId]);
  const ActiveGame = openGameDef?.Component ?? null;

  /* ---------- render ---------- */


  return (
    <>
      <Ambient />

      <div className="shell">
        <div className="wrap">
          <nav className={`nav${stuck ? " stuck" : ""}`}>
            <span className="nav-brand">
              <span aria-hidden>💞</span> for {her}
            </span>
            <span className="nav-links">
              <a href="#letter">The note</a>
              <a href="#arcade">The arcade</a>
              <a href="#reasons">Reasons</a>
              <button type="button" className="btn btn-primary btn-sm" onClick={surprise}>
                Surprise me 🎲
              </button>
            </span>
          </nav>
        </div>

        {/* ---------------- hero ---------------- */}
        <header className="wrap hero">
          <span className="eyebrow">
            <span aria-hidden>✦</span> Built by hand, on purpose
          </span>

          <h1>
            <span className="grad-text">Hey {her}</span>
          </h1>
          <p className="script sub-script">this whole place is yours</p>

          <p className="type-line">
            {reducedMotion ? TYPE_LINES[0] : typed}
            <span className="caret" aria-hidden />
          </p>

          <div className="hero-cta">
            <a
              href="#arcade"
              className="btn btn-primary"
              onClick={() => sfx.click()}
            >
              Play the games 🎮
            </a>
            <a href="#letter" className="btn btn-ghost" onClick={() => sfx.click()}>
              Read the note 💌
            </a>
          </div>

          <div className="scroll-cue" aria-hidden>
            <span className="mouse" />
            scroll
          </div>
        </header>

        {/* ---------------- letter ---------------- */}
        <section id="letter" className="wrap">
          <div className="reveal">
            <span className="eyebrow">The note</span>
            <h2 className="h2">
              Some things are easier <span className="grad-text">written down</span>
            </h2>
          </div>

          <div className="letter glass reveal d1" style={{ marginTop: 28 }}>
            <p>
              {her}, I&apos;m not good at saying this out loud without turning it into a joke halfway
              through — so I built you a website instead. That&apos;s either very romantic or very
              ridiculous, and honestly, so are we.
            </p>
            <p>
              You have this way of making a completely normal day feel like something I&apos;ll want to
              remember. You laugh at things nobody else finds funny. You remember what I said weeks
              ago. You show up. Every single time, you show up.
            </p>
            <p>
              So here are fifteen small games, a jar full of reasons, and one question with a No
              button that will never, ever let itself be clicked. Take your time with it. It was made
              slowly and on purpose, the way I&apos;d like to love you.
            </p>
            <p className="sign">— {me} 🤍</p>
          </div>

          <div className="stats reveal d2">
            <div className="stat">
              <b>15</b>
              <span>Games inside</span>
            </div>
            <div className="stat">
              <b>25</b>
              <span>Reasons in the jar</span>
            </div>
            <div className="stat">
              <b>0</b>
              <span>Working No buttons</span>
            </div>
            <div className="stat">
              <b>∞</b>
              <span>How much I love you</span>
            </div>
          </div>
        </section>

        {/* ---------------- arcade ---------------- */}
        <section id="arcade" className="wrap">
          <div className="reveal">
            <span className="eyebrow">The arcade</span>
            <h2 className="h2">
              Fifteen games. <span className="grad-text">All about you.</span>
            </h2>
            <p className="lede">
              Start with the first one — it&apos;s the whole reason this site exists. You&apos;ve beaten{" "}
              <b style={{ color: "var(--gold)" }}>
                {hydrated ? played.length : 0} of {GAMES.length}
              </b>
              .
            </p>
          </div>

          <div className="arcade">
            {GAMES.map((game, i) => (
              <button
                key={game.id}
                type="button"
                className={`game-card reveal${i % 3 === 1 ? " d1" : i % 3 === 2 ? " d2" : ""}`}
                style={{ "--hue": game.hue } as React.CSSProperties}
                onClick={() => openGame(game.id)}
                onPointerMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                }}
              >
                {hydrated && played.includes(game.id) && <span className="badge-done">✓ played</span>}
                <span className="game-emoji" aria-hidden>
                  {game.emoji}
                </span>
                <h3>{game.title}</h3>
                <p>{game.tagline}</p>
                <span className="game-tag">
                  <span aria-hidden>▸</span> {game.tag}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ---------------- reasons ---------------- */}
        <section id="reasons" className="wrap">
          <div className="reveal">
            <span className="eyebrow">Reasons</span>
            <h2 className="h2">
              A few, on <span className="grad-text">permanent display</span>
            </h2>
            <p className="lede">Hover to stop them. There are plenty more in the jar.</p>
          </div>
        </section>

        <div className="marquee reveal" style={{ marginTop: -40 }}>
          <div className="marquee-row">
            {[...MARQUEE_A, ...MARQUEE_A].map((r, i) => (
              <span className="rz" key={`a${i}`}>
                <b>♡</b> {r}
              </span>
            ))}
          </div>
        </div>
        <div className="marquee reveal" style={{ marginTop: 14 }}>
          <div className="marquee-row rev">
            {[...MARQUEE_B, ...MARQUEE_B].map((r, i) => (
              <span className="rz" key={`b${i}`}>
                <b>♡</b> {r}
              </span>
            ))}
          </div>
        </div>

        {/* ---------------- footer ---------------- */}
        <footer className="wrap foot" style={{ marginTop: 90 }}>
          <button
            type="button"
            className="big-heart"
            aria-label="Send love"
            style={{ background: "none", border: "none", cursor: "pointer" }}
            onClick={(e) => {
              celebrate(e.currentTarget);
              say(`💖 ${me} loves ${her}. Officially. On the internet.`);
            }}
          >
            💖
          </button>
          <p style={{ marginTop: 10 }}>
            Made for <span className="script" style={{ fontSize: 22, color: "var(--blush)" }}>{her}</span> by{" "}
            <span className="script" style={{ fontSize: 22, color: "var(--blush)" }}>{me}</span>
          </p>
          <p style={{ fontSize: 12.5, opacity: 0.7 }}>
            Tap the heart. Then go tell her in person — that part still matters most.
          </p>
        </footer>
      </div>

      {/* ---------------- floating controls ---------------- */}
      <div className="float-controls">
        <button
          type="button"
          className={`round-btn${music ? " on" : ""}`}
          onClick={toggleMusic}
          aria-label={music ? "Stop the music" : "Play soft music"}
          title={music ? "Stop the music" : "Play soft music"}
        >
          {music ? "🎵" : "🎶"}
        </button>
        <button
          type="button"
          className={`round-btn${quiet ? " on" : ""}`}
          onClick={toggleQuiet}
          aria-label={quiet ? "Unmute sounds" : "Mute sounds"}
          title={quiet ? "Unmute sounds" : "Mute sounds"}
        >
          {quiet ? "🔇" : "🔊"}
        </button>
      </div>

      {/* ---------------- game modal ---------------- */}
      {openGameDef && ActiveGame && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenId(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-label={openGameDef.title}
        >
          <div className="modal" style={{ "--hue": openGameDef.hue } as React.CSSProperties}>
            <button type="button" className="x-btn" onClick={() => setOpenId(null)} aria-label="Close">
              ✕
            </button>

            <div className="modal-head">
              <span style={{ fontSize: 38, lineHeight: 1 }} aria-hidden>
                {openGameDef.emoji}
              </span>
              <div>
                <h2>{openGameDef.title}</h2>
                <p>{openGameDef.tagline}</p>
              </div>
            </div>

            <div className="modal-body" ref={bodyRef}>
              <ActiveGame
                key={openGameDef.id}
                her={her}
                me={me}
                onWin={(message) => {
                  markPlayed(openGameDef.id);
                  if (message) say(message);
                }}
              />
            </div>

            <div className="modal-foot">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpenId(null)}>
                ← Back to the arcade
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={surprise}>
                Random game 🎲
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
