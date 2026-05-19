"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import EnquiryDialog, { type EnquiryProduct } from "./enquiry-dialog";

export default function EnquiryButton({
  product,
  className,
  label = "Enquire",
}: {
  product: EnquiryProduct;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-6 py-4 text-sm text-bone transition-transform hover:-translate-y-0.5"
        }
      >
        <MessageCircle className="h-4 w-4" />
        {label}
      </button>
      <EnquiryDialog
        open={open}
        onClose={() => setOpen(false)}
        product={product}
      />
    </>
  );
}
