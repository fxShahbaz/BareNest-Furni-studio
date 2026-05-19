"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Trash2, Upload } from "lucide-react";
import {
  createProduct,
  updateProduct,
  uploadProductImage,
  type ProductFormState,
} from "../actions";
import type { Product } from "@/lib/products";
import type { Category } from "@/lib/queries/categories";

export default function ProductForm({
  initial,
  mode,
  categories,
}: {
  initial?: Product;
  mode: "create" | "edit";
  categories: Category[];
}) {
  const action = mode === "create" ? createProduct : updateProduct;
  const [state, formAction] = useActionState<ProductFormState, FormData>(
    action,
    undefined
  );

  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function onPickImage(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await uploadProductImage(fd);
      setImages((cur) => [...cur, res.url]);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="grid gap-6 md:grid-cols-12">
      <div className="md:col-span-7 space-y-5">
        <Field
          name="slug"
          label="Slug"
          defaultValue={initial?.slug}
          required
          readOnly={mode === "edit"}
        />
        <Field name="name" label="Name" defaultValue={initial?.name} required />
        <Field
          name="tagline"
          label="Tagline"
          defaultValue={initial?.tagline}
        />
        <Field
          name="description"
          label="Description"
          defaultValue={initial?.description}
          textarea
        />
        <div className="grid grid-cols-2 gap-5">
          <Select
            name="category"
            label="Category"
            options={categories.map((c) => ({
              value: c.slug,
              label: c.label,
            }))}
            defaultValue={initial?.category}
            required
          />
          <Select
            name="material"
            label="Material"
            options={["Solid Wood", "MDF"]}
            defaultValue={initial?.material}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <Field
            name="price"
            label="Price (INR)"
            type="number"
            defaultValue={initial?.price?.toString()}
            required
          />
          <Field
            name="dimensions"
            label="Dimensions"
            defaultValue={initial?.dimensions}
          />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <Field
            name="gst_rate"
            label="GST %"
            type="number"
            step="0.5"
            min="0"
            max="50"
            defaultValue={(initial?.gst_rate ?? 18).toString()}
            required
          />
          <Select
            name="tax_inclusive"
            label="Tax"
            options={[
              { value: "true", label: "Inclusive — price includes GST" },
              { value: "false", label: "Exclusive — GST added on top" },
            ]}
            defaultValue={
              initial?.tax_inclusive === false ? "false" : "true"
            }
            required
          />
        </div>
        <Field
          name="hsn_code"
          label="HSN code (for GST invoice)"
          defaultValue={initial?.hsn_code}
        />
        <Field
          name="features"
          label="Features (one per line)"
          defaultValue={initial?.features?.join("\n")}
          textarea
        />
      </div>

      <aside className="md:col-span-5 space-y-4">
        <div>
          <p className="eyebrow text-muted">Images</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {images.map((url, i) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-xl bg-cream"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImages((cur) => cur.filter((_, j) => j !== i))
                  }
                  aria-label="Remove image"
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-bone/90 text-ink"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border border-dashed border-ink/20 text-muted hover:bg-cream">
              {uploading ? "…" : <Upload className="h-5 w-5" />}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPickImage(f);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>
          {uploadError && (
            <p
              className="mt-2 rounded-xl border border-rust/30 bg-rust/10 px-3 py-2 text-xs text-rust"
              role="alert"
            >
              {uploadError}
            </p>
          )}
          {/* Submit image URLs as newline-separated text for the action */}
          <textarea name="images" value={images.join("\n")} readOnly hidden />
        </div>

        {state?.error && <p className="text-sm text-rust">{state.error}</p>}
        <SubmitButton label={mode === "create" ? "Create" : "Save changes"} />
      </aside>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required,
  textarea,
  readOnly,
  step,
  min,
  max,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  textarea?: boolean;
  readOnly?: boolean;
  step?: string;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          required={required}
          rows={4}
          className="mt-2 w-full rounded-2xl border border-ink/15 bg-bone px-4 py-3 text-sm focus:border-ink focus:outline-none"
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          readOnly={readOnly}
          step={step}
          min={min}
          max={max}
          className="mt-2 w-full rounded-full border border-ink/15 bg-bone px-5 py-3 text-sm focus:border-ink focus:outline-none read-only:opacity-60"
        />
      )}
    </label>
  );
}

type SelectOption = string | { value: string; label: string };

function Select({
  name,
  label,
  options,
  defaultValue,
  required,
}: {
  name: string;
  label: string;
  options: SelectOption[];
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="mt-2 w-full rounded-full border border-ink/15 bg-bone px-5 py-3 text-sm focus:border-ink focus:outline-none"
      >
        <option value="" disabled>
          Pick one
        </option>
        {options.map((o) => {
          const value = typeof o === "string" ? o : o.value;
          const text = typeof o === "string" ? o : o.label;
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
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
