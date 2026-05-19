"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { isValidIndianMobile, normalizePhone } from "@/lib/phone";
import { upsertProfileWithPhone } from "@/lib/queries/profile";

export type OnboardingState = { error?: string } | undefined;

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await supabaseServer();
  if (!supabase) return { error: "Auth not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // Session expired — bounce back to sign-in.
    redirect("/sign-in");
  }

  const name = String(formData.get("name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const next = String(formData.get("next") ?? "/account");

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

  revalidatePath("/", "layout");
  redirect(next);
}
