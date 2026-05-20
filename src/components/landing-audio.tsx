"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

const SRC = "/audio/landing.mp3";
const VOLUME = 0.45;
const EVENT = "landingaudio:change";
// Hard fallback: if canplaythrough never fires (some Safari/iOS networks
// don't dispatch it reliably), surface the controls anyway after this
// much time so the user isn't locked out.
const READY_FALLBACK_MS = 8000;

declare global {
  interface Window {
    __landingAudio?: {
      toggle: () => void;
      isMuted: () => boolean;
      isPlaying: () => boolean;
      isReady: () => boolean;
    };
  }
}

export default function LandingAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  const readyRef = useRef(false);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = VOLUME;
    audio.muted = true;
    // Force the browser to begin downloading immediately. The service
    // worker cache + the immutable Cache-Control on /audio/* means second
    // visits resolve from cache in zero ms.
    audio.load();
    audioRef.current = audio;

    const notify = () => window.dispatchEvent(new CustomEvent(EVENT));

    const markReady = () => {
      if (readyRef.current) return;
      readyRef.current = true;
      setReady(true);
      notify();
    };

    const start = () => {
      if (startedRef.current) return;
      const a = audioRef.current;
      if (!a) return;
      const p = a.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          startedRef.current = true;
          setStarted(true);
          notify();
        }).catch(() => {
          // Most browsers accept muted play() unconditionally, so failure
          // here usually means the element was torn down.
        });
      } else {
        startedRef.current = true;
        setStarted(true);
        notify();
      }
    };

    const toggle = () => {
      const a = audioRef.current;
      if (!a) return;
      if (a.paused) {
        a.muted = false;
        a.play().catch(() => {});
        setMuted(false);
        startedRef.current = true;
        notify();
        return;
      }
      const next = !a.muted;
      a.muted = next;
      setMuted(next);
      notify();
    };

    const unmute = (e: Event) => {
      const a = audioRef.current;
      if (!a) return;
      if (!a.muted) return;
      // Skip when the user is tapping the dedicated audio toggle — its
      // click handler will run right after this and would flip mute back
      // on, causing the "two taps to start" bug. The toggle button is
      // marked with data-audio-toggle on both the header and mobile
      // variants.
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-audio-toggle]")) return;
      a.muted = false;
      setMuted(false);
      a.play().catch(() => {});
      notify();
      window.removeEventListener("pointerdown", unmute);
      window.removeEventListener("keydown", unmute);
      window.removeEventListener("touchstart", unmute);
    };

    // Imperative API for the header toggle. The header subscribes to EVENT
    // for state updates and uses isReady() to decide whether to render.
    window.__landingAudio = {
      toggle,
      isMuted: () => audio.muted,
      isPlaying: () => startedRef.current && !audio.paused,
      isReady: () => readyRef.current,
    };
    notify();

    // Visibility gate: only reveal controls when the browser believes it
    // can play the full track without re-buffering. canplaythrough is the
    // right signal; canplay fires too early (just enough to start).
    audio.addEventListener("canplaythrough", markReady, { once: true });
    // Some networks/codecs never fire canplaythrough — fall back to
    // canplay + a small buffer, or to a hard timeout.
    const fallback = window.setTimeout(markReady, READY_FALLBACK_MS);

    // Muted autoplay is allowed everywhere, so kick the loop into motion
    // immediately. The button still won't appear until ready.
    start();
    audio.addEventListener("loadedmetadata", start, { once: true });

    window.addEventListener("pointerdown", unmute, { once: false });
    window.addEventListener("keydown", unmute, { once: false });
    window.addEventListener("touchstart", unmute, { passive: true });

    const onVisibility = () => {
      const a = audioRef.current;
      if (!a) return;
      if (document.hidden) a.pause();
      else if (startedRef.current) a.play().catch(() => {});
      notify();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener("pointerdown", unmute);
      window.removeEventListener("keydown", unmute);
      window.removeEventListener("touchstart", unmute);
      document.removeEventListener("visibilitychange", onVisibility);
      audio.removeEventListener("loadedmetadata", start);
      audio.removeEventListener("canplaythrough", markReady);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
      if (window.__landingAudio) delete window.__landingAudio;
      notify();
    };
  }, []);

  const onClick = () => window.__landingAudio?.toggle();

  // Mobile floating control. Desktop uses <HeaderAudioToggle /> in the navbar.
  return (
    <button
      type="button"
      aria-label={muted ? "Unmute landing audio" : "Mute landing audio"}
      aria-pressed={!muted}
      onClick={onClick}
      data-audio-toggle
      className={cn(
        "fixed bottom-[max(env(safe-area-inset-bottom),1.25rem)] left-5 z-40 grid h-11 w-11 place-items-center rounded-full border border-ink/10 bg-bone/90 text-ink/80 shadow-[0_15px_40px_-18px_rgba(20,17,14,0.45)] backdrop-blur transition-all duration-500 hover:bg-bone hover:text-ink md:hidden",
        ready && started ? "opacity-100" : "pointer-events-none opacity-0",
        !muted && "ring-2 ring-rust/50"
      )}
    >
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </button>
  );
}
