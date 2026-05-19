"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signOut } from "@/app/auth/actions";
import { updateProfile, type AccountUpdateState } from "./actions";
import { CheckCircle2, LogOut } from "lucide-react";

export default function AccountProfileForm({
  initialName,
  initialPhone,
}: {
  initialName: string;
  initialPhone: string;
}) {
  const [state, formAction] = useActionState<AccountUpdateState, FormData>(
    updateProfile,
    undefined
  );
  const needsPhone = !initialPhone;

  return (
    <div className="mt-6 space-y-4">
      <form action={formAction} className="space-y-4">
        <Field
          name="name"
          label="Full name"
          defaultValue={initialName}
          autoComplete="name"
          required
          minLength={2}
        />
        <Field
          name="phone"
          type="tel"
          label="Phone (Indian mobile)"
          defaultValue={initialPhone}
          autoComplete="tel"
          inputMode="tel"
          pattern="(?:\+?91[\s-]?|0)?[6-9]\d{9}"
          placeholder="98XXXXXXXX"
          required
          hint={
            needsPhone
              ? "Used to confirm orders on WhatsApp and link your past purchases."
              : undefined
          }
        />

        {state?.error && (
          <p className="text-sm text-rust">{state.error}</p>
        )}
        {state?.ok && (
          <p className="inline-flex items-center gap-1.5 text-sm text-leaf">
            <CheckCircle2 className="h-4 w-4" /> Saved.
          </p>
        )}

        <SaveButton label={needsPhone ? "Add phone & save" : "Save changes"} />
      </form>

      <div className="border-t border-ink/10 pt-4">
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-sm hover:bg-ink/5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </form>
      </div>
    </div>
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
  inputMode,
  placeholder,
  hint,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  pattern?: string;
  inputMode?:
    | "text"
    | "tel"
    | "numeric"
    | "email"
    | "url"
    | "search"
    | "decimal"
    | "none";
  placeholder?: string;
  hint?: string;
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
        inputMode={inputMode}
        placeholder={placeholder}
        className="mt-2 w-full rounded-full border border-ink/15 bg-bone px-5 py-3 text-sm focus:border-ink focus:outline-none"
      />
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-ink px-5 py-3 text-sm text-bone disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}
