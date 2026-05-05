// ---------------------------------------------------------------------------
// MyFatoorah HTTP Client
// ---------------------------------------------------------------------------

import { getServerEnv } from '@/lib/env.server';
import { MyFatoorahError } from './myfatoorah.errors';
import type {
  SendPaymentRequest,
  SendPaymentResponse,
  GetPaymentStatusRequest,
  GetPaymentStatusResponse,
} from './myfatoorah.types';

function getConfig() {
  const env = getServerEnv();
  return {
    baseUrl: env.MYFATOORAH_BASE_URL,
    apiToken: env.MYFATOORAH_API_TOKEN,
  };
}

async function apiRequest<T>(endpoint: string, body: unknown): Promise<T> {
  const { baseUrl, apiToken } = getConfig();
  const url = `${baseUrl}/v2/${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error');
    throw new MyFatoorahError(
      `MyFatoorah API error: ${response.status} ${text}`,
      response.status,
    );
  }

  const data = (await response.json()) as T;
  return data;
}

/**
 * Create a payment and get the hosted payment page URL.
 */
export async function sendPayment(
  request: SendPaymentRequest,
): Promise<SendPaymentResponse> {
  const response = await apiRequest<SendPaymentResponse>('SendPayment', request);

  if (!response.IsSuccess || !response.Data) {
    throw new MyFatoorahError(
      response.Message || 'SendPayment failed',
      400,
      response.ValidationErrors || [],
    );
  }

  return response;
}

/**
 * Get the status of a payment by InvoiceId or PaymentId.
 */
export async function getPaymentStatus(
  request: GetPaymentStatusRequest,
): Promise<GetPaymentStatusResponse> {
  const response = await apiRequest<GetPaymentStatusResponse>(
    'GetPaymentStatus',
    request,
  );

  if (!response.IsSuccess || !response.Data) {
    throw new MyFatoorahError(
      response.Message || 'GetPaymentStatus failed',
      400,
      response.ValidationErrors || [],
    );
  }

  return response;
}
