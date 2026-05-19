"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AuthChip() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const supabase = supabaseBrowser();
    if (!supabase) {
      setEmail(null);
      return;
    }

    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (email === undefined) {
    // First paint while resolving — render a placeholder of the same size
    // to avoid layout shift in the navbar.
    return <span className="h-10 w-10" aria-hidden />;
  }

  if (!email) {
    return (
      <Link
        href="/sign-in"
        aria-label="Sign in"
        className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 hover:bg-ink/5"
      >
        <User className="h-4 w-4" />
      </Link>
    );
  }

  // Signed in — show an account button. Sign-out lives on /account
  // (under the profile card) so the navbar stays clean.
  return (
    <Link
      href="/account"
      aria-label="Your account"
      title={`Signed in as ${email}`}
      className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-cream/50 hover:bg-ink/5"
    >
      <User className="h-4 w-4" />
    </Link>
  );
}
