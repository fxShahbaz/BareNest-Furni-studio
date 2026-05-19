import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type SiteSettings = {
  online_ordering_enabled: boolean;
};

const DEFAULTS: SiteSettings = {
  online_ordering_enabled: true,
};

// Storefront reads via supabaseServer so it honors the public SELECT policy
// even for anonymous visitors. If anything fails we fall back to "on" so a
// transient DB hiccup never silently disables ordering.
export async function getSettings(): Promise<SiteSettings> {
  const supabase = await supabaseServer();
  if (!supabase) return DEFAULTS;

  const { data, error } = await supabase
    .from("settings")
    .select("online_ordering_enabled")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return DEFAULTS;
  return { online_ordering_enabled: data.online_ordering_enabled };
}

// Admin-side read uses service role so it works even outside a request scope.
export async function getSettingsAdmin(): Promise<SiteSettings> {
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("settings")
    .select("online_ordering_enabled")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return DEFAULTS;
  return { online_ordering_enabled: data.online_ordering_enabled };
}
