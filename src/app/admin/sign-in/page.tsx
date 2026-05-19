import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { isCurrentUserOwner } from "@/lib/queries/admin";
import AdminSignInForm from "./sign-in-form";

export const metadata = { title: "Admin sign in — bare nest" };

// Bypass the (auth) /sign-in page entirely — this is for owners only.
export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  let signedInAs: string | null = null;
  const supabase = await supabaseServer();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const owner = await isCurrentUserOwner();
      if (owner) redirect("/admin");
      // Non-owner signed in: keep their customer session, just show the form.
      signedInAs = data.user.email ?? null;
    }
  }

  const initialError =
    sp.error === "not_owner"
      ? "Your account isn't an admin. Sign in with an owner account, or use the customer sign-in."
      : null;

  return (
    <div className="min-h-screen bg-bark text-bone">
      <div className="mx-auto max-w-md px-6 pt-32 pb-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-bone/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-bone/70">
          <Lock className="h-3 w-3" />
          Studio backstage
        </div>
        <h1 className="mt-6 font-display text-4xl tracking-tight md:text-5xl">
          Admin <span className="serif-italic">sign in.</span>
        </h1>
        <p className="mt-3 text-sm text-bone/70">
          Only owners can sign in here. Customers should use{" "}
          <a
            href="/sign-in"
            className="underline-offset-4 hover:underline"
          >
            the customer sign-in
          </a>
          .
        </p>
        {initialError && (
          <p className="mt-6 rounded-2xl border border-rust/40 bg-rust/10 px-4 py-3 text-sm text-rust">
            {initialError}
          </p>
        )}
        {signedInAs && (
          <p className="mt-6 rounded-2xl border border-bone/20 bg-bone/5 px-4 py-3 text-sm text-bone/80">
            You're currently signed in as{" "}
            <span className="text-bone">{signedInAs}</span> — a customer
            account. Signing in below will switch the session to an admin
            account.
          </p>
        )}
        <AdminSignInForm />
      </div>
    </div>
  );
}
