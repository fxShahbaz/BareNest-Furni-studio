"use client";

import { Printer } from "lucide-react";

export default function InvoicePrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-bone hover:bg-bark"
    >
      <Printer className="h-4 w-4" />
      Print / Save PDF
    </button>
  );
}
