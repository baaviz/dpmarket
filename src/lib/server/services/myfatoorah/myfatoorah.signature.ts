// ---------------------------------------------------------------------------
// MyFatoorah Webhook Signature Verification
// ---------------------------------------------------------------------------

import { createHmac } from 'crypto';
import { getServerEnv } from '@/lib/env.server';
import { MyFatoorahSignatureError } from './myfatoorah.errors';

/**
 * Verify the MyFatoorah webhook signature.
 * The signature is sent in the `myfatoorah-signature` header.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  const env = getServerEnv();
  const secret = env.MYFATOORAH_WEBHOOK_SECRET;

  // If no webhook secret configured, log and skip verification
  if (!secret) {
    console.warn('⚠️ MYFATOORAH_WEBHOOK_SECRET not configured — skipping signature verification');
    return true;
  }

  if (!signatureHeader) {
    throw new MyFatoorahSignatureError();
  }

  const expectedSignature = createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  // Constant-time comparison
  const sigBuffer = Buffer.from(signatureHeader, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (sigBuffer.length !== expectedBuffer.length) {
    throw new MyFatoorahSignatureError();
  }

  const isValid = sigBuffer.every((byte, i) => byte === expectedBuffer[i]);

  if (!isValid) {
    throw new MyFatoorahSignatureError();
  }

  return true;
}
