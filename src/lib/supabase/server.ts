import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { clientEnv } from '@/lib/env';

/**
 * Server-side Supabase client that uses cookies for auth session management.
 * Used in Server Components, Server Actions, and Route Handlers for SSR.
 * Uses the anon key — auth context comes from the cookie.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // In Server Components we cannot set cookies — this is expected.
            // The middleware or route handler will handle the refresh.
          }
        },
      },
    },
  );
}
