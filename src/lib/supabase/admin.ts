import { createClient } from '@supabase/supabase-js';
import { clientEnv } from '@/lib/env';
import { getServerEnv } from '@/lib/env.server';

/**
 * Service-role Supabase client. BYPASSES RLS.
 * Only use in server-only modules: route handlers, server actions, services.
 * NEVER import this file from client code.
 *
 * Note: 'server-only' import is applied at the service layer that uses this client,
 * not here, to avoid Turbopack SSR bundling issues in Next.js 16.
 */
export function createSupabaseAdminClient() {
  const serverEnv = getServerEnv();
  return createClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
