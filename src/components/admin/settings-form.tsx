"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ShoppingBag, MessageSquare } from "lucide-react";
import { updateSettings } from "@/app/admin/(gated)/actions";

export default function SettingsForm({
  initial,
}: {
  initial: { online_ordering_enabled: boolean };
}) {
  const [enabled, setEnabled] = useState(initial.online_ordering_enabled);

  return (
    <form action={updateSettings} className="space-y-8">
      <section className="rounded-3xl border border-ink/10 bg-cream/30 p-6 md:p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="eyebrow text-muted">storefront</p>
            <h2 className="mt-2 font-display text-2xl">Accept online orders</h2>
            <p className="mt-3 max-w-prose text-sm text-ink/70">
              When this is on, customers can add products to a cart and
              complete checkout. Turn it off if you&apos;d rather collect
              enquiries first and confirm orders by hand.
            </p>
          </div>
          <Toggle
            checked={enabled}
            onChange={setEnabled}
            name="online_ordering_enabled"
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Mode
            icon={ShoppingBag}
            active={enabled}
            title="Ordering mode"
            description="Cart + checkout flow with WhatsApp handoff. Orders appear in /admin/orders."
          />
          <Mode
            icon={MessageSquare}
            active={!enabled}
            title="Enquiry mode"
            description="Product pages show an Enquire button instead. Cart/checkout are hidden. Submissions land in /admin/enquiries."
          />
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <SaveButton dirty={enabled !== initial.online_ordering_enabled} />
      </div>
    </form>
  );
}

function Toggle({
  checked,
  onChange,
  name,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  name: string;
}) {
  return (
    <label
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? "bg-leaf" : "bg-ink/20"
      }`}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={`inline-block h-5 w-5 transform rounded-full bg-bone shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </label>
  );
}

function Mode({
  icon: Icon,
  active,
  title,
  description,
}: {
  icon: typeof ShoppingBag;
  active: boolean;
  title: string;
  description: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        active
          ? "border-ink bg-bone shadow-sm"
          : "border-ink/10 bg-bone/40 opacity-60"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${active ? "text-ink" : "text-muted"}`} />
        <p className="text-sm font-medium">{title}</p>
        {active && (
          <span className="ml-auto rounded-full bg-leaf/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-leaf">
            active
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-ink/70">{description}</p>
    </div>
  );
}

function SaveButton({ dirty }: { dirty: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={!dirty || pending}
      className="rounded-full bg-ink px-5 py-2.5 text-sm text-bone transition-colors hover:bg-bark disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Saving…" : dirty ? "Save changes" : "Saved"}
    </button>
  );
}
