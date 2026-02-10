import { createBrowserClient } from "@supabase/ssr";

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            if (typeof document === "undefined") return [];
            const cookies: { name: string; value: string }[] = [];
            document.cookie.split("; ").forEach((cookie) => {
              const [name, value] = cookie.split("=");
              if (name)
                cookies.push({ name, value: decodeURIComponent(value) });
            });
            return cookies;
          },
          setAll(cookiesToSet) {
            if (typeof document === "undefined") return;
            cookiesToSet.forEach(({ name, value, options }) => {
              const cookieString = `${name}=${encodeURIComponent(
                value
              )}; path=${options?.path || "/"}; max-age=${
                options?.maxAge || 31536000
              }${options?.secure ? "; secure" : ""}${
                options?.sameSite ? `; samesite=${options.sameSite}` : ""
              }`;
              document.cookie = cookieString;
            });
          },
        },
      }
    );
  }
  return supabaseClient;
}
