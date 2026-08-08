import { createClient } from "@supabase/supabase-js";

// Safe environment variable retrieval with sensible defaults
const getEnv = (key: string): string => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return (import.meta.env[key] as string) || "";
  }
  return "";
};

const supabaseUrl = getEnv("VITE_SUPABASE_URL") || getEnv("SUPABASE_URL") || "https://logifinder.supabase.co";
const supabaseAnonKey = getEnv("VITE_SUPABASE_ANON_KEY") || getEnv("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.mock";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
