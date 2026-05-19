import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type Profile = {
  user_id: string;
  phone: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Read the signed-in user's profile. Returns null if no session OR no
 * profile row yet (typical state for a freshly-Google-signed-in user
 * who hasn't completed /onboarding).
 *
 * Uses the user-scoped client so RLS enforces "user reads own profile".
 */
export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await supabaseServer();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id,phone,display_name,created_at,updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as Profile;
}

/**
 * Persist a phone (and optional display_name) for the signed-in user.
 * Idempotent: existing profiles are updated, new ones are inserted.
 * Also keeps the public.customers row in sync so a signed-in user
 * sees their pre-existing order history immediately.
 *
 * Uses service-role for the customers upsert because customers is
 * gated for owner-write only — we trust the caller has already
 * verified auth.uid() matches the user_id parameter.
 */
export async function upsertProfileWithPhone(args: {
  userId: string;
  email: string | null;
  phone: string;
  displayName?: string | null;
}): Promise<{ error?: string }> {
  const admin = supabaseAdmin();
  const now = new Date().toISOString();

  // Check if another user has claimed this phone — phones must be
  // unique across profiles.
  const { data: conflict } = await admin
    .from("profiles")
    .select("user_id")
    .eq("phone", args.phone)
    .neq("user_id", args.userId)
    .maybeSingle();

  if (conflict) {
    return {
      error:
        "That phone number is already linked to another account. Sign in with the original account or use a different number.",
    };
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      user_id: args.userId,
      phone: args.phone,
      display_name: args.displayName ?? null,
      updated_at: now,
    },
    { onConflict: "user_id" }
  );
  if (profileError) return { error: profileError.message };

  // Mirror into customers so the studio's own dedup-by-phone table
  // links this auth user to any prior anonymous orders.
  const { error: customerError } = await admin.from("customers").upsert(
    {
      phone: args.phone,
      name: args.displayName ?? "—",
      email: args.email,
      user_id: args.userId,
      last_seen_at: now,
    },
    { onConflict: "phone" }
  );
  if (customerError) {
    console.error(
      "[profile] customers upsert failed:",
      customerError.message
    );
  }

  return {};
}
