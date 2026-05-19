"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/store/cart";
import { formatINR, formatTaxLabel } from "@/lib/utils";
import { compressMany } from "@/lib/image-compression";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Check,
  FileText,
  Hash,
  Loader2,
  MapPin,
  MessageCircle,
  Phone as PhoneIcon,
  ShieldCheck,
  StickyNote,
  Truck,
  User as UserIcon,
  X,
} from "lucide-react";
import { submitOrder, type CheckoutState } from "./actions";

const MAX_ATTACHMENTS = 6;
const MAX_FILE_MB = 8;
const MAX_NOTES_LEN = 600;

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);
  const taxSummary = (() => {
    if (items.length === 0) return "Included";
    const inclCount = items.filter((i) => (i.tax_inclusive ?? true)).length;
    if (inclCount === items.length) return "Included";
    if (inclCount === 0) return "Listed per item";
    return "See each item";
  })();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const [state, formAction] = useActionState<CheckoutState, FormData>(
    submitOrder,
    undefined
  );

  useEffect(() => {
    if (state?.redirectTo) return;
    if (ready && items.length === 0) router.replace("/cart");
  }, [ready, items.length, router, state]);

  useEffect(() => {
    if (state?.redirectTo) {
      router.push(state.redirectTo);
      clear();
    }
  }, [state, clear, router]);

  if (!ready) return <div className="pt-40" />;

  return (
    <div className="pt-28 pb-32 md:pt-32">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        {/* HEADER */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-muted">Checkout</p>
            <h1 className="mt-2 font-display text-3xl tracking-tight md:text-5xl">
              Last few <span className="serif-italic">details.</span>
            </h1>
            <p className="mt-3 max-w-[44ch] text-sm text-muted">
              We&apos;ll save your order and confirm everything over WhatsApp —
              no payment now.
            </p>
          </div>
          <Steps />
        </div>

        <form
          action={formAction}
          className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12"
        >
          {/* cart state piped to server */}
          <input type="hidden" name="items" value={JSON.stringify(items)} />

          {/* LEFT — form */}
          <div className="md:col-span-7 space-y-6">
            <FormCard
              title="Contact"
              caption="So we can reach you for confirmation."
            >
              <Field
                name="name"
                label="Full name"
                required
                autoComplete="name"
                minLength={2}
                icon={<UserIcon className="h-4 w-4" />}
                placeholder="As it should appear on the invoice"
              />
              <PhoneField />
            </FormCard>

            <FormCard
              title="Delivery address"
              caption="Used to plan dispatch and final-mile rates."
            >
              <Field
                name="address"
                label="Street, building, landmark"
                required
                autoComplete="street-address"
                minLength={6}
                icon={<MapPin className="h-4 w-4" />}
                placeholder="House / flat no., street, landmark"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  name="city"
                  label="City"
                  required
                  autoComplete="address-level2"
                  icon={<Truck className="h-4 w-4" />}
                  placeholder="Patna"
                />
                <Field
                  name="pincode"
                  label="Pincode"
                  required
                  autoComplete="postal-code"
                  inputMode="numeric"
                  pattern="[1-9]\d{5}"
                  maxLength={6}
                  icon={<Hash className="h-4 w-4" />}
                  placeholder="6-digit"
                />
              </div>
            </FormCard>

            <FormCard
              title="GST / business billing"
              caption="Buying for a business? Add your GSTIN to claim input credit on the tax invoice."
              optional
            >
              <Field
                name="gstin"
                label="GSTIN"
                autoComplete="off"
                pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]"
                maxLength={15}
                icon={<FileText className="h-4 w-4" />}
                placeholder="15-char, e.g. 10ABCDE1234F1Z5"
                hint="Auto-uppercased on submit. Leave blank if not applicable."
              />
            </FormCard>

            <FormCard
              title="Anything we should know?"
              caption="Stair access, parking, preferred delivery window — all useful."
              optional
            >
              <NotesField />
              <AttachmentsField />
            </FormCard>

            {state?.error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-rust/30 bg-rust/5 px-4 py-3 text-sm text-rust"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}
          </div>

          {/* RIGHT — summary */}
          <aside className="md:col-span-5">
            <div className="md:sticky md:top-28">
              <div className="rounded-3xl border border-ink/10 bg-cream/40 p-6 md:p-7">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-xl">Your order</h2>
                  <Link
                    href="/cart"
                    className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
                  >
                    Edit cart
                  </Link>
                </div>

                <ul className="mt-5 space-y-3">
                  {items.map((i) => (
                    <li key={i.slug} className="flex items-center gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-bone">
                        <Image
                          src={i.image}
                          alt={i.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-medium text-bone">
                          {i.qty}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm leading-tight">{i.name}</p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                          {i.material}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm tabular-nums">
                          {formatINR(i.price * i.qty)}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-muted/70">
                          {formatTaxLabel(i.gst_rate, i.tax_inclusive)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <dl className="mt-6 space-y-2 border-t border-ink/10 pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">Subtotal</dt>
                    <dd className="tabular-nums">{formatINR(total)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Delivery</dt>
                    <dd className="text-muted">Confirmed on WhatsApp</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">GST</dt>
                    <dd className="text-muted">{taxSummary}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-baseline justify-between border-t border-ink/10 pt-4">
                  <span className="font-display text-base">Total</span>
                  <span className="font-display text-2xl tabular-nums">
                    {formatINR(total)}
                  </span>
                </div>

                {/* Desktop submit */}
                <div className="mt-6 hidden md:block">
                  <SubmitButton fullWidth />
                </div>

                <p className="mt-3 hidden text-center text-[11px] text-muted md:block">
                  Final total verified against the catalogue at order time.
                </p>
              </div>

              <ul className="mt-5 space-y-2 text-xs text-muted">
                <Reassure
                  icon={<MessageCircle className="h-3.5 w-3.5" />}
                  text="No payment now — we confirm on WhatsApp first."
                />
                <Reassure
                  icon={<ShieldCheck className="h-3.5 w-3.5" />}
                  text="Cash, UPI, or card-on-device at delivery."
                />
                <Reassure
                  icon={<Truck className="h-3.5 w-3.5" />}
                  text="White-glove placement inside Patna."
                />
              </ul>
            </div>
          </aside>

          {/* Mobile sticky submit */}
          <div className="md:hidden">
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-bone/95 backdrop-blur">
              <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-6 py-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                    Total
                  </p>
                  <p className="font-display text-lg leading-none tabular-nums">
                    {formatINR(total)}
                  </p>
                </div>
                <SubmitButton />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Steps ---------------- */

function Steps() {
  const steps = [
    { label: "Cart", done: true },
    { label: "Details", current: true },
    { label: "Confirm", done: false },
  ];
  return (
    <ol className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted">
      {steps.map((s, i) => (
        <li key={s.label} className="flex items-center gap-2">
          <span
            className={`grid h-6 w-6 place-items-center rounded-full border text-[10px] ${
              s.current
                ? "border-ink bg-ink text-bone"
                : s.done
                ? "border-leaf/40 bg-leaf/15 text-leaf"
                : "border-ink/15 text-muted"
            }`}
          >
            {s.done ? <Check className="h-3 w-3" /> : i + 1}
          </span>
          <span className={s.current ? "text-ink" : ""}>{s.label}</span>
          {i < steps.length - 1 && (
            <span className="mx-1 h-px w-6 bg-ink/15 md:w-8" />
          )}
        </li>
      ))}
    </ol>
  );
}

/* ---------------- Form card wrapper ---------------- */

function FormCard({
  title,
  caption,
  optional,
  children,
}: {
  title: string;
  caption?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-ink/10 bg-bone p-5 md:p-7">
      <header className="mb-5 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">{title}</h2>
          {caption && <p className="mt-1 text-xs text-muted">{caption}</p>}
        </div>
        {optional && (
          <span className="rounded-full border border-ink/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted">
            Optional
          </span>
        )}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/* ---------------- Submit ---------------- */

function SubmitButton({ fullWidth }: { fullWidth?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`group inline-flex items-center justify-center gap-2.5 rounded-full bg-ink px-6 py-3.5 text-sm text-bone transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60 ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {pending ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-bone/40 border-t-bone" />
          Placing order…
        </>
      ) : (
        <>
          <WhatsAppGlyph className="h-4 w-4" />
          Place order
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.768.967-.941 1.164-.174.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.58-.487-.501-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.371-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.695.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.36-.214-3.741.982 1-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ---------------- Phone (with +91 prefix) ---------------- */

function PhoneField() {
  return (
    <label className="block">
      <span className="eyebrow text-muted">Phone</span>
      <div className="mt-2 flex items-stretch overflow-hidden rounded-2xl border border-ink/15 bg-bone focus-within:border-ink">
        <span className="flex items-center gap-1.5 border-r border-ink/10 bg-cream/60 px-3 text-xs font-medium text-ink/80">
          <PhoneIcon className="h-3.5 w-3.5" />
          +91
        </span>
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          pattern="(?:\+?91[\s-]?|0)?[6-9]\d{9}"
          placeholder="98XXXXXXXX"
          className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none"
        />
      </div>
      <span className="mt-1 block text-xs text-muted">
        We&apos;ll WhatsApp you to confirm delivery — no marketing.
      </span>
    </label>
  );
}

/* ---------------- Notes ---------------- */

function NotesField() {
  const [val, setVal] = useState("");
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="eyebrow text-muted">Notes</span>
        <span className="text-[11px] text-muted">
          {val.length}/{MAX_NOTES_LEN}
        </span>
      </div>
      <div className="mt-2 rounded-2xl border border-ink/15 bg-bone p-3 focus-within:border-ink">
        <div className="flex items-start gap-2">
          <StickyNote className="mt-1 h-4 w-4 shrink-0 text-muted" />
          <textarea
            name="notes"
            rows={3}
            maxLength={MAX_NOTES_LEN}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Lift size, narrow stairs, weekend delivery, etc."
            className="w-full resize-none bg-transparent text-sm focus:outline-none"
          />
        </div>
      </div>
    </label>
  );
}

/* ---------------- Attachments (drop zone) ---------------- */

function AttachmentsField() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [originalBytes, setOriginalBytes] = useState(0);
  const [compressedBytes, setCompressedBytes] = useState(0);

  const oversized = files.filter((f) => f.size > MAX_FILE_MB * 1024 * 1024);
  const overCount = files.length > MAX_ATTACHMENTS;
  const savings =
    originalBytes > 0 && compressedBytes < originalBytes
      ? Math.round((1 - compressedBytes / originalBytes) * 100)
      : 0;

  // Sync compressed files back into the <input>, so the natural form
  // submission uploads our compressed versions rather than the originals.
  const inputRef = useRef<HTMLInputElement | null>(null);
  function syncInputFiles(next: File[]) {
    const input = inputRef.current;
    if (!input) return;
    const dt = new DataTransfer();
    for (const f of next) dt.items.add(f);
    input.files = dt.files;
  }

  async function onPick(list: FileList | null) {
    if (!list) return;
    const raw = Array.from(list);
    if (raw.length === 0) return;

    setOriginalBytes(raw.reduce((s, f) => s + f.size, 0));
    setCompressing(true);
    try {
      const compressed = await compressMany(raw, {
        maxDimension: 2000,
        quality: 0.82,
      });
      setFiles(compressed);
      syncInputFiles(compressed);
      setCompressedBytes(compressed.reduce((s, f) => s + f.size, 0));
    } finally {
      setCompressing(false);
    }
  }

  function remove(idx: number) {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      syncInputFiles(next);
      // Update totals to reflect the visible set.
      setCompressedBytes(next.reduce((s, f) => s + f.size, 0));
      return next;
    });
  }

  function formatBytes(n: number) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <label className="block">
      <span className="eyebrow text-muted">Room photos</span>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onPick(e.dataTransfer.files);
        }}
        className={`relative mt-2 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-5 py-6 text-center transition-colors ${
          dragOver
            ? "border-ink bg-cream/60"
            : "border-ink/15 bg-cream/30 hover:bg-cream/50"
        }`}
      >
        {compressing ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted" />
        ) : (
          <Camera className="h-5 w-5 text-muted" />
        )}
        <p className="text-sm text-ink">
          {compressing ? (
            "Compressing photos…"
          ) : (
            <>
              Drag photos here, or{" "}
              <span className="underline underline-offset-2">browse</span>
            </>
          )}
        </p>
        <p className="text-[11px] text-muted">
          JPG / PNG · up to {MAX_ATTACHMENTS} files · auto-compressed before
          upload
        </p>
        <input
          ref={inputRef}
          name="attachments"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onPick(e.target.files)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {files.map((f, idx) => {
            const url = URL.createObjectURL(f);
            const tooBig = f.size > MAX_FILE_MB * 1024 * 1024;
            return (
              <li
                key={`${f.name}-${idx}`}
                className="group relative aspect-square overflow-hidden rounded-xl border border-ink/10 bg-bone"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={f.name}
                  className="h-full w-full object-cover"
                />
                {tooBig && (
                  <span className="absolute inset-x-1 bottom-1 rounded-md bg-rust/90 px-1.5 py-0.5 text-center text-[10px] text-bone">
                    Too big
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  aria-label={`Remove ${f.name}`}
                  className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-ink/80 text-bone opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {(oversized.length > 0 || overCount) && (
        <span className="mt-2 block text-xs text-rust">
          {overCount &&
            `Only the first ${MAX_ATTACHMENTS} will be sent. `}
          {oversized.length > 0 &&
            `${oversized.length} file${oversized.length > 1 ? "s" : ""} over ${MAX_FILE_MB}MB will be skipped.`}
        </span>
      )}

      {savings > 0 && (
        <span className="mt-2 block text-xs text-leaf">
          Photos compressed: {formatBytes(originalBytes)} →{" "}
          {formatBytes(compressedBytes)} ({savings}% smaller). Faster upload.
        </span>
      )}
    </label>
  );
}

/* ---------------- Reassurance row ---------------- */

function Reassure({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <li className="flex items-center gap-2">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-ink/5 text-ink/70">
        {icon}
      </span>
      {text}
    </li>
  );
}

/* ---------------- Generic field (with icon) ---------------- */

function Field({
  name,
  label,
  type = "text",
  required,
  hint,
  autoComplete,
  inputMode,
  pattern,
  minLength,
  maxLength,
  icon,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  hint?: string;
  autoComplete?: string;
  inputMode?:
    | "text"
    | "tel"
    | "numeric"
    | "email"
    | "url"
    | "search"
    | "decimal"
    | "none";
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  icon?: React.ReactNode;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted">{label}</span>
      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-ink/15 bg-bone px-4 py-3 focus-within:border-ink">
        {icon && <span className="text-muted">{icon}</span>}
        <input
          name={name}
          required={required}
          type={type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          pattern={pattern}
          minLength={minLength}
          maxLength={maxLength}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </div>
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
