"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { adminSignIn, type AdminSignInState } from "./actions";

export default function AdminSignInForm() {
  const [state, formAction] = useActionState<AdminSignInState, FormData>(
    adminSignIn,
    undefined
  );

  return (
    <form action={formAction} className="mt-10 space-y-4">
      <Field name="email" type="email" label="Email" autoComplete="email" required />
      <Field
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
      />
      {state?.error && (
        <p className="rounded-2xl border border-rust/40 bg-rust/10 px-4 py-3 text-sm text-rust">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
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
      <span className="text-[10px] uppercase tracking-[0.18em] text-bone/60">
        {label}
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="mt-2 w-full rounded-full border border-bone/20 bg-bark px-5 py-3 text-sm text-bone placeholder:text-bone/40 focus:border-bone/60 focus:outline-none"
      />
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-bone px-5 py-3 text-sm text-ink disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
