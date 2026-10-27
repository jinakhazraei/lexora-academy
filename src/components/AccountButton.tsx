"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type State = "loading" | "signed-out" | "signed-in";

/** Header button: "Student Login" when signed out, "My Dashboard" when signed in. */
export function AccountButton({ onNavigate, variant = "header" }: { onNavigate?: () => void; variant?: "header" | "menu" }) {
  const [state, setState] = useState<State>(isSupabaseConfigured ? "loading" : "signed-out");
  // Logging in and out happen on the server, so re-check the session cookie after each navigation.
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setState(data.session ? "signed-in" : "signed-out"));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(session ? "signed-in" : "signed-out");
    });
    return () => sub.subscription.unsubscribe();
  }, [pathname]);

  const signedIn = state === "signed-in";
  const href = signedIn ? "/dashboard" : "/login";
  const label = signedIn ? "My Dashboard" : "Student Login";

  if (variant === "menu") {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className="mt-3 rounded-lg bg-gold px-4 py-2.5 text-center font-sans text-sm font-bold text-navy hover:text-navy"
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 font-sans text-[13px] font-bold transition-colors ${
        signedIn
          ? "bg-navy text-white hover:bg-navy-panel hover:text-white"
          : "bg-gold text-navy hover:text-navy hover:brightness-95"
      } ${state === "loading" ? "opacity-0" : "opacity-100"}`}
    >
      {label}
    </Link>
  );
}
