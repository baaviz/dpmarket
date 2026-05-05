// ---------------------------------------------------------------------------
// Guest Session Service
// ---------------------------------------------------------------------------

import { cookies } from 'next/headers';
import { GUEST_COOKIE_NAME, GUEST_COOKIE_MAX_AGE } from '@/lib/constants';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { generateSecureToken, hashToken, hashIp, hashUserAgent } from '@/lib/server/encryption';

/**
 * Get or create a guest session from cookies.
 * Returns the guest session ID and token.
 */
export async function getOrCreateGuestSession(options?: {
  ip?: string;
  userAgent?: string;
}): Promise<{ sessionId: string; token: string; isNew: boolean }> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(GUEST_COOKIE_NAME)?.value;

  if (existingToken) {
    const tokenHash = hashToken(existingToken);
    const supabase = createSupabaseAdminClient();
    const { data: session } = await supabase
      .from('guest_sessions')
      .select('id')
      .eq('guest_token_hash', tokenHash)
      .single();

    if (session) {
      // Update last seen
      await supabase
        .from('guest_sessions')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', session.id);

      return { sessionId: session.id, token: existingToken, isNew: false };
    }
  }

  // Create new session
  const token = generateSecureToken(32);
  const tokenHash = hashToken(token);
  const supabase = createSupabaseAdminClient();

  const { data: newSession, error } = await supabase
    .from('guest_sessions')
    .insert({
      guest_token_hash: tokenHash,
      first_seen_ip_hash: options?.ip ? hashIp(options.ip) : null,
      user_agent_hash: options?.userAgent ? hashUserAgent(options.userAgent) : null,
    })
    .select('id')
    .single();

  if (error || !newSession) {
    throw new Error('Failed to create guest session');
  }

  // Set cookie
  cookieStore.set(GUEST_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: GUEST_COOKIE_MAX_AGE,
    path: '/',
  });

  return { sessionId: newSession.id, token, isNew: true };
}

/**
 * Get orders for the current guest session.
 */
export async function getGuestOrders(token: string) {
  const tokenHash = hashToken(token);
  const supabase = createSupabaseAdminClient();

  // Find session
  const { data: session } = await supabase
    .from('guest_sessions')
    .select('id')
    .eq('guest_token_hash', tokenHash)
    .single();

  if (!session) {
    return [];
  }

  // Get orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      public_order_number,
      status,
      payment_status,
      total_amount,
      currency,
      created_at,
      order_items (
        id,
        product_name_snapshot,
        quantity,
        total_price,
        fulfillment_status
      )
    `)
    .eq('guest_session_id', session.id)
    .order('created_at', { ascending: false });

  return orders || [];
}
