"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export type AdminSignInState = { error?: string } | undefined;

export async function adminSignIn(
  _prev: AdminSignInState,
  formData: FormData
): Promise<AdminSignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password required." };

  const supabase = await supabaseServer();
  if (!supabase) return { error: "Auth is not configured." };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    return { error: error?.message ?? "Sign in failed." };
  }

  // Strict gate: must be in owners table or session is killed immediately.
  const { data: ownerRow } = await supabase
    .from("owners")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!ownerRow) {
    await supabase.auth.signOut();
    return {
      error:
        "This account isn't an admin. Customers should sign in at /sign-in.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}
