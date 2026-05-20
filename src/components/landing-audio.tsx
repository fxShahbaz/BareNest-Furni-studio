"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SRC = "/audio/landing.mp3";
const VOLUME = 0.45;
const EVENT = "landingaudio:change";
// Hard fallback: if the ready signals never fire (some Safari/iOS networks
// drop progress events) surface the controls anyway so the user isn't
// locked out.
const READY_FALLBACK_MS = 2500;

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
  const pathname = usePathname();
  // Admin work stays silent. Everything else (site, invite, booklet)
  // shares one persistent <audio> element via the root layout.
  const enabled = !pathname?.startsWith("/admin");

  useEffect(() => {
    if (!enabled) return;
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
          notify();
        }).catch(() => {
          // Most browsers accept muted play() unconditionally, so failure
          // here usually means the element was torn down.
        });
      } else {
        startedRef.current = true;
        notify();
      }
    };

    const toggle = () => {
      const a = audioRef.current;
      if (!a) return;
      if (a.paused) {
        a.muted = false;
        a.play().catch(() => {});
        startedRef.current = true;
        notify();
        return;
      }
      a.muted = !a.muted;
      notify();
    };

    const removeUnmuteListeners = () => {
      window.removeEventListener("pointerdown", unmute);
      window.removeEventListener("pointermove", unmute);
      window.removeEventListener("mousemove", unmute);
      window.removeEventListener("keydown", unmute);
      window.removeEventListener("touchstart", unmute);
      window.removeEventListener("scroll", unmute);
    };

    const unmute = (e: Event) => {
      const a = audioRef.current;
      if (!a) return;
      if (!a.muted) return;
      // Skip when the user is tapping the dedicated audio toggle — its
      // click handler will run right after this and would flip mute back
      // on, causing the "two taps to start" bug.
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-audio-toggle]")) return;
      a.muted = false;
      a.play().catch(() => {});
      notify();
      removeUnmuteListeners();
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

    // Visibility gate: reveal the toggle as soon as the browser has any
    // playable data. canplaythrough waits for the full buffer and arrives
    // too late on slow connections — canplay / loadeddata is enough since
    // the track is short and the cache header makes repeat visits instant.
    audio.addEventListener("canplay", markReady, { once: true });
    audio.addEventListener("loadeddata", markReady, { once: true });
    const fallback = window.setTimeout(markReady, READY_FALLBACK_MS);

    // Muted autoplay is allowed everywhere, so kick the loop into motion
    // immediately. The button still won't appear until ready.
    start();
    audio.addEventListener("loadedmetadata", start, { once: true });

    // Unmute on the first real signal of presence. pointermove / mousemove
    // make audio fade in the instant the cursor enters the page, without
    // waiting for a click. touchstart covers mobile (no hover).
    window.addEventListener("pointermove", unmute, { passive: true });
    window.addEventListener("mousemove", unmute, { passive: true });
    window.addEventListener("pointerdown", unmute);
    window.addEventListener("keydown", unmute);
    window.addEventListener("touchstart", unmute, { passive: true });
    window.addEventListener("scroll", unmute, { passive: true });

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
      removeUnmuteListeners();
      document.removeEventListener("visibilitychange", onVisibility);
      audio.removeEventListener("loadedmetadata", start);
      audio.removeEventListener("canplay", markReady);
      audio.removeEventListener("loadeddata", markReady);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
      if (window.__landingAudio) delete window.__landingAudio;
      notify();
    };
  }, [enabled]);

  // No mobile control — desktop uses <HeaderAudioToggle /> in the navbar,
  // mobile gets no toggle by design. This component still mounts to drive
  // playback.
  return null;
}
