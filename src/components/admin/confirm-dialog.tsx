"use client";

import { useEffect, useRef } from "react";

type Tone = "default" | "danger";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  tone?: Tone;
  onCancel: () => void;
  /** When provided, the confirm button submits a form bound to this server action. */
  action?: (formData: FormData) => void | Promise<void>;
  hiddenFields?: Record<string, string>;
  /** When `action` is omitted, called on confirm click. */
  onConfirm?: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  tone = "default",
  onCancel,
  action,
  hiddenFields,
  onConfirm,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  const confirmClass =
    tone === "danger"
      ? "bg-rust text-bone hover:bg-rust/90"
      : "bg-ink text-bone hover:bg-bark";

  const confirmButton = (
    <button
      type={action ? "submit" : "button"}
      onClick={action ? undefined : onConfirm}
      className={`w-full rounded-full px-5 py-2.5 text-sm font-medium transition-colors sm:w-auto ${confirmClass}`}
    >
      {confirmText}
    </button>
  );

  return (
    <dialog
      ref={ref}
      onClose={onCancel}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself, outside its content)
        if (e.target === ref.current) onCancel();
      }}
      className="fixed inset-0 m-auto w-[calc(100vw-1.5rem)] max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-3xl border border-ink/10 bg-bone p-6 text-ink shadow-2xl backdrop:bg-ink/50 backdrop:backdrop-blur-sm sm:p-7"
    >
      <h2 className="font-display text-2xl leading-tight">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-ink/75">{description}</p>
      <div className="mt-6 flex flex-col gap-2 sm:mt-7 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-full border border-ink/15 px-5 py-2.5 text-sm hover:bg-ink/5 sm:w-auto"
        >
          {cancelText}
        </button>
        {action ? (
          <form
            action={action}
            onSubmit={() => onCancel()}
            className="contents"
          >
            {hiddenFields &&
              Object.entries(hiddenFields).map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}
            {confirmButton}
          </form>
        ) : (
          confirmButton
        )}
      </div>
    </dialog>
  );
}
