import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getCurrentUser() {
  const supabase = await supabaseServer();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ---- THE admin gate -----------------------------------------------------
// Identity is sourced from the user's session cookie (verified by Supabase
// via auth.getUser, which validates the JWT against the auth server). The
// owners-table lookup uses the SERVICE-ROLE client so the gate is not
// dependent on the RLS policy of public.owners — a future migration that
// accidentally weakens that policy can't open the admin panel as long as
// the cookie verification still works.
//
// Anywhere admin actions write to the DB they MUST call requireOwner()
// (or isCurrentUserOwner()) first, because the admin client they use for
// writes also bypasses RLS.
// -------------------------------------------------------------------------
export async function isCurrentUserOwner(): Promise<boolean> {
  const userScoped = await supabaseServer();
  if (!userScoped) return false;
  const {
    data: { user },
  } = await userScoped.auth.getUser();
  if (!user) return false;

  const admin = supabaseAdmin();
  const { data: row, error } = await admin
    .from("owners")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    // Fail closed — a DB error during an auth check must never grant
    // access. Log so we notice if the table is gone or unreachable.
    console.error("[admin gate] owners lookup failed:", error.message);
    return false;
  }
  return !!row;
}
