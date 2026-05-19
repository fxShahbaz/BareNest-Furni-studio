"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  signUpWithPassword,
  signInWithGoogle,
  type AuthState,
} from "@/app/auth/actions";
import { GoogleIcon } from "@/components/icons/google";

export default function SignUpForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<AuthState, FormData>(
    signUpWithPassword,
    undefined
  );

  return (
    <div className="mt-10 space-y-6">
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-ink/20 bg-bone px-5 py-3 text-sm font-medium text-ink hover:bg-cream"
        >
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </button>
      </form>

      <p className="text-center text-[11px] text-muted">
        You&apos;ll add your phone number from your profile so we can link
        your orders. Takes 10 seconds.
      </p>

      <div className="relative">
        <div className="hairline" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted">
          or with email
        </span>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <Field
          name="name"
          label="Full name"
          autoComplete="name"
          required
          minLength={2}
        />
        <Field
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          required
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
          hint="10-digit mobile. We use it to confirm orders on WhatsApp and surface your purchase history."
        />
        <Field
          name="password"
          type="password"
          label="Password (8+ characters)"
          autoComplete="new-password"
          minLength={8}
          required
        />
        {state?.error && (
          <p className="text-sm text-rust">{state.error}</p>
        )}
        <SubmitButton label="Create account" />
        <p className="text-xs text-muted">
          You may need to confirm your email before signing in.
        </p>
      </form>
    </div>
  );
}

function Field({
  name,
  type = "text",
  label,
  autoComplete,
  required,
  minLength,
  pattern,
  placeholder,
  inputMode,
  hint,
}: {
  name: string;
  type?: string;
  label: string;
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
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        pattern={pattern}
        placeholder={placeholder}
        inputMode={inputMode}
        className="mt-2 w-full rounded-full border border-ink/15 bg-bone px-5 py-3 text-sm focus:border-ink focus:outline-none"
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-ink px-5 py-3 text-sm text-bone disabled:opacity-60"
    >
      {pending ? "…" : label}
    </button>
  );
}
