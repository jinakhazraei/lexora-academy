import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/config";

/** Supabase client for Client Components. Returns null until Supabase is configured. */
export function createClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
