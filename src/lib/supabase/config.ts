// Public Supabase settings. Safe to use in the browser.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** False until the Supabase keys are added — the marketing site keeps working either way. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const isGoogleLoginEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN === "true";
