"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowUpRight, Check } from "lucide-react";
import { subscribe, type SubscribeState } from "./newsletter-action";

export default function NewsletterForm() {
  const [state, formAction] = useActionState<SubscribeState, FormData>(
    subscribe,
    undefined
  );

  if (state?.ok) {
    return (
      <div className="mt-8 flex max-w-md items-center gap-3 border-b border-bone/30 pb-3 text-sm text-bone/90">
        <Check className="h-4 w-4" />
        You're on the list. We'll be in touch.
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-8 flex max-w-md items-center gap-2 border-b border-bone/30 pb-3"
    >
      <input
        type="email"
        name="email"
        required
        placeholder="your@email.com"
        className="flex-1 bg-transparent text-sm placeholder:text-bone/40 focus:outline-none"
      />
      <SubmitButton />
      {state?.error && (
        <span className="ml-3 text-xs text-rust">{state.error}</span>
      )}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1 text-sm text-bone hover:text-bone/80 disabled:opacity-60"
    >
      {pending ? "Sending…" : "Notify me"}
      <ArrowUpRight className="h-3.5 w-3.5" />
    </button>
  );
}
