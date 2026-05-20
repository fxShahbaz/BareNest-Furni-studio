"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const EVENT = "landingaudio:change";
// Matches Tailwind's `md:` breakpoint. Kept in sync manually because the
// toggle is desktop-only by product decision — no toggle on phones.
const DESKTOP_QUERY = "(min-width: 768px)";

type State = {
  mounted: boolean;
  ready: boolean;
  playing: boolean;
  muted: boolean;
};

const INITIAL: State = {
  mounted: false,
  ready: false,
  playing: false,
  muted: true,
};

function read(): State {
  if (typeof window === "undefined") return INITIAL;
  const api = window.__landingAudio;
  if (!api) return INITIAL;
  return {
    mounted: true,
    ready: api.isReady(),
    playing: api.isPlaying(),
    muted: api.isMuted(),
  };
}

export default function HeaderAudioToggle() {
  const [state, setState] = useState<State>(INITIAL);
  // Start as `null` so SSR renders nothing and the first client paint
  // matches — then resolve to the actual viewport on mount. Avoids any
  // chance of the button flashing on phones.
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setState(read());
    update();
    window.addEventListener(EVENT, update);
    return () => window.removeEventListener(EVENT, update);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const apply = () => setIsDesktop(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  if (!isDesktop) return null;

  const onClick = () => window.__landingAudio?.toggle();

  // Hidden until both gates are open: file fully buffered AND playback started.
  const visible = state.mounted && state.ready && state.playing;
  const live = visible && !state.muted;

  return (
    <button
      type="button"
      aria-label={state.muted ? "Unmute landing audio" : "Mute landing audio"}
      aria-pressed={!state.muted}
      onClick={onClick}
      data-audio-toggle
      className={cn(
        "relative hidden h-10 w-10 place-items-center overflow-hidden rounded-full text-bone transition-all duration-500 md:grid",
        visible
          ? "scale-100 opacity-100"
          : "pointer-events-none scale-90 opacity-0",
        live
          ? "bg-rust shadow-[0_10px_30px_-10px_rgba(194,85,43,0.6)]"
          : "bg-ink/80 shadow-[0_8px_24px_-12px_rgba(20,17,14,0.5)]"
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="relative h-4 w-4 overflow-hidden"
        fill="none"
      >
        {live ? (
          // A single horizontal S — one full sine cycle that breathes:
          // the amplitude swells and contracts in place. No flowing
          // cycles, no extra peaks.
          <path
            d="M3 12 C 6 5, 9 5, 12 12 C 15 19, 18 19, 21 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <animate
              attributeName="d"
              values="M3 12 C 6 8, 9 8, 12 12 C 15 16, 18 16, 21 12;
                      M3 12 C 6 3, 9 3, 12 12 C 15 21, 18 21, 21 12;
                      M3 12 C 6 8, 9 8, 12 12 C 15 16, 18 16, 21 12"
              dur="1.4s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            />
          </path>
        ) : (
          // Paused — a single horizontal line, like a minus symbol.
          <line
            x1="6"
            y1="12"
            x2="18"
            y2="12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  );
}
