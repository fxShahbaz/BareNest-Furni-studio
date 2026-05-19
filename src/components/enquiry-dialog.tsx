"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { MessageCircle, X, Check, ArrowUpRight } from "lucide-react";
import { formatINR } from "@/lib/utils";
import {
  createEnquiry,
  type EnquiryState,
} from "@/app/(site)/enquiry-action";

export type EnquiryProduct = {
  slug: string;
  name: string;
  material: string;
  price: number;
  image?: string;
};

export default function EnquiryDialog({
  open,
  onClose,
  product,
}: {
  open: boolean;
  onClose: () => void;
  product: EnquiryProduct;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [qty, setQty] = useState(1);
  const [state, formAction] = useActionState<EnquiryState, FormData>(
    createEnquiry,
    undefined
  );

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  // Reset qty when opening for a fresh product
  useEffect(() => {
    if (open) setQty(1);
  }, [open, product.slug]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="w-[calc(100vw-1.5rem)] max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-3xl border border-ink/10 bg-bone p-6 text-ink shadow-2xl backdrop:bg-ink/50 backdrop:backdrop-blur-sm sm:p-7"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-ink/10 text-ink/60 hover:bg-ink/5 hover:text-ink"
      >
        <X className="h-4 w-4" />
      </button>

      {state?.ok ? (
        <SuccessView
          whatsappUrl={state.whatsappUrl}
          customerName={product.name}
          onClose={onClose}
        />
      ) : (
        <>
          <p className="eyebrow text-muted">enquiry</p>
          <h2 className="mt-2 font-display text-2xl">
            About <span className="serif-italic">{product.name}</span>
          </h2>
          <p className="mt-2 text-xs text-muted">
            {product.material} · {formatINR(product.price)} each
          </p>

          <form action={formAction} className="mt-5 space-y-3">
            <input type="hidden" name="product_slug" value={product.slug} />
            <input type="hidden" name="qty" value={qty} />

            <div className="flex items-center justify-between rounded-2xl border border-ink/10 bg-cream/40 p-3">
              <span className="text-sm">Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-7 w-7 place-items-center rounded-full border border-ink/15 hover:bg-ink/5"
                  aria-label="Decrease"
                >
                  −
                </button>
                <span className="w-8 text-center font-display text-lg">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="grid h-7 w-7 place-items-center rounded-full border border-ink/15 hover:bg-ink/5"
                  aria-label="Increase"
                >
                  +
                </button>
              </div>
            </div>

            <Field name="customer_name" placeholder="Your name" required />
            <Field
              name="customer_phone"
              placeholder="Phone (10 digits)"
              type="tel"
              required
            />
            <Field
              name="customer_email"
              placeholder="Email (optional)"
              type="email"
            />
            <Field
              name="message"
              placeholder="Anything else? (optional)"
              textarea
            />

            {state?.error && (
              <p
                role="alert"
                className="rounded-xl border border-rust/30 bg-rust/10 px-3 py-2 text-xs text-rust"
              >
                {state.error}
              </p>
            )}

            <div className="pt-1">
              <SubmitButton />
            </div>
            <p className="text-center text-[10px] uppercase tracking-[0.18em] text-muted">
              We&apos;ll get back within a day · Patna
            </p>
          </form>
        </>
      )}
    </dialog>
  );
}

function SuccessView({
  whatsappUrl,
  customerName,
  onClose,
}: {
  whatsappUrl?: string;
  customerName: string;
  onClose: () => void;
}) {
  return (
    <div className="py-2 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-leaf/15 text-leaf">
        <Check className="h-5 w-5" />
      </div>
      <h2 className="mt-4 font-display text-2xl">Enquiry received</h2>
      <p className="mt-2 text-sm text-ink/70">
        Thanks. We&apos;ve logged your interest in{" "}
        <span className="serif-italic">{customerName}</span>. Someone from the
        studio will reach out shortly.
      </p>

      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-2.5 text-sm text-bone hover:bg-leaf/90"
        >
          <MessageCircle className="h-4 w-4" />
          Chat on WhatsApp
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={onClose}
          className="text-xs uppercase tracking-[0.18em] text-muted hover:text-ink"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Field({
  name,
  placeholder,
  type = "text",
  required,
  textarea,
}: {
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  if (textarea) {
    return (
      <textarea
        name={name}
        placeholder={placeholder}
        required={required}
        rows={3}
        className="w-full rounded-2xl border border-ink/15 bg-bone px-4 py-3 text-sm placeholder:text-muted focus:border-ink focus:outline-none"
      />
    );
  }
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-full border border-ink/15 bg-bone px-5 py-3 text-sm placeholder:text-muted focus:border-ink focus:outline-none"
    />
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-bone hover:bg-bark disabled:opacity-60"
    >
      {pending ? "Sending…" : "Submit enquiry"}
    </button>
  );
}
