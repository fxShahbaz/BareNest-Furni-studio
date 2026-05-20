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

    // Desktop path: kick off muted playback on mount so the loop is already
    // warm by the time the user moves the cursor. iOS rejects this (audio
    // elements need a gesture even when muted) — we swallow the rejection
    // and rely on the gesture listeners below.
    const startMuted = () => {
      if (startedRef.current) return;
      const a = audioRef.current;
      if (!a) return;
      const p = a.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          startedRef.current = true;
          notify();
        }).catch(() => {
          /* gesture required (mobile) — handled by `unlock` */
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

    const removeUnlockListeners = () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("pointermove", unlock);
      window.removeEventListener("mousemove", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("touchend", unlock);
      window.removeEventListener("click", unlock);
      window.removeEventListener("scroll", unlock);
    };

    // First user gesture → play unmuted. Critical: only tear down the
    // listeners *after* play() actually resolves. iOS rejects play()
    // outside a gesture and the previous implementation removed the
    // listeners synchronously — meaning a failed first try silently
    // locked the audio out forever. Keeping the listeners attached
    // gives every subsequent gesture another chance.
    const unlock = (e: Event) => {
      const a = audioRef.current;
      if (!a) return;
      // Skip the dedicated audio toggle (desktop only) — its own click
      // handler runs next and would flip mute back on.
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-audio-toggle]")) return;

      a.muted = false;
      // Re-assert volume in case iOS dropped it.
      a.volume = VOLUME;
      const p = a.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          startedRef.current = true;
          notify();
          removeUnlockListeners();
        }).catch(() => {
          /* leave listeners attached — try again on the next gesture */
        });
      } else {
        startedRef.current = true;
        notify();
        removeUnlockListeners();
      }
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

    // Try muted autoplay (desktop). If it fails, the gesture listeners
    // below pick up the slack.
    startMuted();
    audio.addEventListener("loadedmetadata", startMuted, { once: true });

    // Gesture listeners. touchstart/touchend/click cover mobile (iOS
    // rejects audio.play() unless it runs inside one of these). pointer*
    // and scroll cover desktop so audio fades in on the first hint of
    // presence — no click required.
    window.addEventListener("pointermove", unlock, { passive: true });
    window.addEventListener("mousemove", unlock, { passive: true });
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("touchend", unlock, { passive: true });
    window.addEventListener("click", unlock);
    window.addEventListener("scroll", unlock, { passive: true });

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
      removeUnlockListeners();
      document.removeEventListener("visibilitychange", onVisibility);
      audio.removeEventListener("loadedmetadata", startMuted);
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
  // playback (gesture listeners unlock it on first tap).
  return null;
}
