"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { signOut } from "@/app/auth/actions";

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
    // First paint while resolving — render nothing to avoid flash.
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

  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-full border border-ink/10 px-3 py-2 text-xs text-ink/80 hover:bg-ink/5"
        title={`Signed in as ${email} — click to sign out`}
      >
        Sign out
      </button>
    </form>
  );
}
