"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { isValidIndianMobile, normalizePhone } from "@/lib/phone";
import { upsertProfileWithPhone } from "@/lib/queries/profile";

export type AuthState = { error?: string } | undefined;

// Default post-auth destination. Sign-in / sign-up / Google callback all
// land users on their profile unless an explicit `next` was set (e.g.
// they were sent to sign-in from /checkout).
const DEFAULT_NEXT = "/account";

export async function signInWithPassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? DEFAULT_NEXT);

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await supabaseServer();
  if (!supabase) return { error: "Auth is not configured." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUpWithPassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const next = String(formData.get("next") ?? DEFAULT_NEXT);

  if (!email) return { error: "Email is required." };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!isValidIndianMobile(phoneRaw)) {
    return { error: "Enter a valid 10-digit Indian mobile number." };
  }
  const phone = normalizePhone(phoneRaw);
  if (!name || name.length < 2) {
    return { error: "Please enter your full name." };
  }

  const supabase = await supabaseServer();
  if (!supabase) return { error: "Auth is not configured." };

  const origin = (await headers()).get("origin") ?? "";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      // Store the intended phone + display_name on the auth user so we
      // can recover them server-side after email confirmation if a session
      // hasn't materialised yet.
      data: { phone, display_name: name },
    },
  });
  if (error) return { error: error.message };

  // Two paths depending on Supabase project settings:
  //   1. Email confirmation OFF: session is live now — write the profile.
  //   2. Email confirmation ON: data.session is null; the profile gets
  //      written when the user follows the verification link, which lands
  //      on /auth/callback → that route writes the profile from the
  //      auth-user metadata we stored above.
  if (data.session && data.user) {
    const result = await upsertProfileWithPhone({
      userId: data.user.id,
      email: data.user.email ?? null,
      phone,
      displayName: name,
    });
    if (result.error) return { error: result.error };
    revalidatePath("/", "layout");
    redirect(next);
  }

  redirect(`/sign-in?pending=1&next=${encodeURIComponent(next)}`);
}

export async function signInWithGoogle(formData: FormData) {
  const next = String(formData.get("next") ?? DEFAULT_NEXT);

  const supabase = await supabaseServer();
  if (!supabase) redirect(`/sign-in?error=not_configured`);

  const origin = (await headers()).get("origin") ?? "";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error || !data.url) redirect(`/sign-in?error=oauth_failed`);

  redirect(data.url);
}

export async function signOut() {
  const supabase = await supabaseServer();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
