"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { completeOnboarding, type OnboardingState } from "./actions";

export default function OnboardingForm({
  email,
  guessName,
  next,
}: {
  email: string;
  guessName: string;
  next: string;
}) {
  const [state, formAction] = useActionState<OnboardingState, FormData>(
    completeOnboarding,
    undefined
  );

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />

      <label className="block">
        <span className="eyebrow text-muted">Signed in as</span>
        <p className="mt-2 rounded-2xl border border-ink/15 bg-cream/40 px-4 py-3 text-sm text-ink/80">
          {email || "—"}
        </p>
      </label>

      <Field
        name="name"
        label="Full name"
        defaultValue={guessName}
        autoComplete="name"
        required
        minLength={2}
      />

      <Field
        name="phone"
        type="tel"
        label="Phone (Indian mobile)"
        autoComplete="tel"
        inputMode="tel"
        pattern="(?:\+?91[\s-]?|0)?[6-9]\d{9}"
        placeholder="98XXXXXXXX"
        required
      />

      {state?.error && <p className="text-sm text-rust">{state.error}</p>}

      <Submit />

      <p className="text-xs text-muted">
        Your phone is private. We never sell it; we use it only for order
        confirmation and to link past purchases to this account.
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  autoComplete,
  required,
  minLength,
  pattern,
  placeholder,
  inputMode,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  pattern?: string;
  placeholder?: string;
  inputMode?:
    | "text"
    | "tel"
    | "numeric"
    | "email"
    | "url"
    | "search"
    | "decimal"
    | "none";
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        pattern={pattern}
        placeholder={placeholder}
        inputMode={inputMode}
        className="mt-2 w-full rounded-full border border-ink/15 bg-bone px-5 py-3 text-sm focus:border-ink focus:outline-none"
      />
    </label>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-ink px-5 py-3 text-sm text-bone disabled:opacity-60"
    >
      {pending ? "Saving…" : "Finish setup"}
    </button>
  );
}
