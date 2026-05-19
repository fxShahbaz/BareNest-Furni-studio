"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { isValidIndianMobile, normalizePhone } from "@/lib/phone";
import { upsertProfileWithPhone } from "@/lib/queries/profile";

export type AccountUpdateState = { error?: string; ok?: boolean } | undefined;

export async function updateProfile(
  _prev: AccountUpdateState,
  formData: FormData
): Promise<AccountUpdateState> {
  const supabase = await supabaseServer();
  if (!supabase) return { error: "Auth not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const name = String(formData.get("name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();

  if (!name || name.length < 2) {
    return { error: "Please enter your full name." };
  }
  if (!isValidIndianMobile(phoneRaw)) {
    return { error: "Enter a valid 10-digit Indian mobile number." };
  }
  const phone = normalizePhone(phoneRaw);

  const result = await upsertProfileWithPhone({
    userId: user.id,
    email: user.email ?? null,
    phone,
    displayName: name,
  });
  if (result.error) return { error: result.error };

  revalidatePath("/account");
  return { ok: true };
}
