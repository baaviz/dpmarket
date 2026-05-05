// ---------------------------------------------------------------------------
// Payment Callback Route Handler
// ---------------------------------------------------------------------------
// MyFatoorah redirects the customer here after payment (success or failure).
// IMPORTANT: Never trust the query params alone — always verify server-side.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/server/services/myfatoorah';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { clientEnv } from '@/lib/env';

export async function GET(request: NextRequest) {
  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL;
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('paymentId');

  // Default to Arabic locale if not specified
  const locale = 'ar';

  if (!paymentId) {
    return NextResponse.redirect(
      new URL(`/${locale}/payment/failed?error=missing_payment_id`, siteUrl),
    );
  }

  try {
    // Server-side verification — the only source of truth
    const { isPaid, data } = await verifyPayment(paymentId);

    // Get orderId from CustomerReference (we set this during payment creation)
    const orderId = data.CustomerReference;

    if (!orderId) {
      console.error('Payment callback: missing orderId in CustomerReference', { paymentId });
      return NextResponse.redirect(
        new URL(`/${locale}/payment/failed?error=missing_order`, siteUrl),
      );
    }

    const supabase = createSupabaseAdminClient();

    if (isPaid) {
      // Update order status to paid
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .in('payment_status', ['none', 'initiated', 'pending']);

      if (updateError) {
        console.error('Payment callback: failed to update order', updateError);
      }

      // Update payment attempt
      await supabase
        .from('payment_attempts')
        .update({
          status: 'paid',
          provider_payment_id: paymentId,
          provider_response: data as unknown as Record<string, unknown>,
        })
        .eq('order_id', orderId)
        .eq('status', 'initiated');

      // Redirect to success page with order number for display
      return NextResponse.redirect(
        new URL(`/${locale}/payment/success?order=${data.UserDefinedField}`, siteUrl),
      );
    } else {
      // Payment failed or pending
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'payment_failed',
        })
        .eq('id', orderId)
        .eq('payment_status', 'initiated');

      await supabase
        .from('payment_attempts')
        .update({
          status: 'failed',
          provider_payment_id: paymentId,
          provider_response: data as unknown as Record<string, unknown>,
          failure_reason: data.InvoiceStatus,
        })
        .eq('order_id', orderId)
        .eq('status', 'initiated');

      return NextResponse.redirect(
        new URL(`/${locale}/payment/failed?status=${data.InvoiceStatus}`, siteUrl),
      );
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(
      new URL(`/${locale}/payment/failed?error=verification_failed`, siteUrl),
    );
  }
}
