import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const hasSupabase = !!(supabaseUrl && supabaseKey);

// Lazy — only create when credentials exist
let _client: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabase = () => {
  if (!hasSupabase) return null;
  if (!_client) _client = createBrowserClient(supabaseUrl, supabaseKey);
  return _client;
};

// Named export for direct use (returns null if not configured)
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_, prop) {
    const client = getSupabase();
    if (!client) return () => Promise.resolve({ data: null, error: new Error("Supabase not configured") });
    return (client as any)[prop];
  },
});
