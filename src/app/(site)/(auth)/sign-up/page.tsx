import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import SignUpForm from "./sign-up-form";

export const metadata = {
  title: "Create account",
  description: "Create a bare nest account to track orders and customise saved pieces.",
  alternates: { canonical: "/sign-up" },
  robots: { index: false, follow: true },
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
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
          Create <span className="serif-italic">account.</span>
        </h1>
        <SignUpForm next={next} />
        <p className="mt-8 text-sm text-muted">
          Already have an account?{" "}
          <Link
            href={`/sign-in?next=${encodeURIComponent(next)}`}
            className="text-ink underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
