import { createServerClient } from "@supabase/ssr";
import type { cookies } from "next/headers";

type CookieStore = ReturnType<typeof cookies>;

export const createClient = async (cookieStore?: CookieStore) => {
  // Handle static site generation case where cookies() might not be available
  if (
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "undefined" ||
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "undefined"
  ) {
    console.warn("Supabase environment variables are missing");
    // Return a mock client for static site generation
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signOut: async () => ({ error: null }),
        exchangeCodeForSession: async (code: string) => ({
          data: { session: null },
          error: null,
        }),
      },
    } as any;
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          try {
            if (!cookieStore) return [];
            return cookieStore.getAll();
          } catch (error) {
            console.error("Error accessing cookies:", error);
            return [];
          }
        },
        setAll(cookiesToSet) {
          try {
            if (!cookieStore) return;
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            console.error("Error setting cookies:", error);
          }
        },
      },
    },
  );
};
