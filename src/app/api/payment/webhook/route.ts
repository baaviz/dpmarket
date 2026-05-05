// ---------------------------------------------------------------------------
// MyFatoorah Webhook Route Handler
// ---------------------------------------------------------------------------
// Receives payment status updates from MyFatoorah.
// Verifies signature, logs the event, and processes payment updates.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, verifyPaymentByInvoice } from '@/lib/server/services/myfatoorah';
import type { MyFatoorahWebhookPayload } from '@/lib/server/services/myfatoorah';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const supabase = createSupabaseAdminClient();

  try {
    const rawBody = await request.text();
    const signature = request.headers.get('myfatoorah-signature');

    // Step 1: Verify signature
    verifyWebhookSignature(rawBody, signature);

    // Step 2: Parse and log the webhook event
    const payload: MyFatoorahWebhookPayload = JSON.parse(rawBody);

    const { error: logError } = await supabase
      .from('payment_webhook_events')
      .insert({
        provider: 'myfatoorah',
        event_reference: `${payload.Data?.InvoiceId}-${payload.Event}`,
        event_name: payload.Event,
        signature_valid: true,
        payload: payload as unknown as Record<string, unknown>,
      });

    if (logError) {
      console.error('Webhook: failed to log event', logError);
    }

    // Step 3: Process the payment update
    const invoiceId = payload.Data?.InvoiceId?.toString();
    const orderId = payload.Data?.CustomerReference;

    if (!invoiceId || !orderId) {
      console.warn('Webhook: missing invoiceId or orderId', payload);
      return NextResponse.json({ status: 'ignored', reason: 'missing_data' });
    }

    // Step 4: Server-side verification — double-check with MyFatoorah API
    const { isPaid, data } = await verifyPaymentByInvoice(invoiceId);

    if (isPaid) {
      // Idempotent update: only update if not already paid
      const { data: order } = await supabase
        .from('orders')
        .select('id, payment_status')
        .eq('id', orderId)
        .single();

      if (order && order.payment_status !== 'paid') {
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'paid',
            paid_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        // Update the payment attempt
        await supabase
          .from('payment_attempts')
          .update({
            status: 'paid',
            provider_invoice_id: invoiceId,
            provider_response: data as unknown as Record<string, unknown>,
          })
          .eq('order_id', orderId)
          .neq('status', 'paid');
      }
    }

    // Mark webhook as processed
    await supabase
      .from('payment_webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('event_reference', `${invoiceId}-${payload.Event}`);

    return NextResponse.json({ status: 'processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);

    // Log the failed event
    try {
      const rawBody = await request.clone().text();
      await supabase.from('payment_webhook_events').insert({
        provider: 'myfatoorah',
        event_name: 'unknown',
        signature_valid: false,
        payload: { raw: rawBody.substring(0, 1000) },
        processing_error: error instanceof Error ? error.message : 'Unknown error',
      });
    } catch {
      // Silent - already in error handler
    }

    return NextResponse.json(
      { status: 'error', message: 'Webhook processing failed' },
      { status: 500 },
    );
  }
}
