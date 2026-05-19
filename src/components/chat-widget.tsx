"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Leaf, Check, Phone } from "lucide-react";
import { submitChat, type ChatTurn } from "@/app/(site)/chat-action";
import { SHOWROOM } from "@/lib/utils";

type Step = "name" | "topic" | "phone" | "message" | "done";

const TOPICS = [
  "Browse the catalogue",
  "Custom piece / made-to-order",
  "Visit the studio",
  "Something else",
] as const;

const PHONE_RE = /^(?:\+?91[\s-]?|0)?[6-9]\d{9}$/;

function now() {
  return new Date().toISOString();
}

function botGreeting(): ChatTurn {
  return {
    role: "bot",
    content:
      "Hi! I'm the bare nest helper. We're inaugurating 18 June 2026 in Patna. What's your name?",
    at: now(),
  };
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("name");
  const [transcript, setTranscript] = useState<ChatTurn[]>([botGreeting()]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new turn
  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [transcript, step]);

  // Focus input when panel opens or step changes (except topic chips / done)
  useEffect(() => {
    if (!open) return;
    if (step === "topic" || step === "done") return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 250);
    return () => window.clearTimeout(id);
  }, [open, step]);

  // Lock page scroll while the panel is open so the dimmed background
  // can't drift behind it. Also pause Lenis (site-wide smooth scroller).
  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = "hidden";
      window.__lenis?.stop();
    } else {
      window.__lenis?.start();
    }
    return () => {
      document.body.style.overflow = prev;
      window.__lenis?.start();
    };
  }, [open]);

  function pushBot(content: string) {
    setTranscript((t) => [...t, { role: "bot", content, at: now() }]);
  }
  function pushUser(content: string) {
    setTranscript((t) => [...t, { role: "user", content, at: now() }]);
  }

  function handleNameSubmit() {
    const v = input.trim();
    if (v.length < 2) {
      setError("Please share a name with at least 2 letters.");
      return;
    }
    setError(null);
    setName(v);
    pushUser(v);
    setInput("");
    setStep("topic");
    window.setTimeout(() => {
      pushBot(
        `Lovely to meet you, ${v.split(" ")[0]}. What brings you in today?`
      );
    }, 350);
  }

  function handleTopicPick(t: string) {
    setTopic(t);
    pushUser(t);
    setStep("phone");
    window.setTimeout(() => {
      pushBot(
        "Got it. What's the best phone number to reach you on? (10-digit Indian mobile)"
      );
    }, 350);
  }

  function handlePhoneSubmit() {
    const v = input.trim().replace(/[\s-]/g, "");
    if (!PHONE_RE.test(v)) {
      setError("That doesn't look like a valid Indian mobile number.");
      return;
    }
    setError(null);
    setPhone(v);
    pushUser(v);
    setInput("");
    setStep("message");
    window.setTimeout(() => {
      pushBot(
        "Anything specific you'd like our team to know? (or send blank to skip)"
      );
    }, 350);
  }

  async function handleMessageSubmit() {
    const v = input.trim();
    if (v) pushUser(v);
    else pushUser("(no extra notes)");
    setInput("");
    setSubmitting(true);
    setError(null);

    // Build the final transcript locally — state updates are async, so we
    // can't rely on `transcript` already including the just-pushed turn.
    const finalTranscript: ChatTurn[] = [
      ...transcript,
      { role: "user", content: v || "(no extra notes)", at: now() },
    ];

    const res = await submitChat({
      name,
      phone,
      topic,
      message: v,
      transcript: finalTranscript,
    });

    setSubmitting(false);
    if (res?.error) {
      setError(res.error);
      // Stay on message step so the user can retry.
      return;
    }
    setStep("done");
    window.setTimeout(() => {
      pushBot(
        `Thanks, ${name.split(" ")[0]} — we've got your details. Someone from the studio will reach out within a few hours. Need to speak to us sooner? Tap "Call us" below.`
      );
    }, 350);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (step === "name") handleNameSubmit();
    else if (step === "phone") handlePhoneSubmit();
    else if (step === "message") handleMessageSubmit();
  }

  const placeholder =
    step === "name"
      ? "Your name"
      : step === "phone"
      ? "98765 43210"
      : step === "message"
      ? "Tell us a bit more (optional)"
      : "";

  return (
    <>
      {/* Floating launcher — desktop only */}
      <button
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[55] hidden h-14 w-14 place-items-center rounded-full bg-ink text-bone shadow-[0_18px_40px_-12px_rgba(20,17,14,0.55)] transition-transform hover:-translate-y-0.5 active:scale-95 md:grid"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="msg"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
        {/* Subtle pulse to draw the eye when closed */}
        {!open && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-bone/30"
          />
        )}
      </button>

      {/* Panel + dimmed backdrop */}
      <AnimatePresence>
        {open && (
          <motion.button
            key="chat-backdrop"
            type="button"
            aria-label="Close chat"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 z-[50] hidden cursor-default bg-bark/35 backdrop-blur-[3px] md:block"
          />
        )}
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="false"
            aria-label="Chat with bare nest"
            className="fixed bottom-24 right-6 z-[55] hidden w-[380px] flex-col overflow-hidden rounded-3xl border border-ink/10 bg-bone shadow-[0_30px_70px_-20px_rgba(20,17,14,0.45)] md:flex"
            style={{ maxHeight: "min(560px, calc(100vh - 8rem))" }}
          >
            {/* Header */}
            <header className="flex items-center justify-between gap-3 border-b border-ink/10 bg-cream/60 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf/15 text-leaf">
                  <Leaf className="h-4 w-4" />
                </span>
                <div className="leading-tight">
                  <p className="font-wordmark text-lg">
                    <span className="text-walnut">bare</span>{" "}
                    <span className="text-leaf">nest</span>
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                    Studio · Patna
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 text-ink/70 hover:bg-ink/5"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            {/* Body */}
            <div
              ref={bodyRef}
              className="flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:thin]"
            >
              <ul className="space-y-2.5">
                {transcript.map((t, i) => (
                  <li
                    key={i}
                    className={
                      t.role === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >
                    <span
                      className={
                        t.role === "user"
                          ? "max-w-[80%] rounded-2xl rounded-br-md bg-ink px-3.5 py-2 text-sm text-bone"
                          : "max-w-[80%] rounded-2xl rounded-bl-md bg-cream px-3.5 py-2 text-sm text-ink"
                      }
                    >
                      {t.content}
                    </span>
                  </li>
                ))}

                {step === "topic" && (
                  <li className="flex flex-wrap gap-2 pt-1">
                    {TOPICS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleTopicPick(t)}
                        className="rounded-full border border-ink/15 bg-bone px-3 py-1.5 text-xs text-ink/80 transition-colors hover:bg-ink hover:text-bone"
                      >
                        {t}
                      </button>
                    ))}
                  </li>
                )}

                {error && (
                  <li className="text-xs text-rust">{error}</li>
                )}
              </ul>
            </div>

            {/* Composer */}
            {step !== "topic" && step !== "done" && (
              <form
                onSubmit={onSubmit}
                className="flex items-center gap-2 border-t border-ink/10 bg-bone px-3 py-2.5"
              >
                <input
                  ref={inputRef}
                  type={step === "phone" ? "tel" : "text"}
                  inputMode={step === "phone" ? "tel" : "text"}
                  autoComplete={
                    step === "name"
                      ? "name"
                      : step === "phone"
                      ? "tel"
                      : "off"
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={placeholder}
                  disabled={submitting}
                  className="flex-1 rounded-full bg-cream/60 px-4 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-leaf/40"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  aria-label="Send"
                  className="grid h-9 w-9 place-items-center rounded-full bg-ink text-bone transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}

            {step === "done" && (
              <div className="border-t border-ink/10 bg-leaf/10 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-leaf">
                  <Check className="h-4 w-4" /> Message sent
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <a
                    href={`tel:+${SHOWROOM.whatsappE164}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-medium text-bone transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call us if urgent
                  </a>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-leaf/30 px-3 py-2 text-xs text-leaf hover:bg-leaf/10"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
