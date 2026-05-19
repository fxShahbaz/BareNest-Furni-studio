"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  signInWithPassword,
  signInWithGoogle,
  type AuthState,
} from "@/app/auth/actions";

export default function SignInForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<AuthState, FormData>(
    signInWithPassword,
    undefined
  );

  return (
    <div className="mt-10 space-y-6">
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="w-full rounded-full border border-ink/20 bg-bone px-5 py-3 text-sm text-ink hover:bg-cream"
        >
          Continue with Google
        </button>
      </form>

      <div className="relative">
        <div className="hairline" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted">
          or with email
        </span>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <Field name="email" type="email" label="Email" autoComplete="email" required />
        <Field
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          required
        />
        {state?.error && (
          <p className="text-sm text-rust">{state.error}</p>
        )}
        <SubmitButton label="Sign in" />
      </form>
    </div>
  );
}

function Field({
  name,
  type,
  label,
  autoComplete,
  required,
}: {
  name: string;
  type: string;
  label: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="mt-2 w-full rounded-full border border-ink/15 bg-bone px-5 py-3 text-sm focus:border-ink focus:outline-none"
      />
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
