import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import OnboardingForm from "./onboarding-form";

export const metadata: Metadata = {
  title: "Finish your profile",
  description:
    "One more step — give us your phone number so we can link your order history to your account.",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const dest = next || "/account";

  const supabase = await supabaseServer();
  if (!supabase) redirect("/sign-in");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(dest)}`);

  // If they already have a profile, skip onboarding entirely.
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id,phone")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile?.phone) redirect(dest);

  const meta = (user.user_metadata ?? {}) as {
    full_name?: string;
    name?: string;
  };
  const guessName =
    meta.full_name ||
    meta.name ||
    user.email?.split("@")[0] ||
    "";

  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-md px-6">
        <p className="eyebrow text-muted">Almost there</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">
          One more <span className="serif-italic">detail.</span>
        </h1>
        <p className="mt-4 text-sm text-muted">
          We use your phone number to confirm orders on WhatsApp and to
          link any prior purchases to your account. Indian mobile only.
        </p>

        <OnboardingForm
          email={user.email ?? ""}
          guessName={guessName}
          next={dest}
        />
      </div>
    </div>
  );
}
