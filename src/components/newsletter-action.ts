"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export type SubscribeState = { ok?: boolean; error?: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "That doesn't look like an email." };

  const admin = supabaseAdmin();
  const { error } = await admin
    .from("subscribers")
    .upsert({ email }, { onConflict: "email" });

  if (error) return { error: error.message };
  return { ok: true };
}
