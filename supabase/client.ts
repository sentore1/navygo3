import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  // Check if environment variables are available
  if (
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "undefined" ||
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "undefined"
  ) {
    console.warn("Supabase environment variables are missing in client");
    // Return a mock client for client-side rendering when env vars are missing
    return {
      auth: {
        getUser: async () => ({
          data: { user: null },
          error: new Error("Supabase client not initialized"),
        }),
        getSession: async () => ({
          data: { session: null },
          error: new Error("Supabase client not initialized"),
        }),
        signOut: async () => ({ error: null }),
        signInWithPassword: async () => ({
          data: { user: null, session: null },
          error: new Error("Supabase client not initialized"),
        }),
        signUp: async () => ({
          data: { user: null, session: null },
          error: new Error("Supabase client not initialized"),
        }),
        resetPasswordForEmail: async () => ({
          data: {},
          error: new Error("Supabase client not initialized"),
        }),
        updateUser: async () => ({
          data: { user: null },
          error: new Error("Supabase client not initialized"),
        }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: null,
              error: new Error("Supabase client not initialized"),
            }),
            maybeSingle: async () => ({
              data: null,
              error: new Error("Supabase client not initialized"),
            }),
          }),
          order: () => ({
            data: [],
            error: new Error("Supabase client not initialized"),
          }),
        }),
        insert: () => ({
          data: null,
          error: new Error("Supabase client not initialized"),
        }),
        update: () => ({
          data: null,
          error: new Error("Supabase client not initialized"),
        }),
        delete: () => ({
          data: null,
          error: new Error("Supabase client not initialized"),
        }),
      }),
      functions: {
        invoke: async () => ({
          data: null,
          error: new Error("Supabase client not initialized"),
        }),
      },
    } as any;
  }

  // If environment variables are available, create the real client
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
};
