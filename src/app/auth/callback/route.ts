import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { upsertProfileWithPhone } from "@/lib/queries/profile";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await supabaseServer();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return NextResponse.redirect(
          new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, url)
        );
      }
    }
  }

  // After the session is set, decide where to land:
  //   1. Returning user with an existing profile → straight to `next`.
  //   2. Email-signup user whose stored metadata includes phone → write
  //      a complete profile + customers row, then proceed to `next`.
  //   3. Google sign-up (no phone known) → create a profile shell with
  //      just the display name so the user lands on /account directly.
  //      They add their phone from the profile form when ready.
  const supabase = await supabaseServer();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existing) {
        const meta = (user.user_metadata ?? {}) as {
          phone?: string;
          display_name?: string;
          full_name?: string;
          name?: string;
        };
        const displayName =
          meta.display_name ??
          meta.full_name ??
          meta.name ??
          user.email?.split("@")[0] ??
          null;

        if (meta.phone) {
          await upsertProfileWithPhone({
            userId: user.id,
            email: user.email ?? null,
            phone: meta.phone,
            displayName,
          });
        } else {
          // OAuth bootstrap — no phone yet, just seed the profile shell.
          const admin = supabaseAdmin();
          await admin.from("profiles").upsert(
            {
              user_id: user.id,
              phone: null,
              display_name: displayName,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        }
      }
    }
  }

  return NextResponse.redirect(new URL(next, url));
}
