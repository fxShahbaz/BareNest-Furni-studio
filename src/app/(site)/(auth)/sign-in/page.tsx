import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import SignInForm from "./sign-in-form";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your BareNest account to track orders and saved items.",
  alternates: { canonical: "/sign-in" },
  robots: { index: false, follow: true },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; pending?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/";

  const supabase = await supabaseServer();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect(next);
  }

  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-md px-6">
        <p className="eyebrow text-muted">Account</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">
          Sign <span className="serif-italic">in.</span>
        </h1>
        {sp.pending && (
          <p className="mt-6 rounded-2xl border border-ink/10 bg-cream/50 px-4 py-3 text-sm">
            Check your inbox for a confirmation link, then sign in below.
          </p>
        )}
        {sp.error && (
          <p className="mt-6 rounded-2xl border border-rust/30 bg-rust/10 px-4 py-3 text-sm text-rust">
            {sp.error}
          </p>
        )}
        <SignInForm next={next} />
        <p className="mt-8 text-sm text-muted">
          New here?{" "}
          <Link
            href={`/sign-up?next=${encodeURIComponent(next)}`}
            className="text-ink underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
