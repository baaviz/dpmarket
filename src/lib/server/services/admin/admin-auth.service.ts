// ---------------------------------------------------------------------------
// Admin Auth Service — server-side admin authentication & authorization
// ---------------------------------------------------------------------------

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { AdminRole } from '@/lib/constants';

export interface AdminSession {
  userId: string;
  email: string;
  role: AdminRole;
  fullName: string;
}

/**
 * Get the current admin session from cookies.
 * Returns null if not authenticated or not an active admin.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Check admin_profiles table using service role to bypass RLS
    const adminClient = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('admin_profiles')
      .select('role, full_name, is_active')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.is_active) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email || '',
      role: profile.role as AdminRole,
      fullName: profile.full_name,
    };
  } catch (error) {
    console.error('getAdminSession error:', error);
    return null;
  }
}

/**
 * Require admin session. Throws if not authenticated.
 */
export async function requireAdminSession(
  requiredRoles?: AdminRole[],
): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    throw new Error('Unauthorized: admin session required');
  }

  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(session.role)) {
      throw new Error(`Forbidden: requires one of [${requiredRoles.join(', ')}] roles`);
    }
  }

  return session;
}
