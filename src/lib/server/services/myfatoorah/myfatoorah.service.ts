// ---------------------------------------------------------------------------
// MyFatoorah Payment Service — High-level business logic
// ---------------------------------------------------------------------------

import { getServerEnv } from '@/lib/env.server';
import { clientEnv } from '@/lib/env';
import { sendPayment, getPaymentStatus } from './myfatoorah.client';
import type {
  SendPaymentRequest,
  PaymentStatusData,
} from './myfatoorah.types';

interface CreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerMobile: string;
  mobileCountryCode: string;
  locale: 'ar' | 'en';
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
}

interface PaymentResult {
  invoiceId: number;
  paymentUrl: string;
  customerReference: string;
}

/**
 * Create a payment via MyFatoorah and return the hosted payment page URL.
 */
export async function createPayment(
  params: CreatePaymentParams,
): Promise<PaymentResult> {
  const env = getServerEnv();
  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL;

  const request: SendPaymentRequest = {
    NotificationOption: 'LNK',
    CustomerName: params.customerName,
    DisplayCurrencyIso: env.MYFATOORAH_CURRENCY,
    MobileCountryCode: params.mobileCountryCode.replace('+', ''),
    CustomerMobile: params.customerMobile,
    InvoiceValue: params.amount,
    CallBackUrl: `${siteUrl}/api/payment/callback`,
    ErrorUrl: `${siteUrl}/api/payment/callback`,
    Language: params.locale,
    CustomerReference: params.orderId,
    UserDefinedField: params.orderNumber,
    InvoiceItems: params.items.map((item) => ({
      ItemName: item.name,
      Quantity: item.quantity,
      UnitPrice: item.unitPrice,
    })),
  };

  const response = await sendPayment(request);

  return {
    invoiceId: response.Data!.InvoiceId,
    paymentUrl: response.Data!.InvoiceURL,
    customerReference: response.Data!.CustomerReference,
  };
}

/**
 * Verify a payment status server-side. Never trust callback query params alone.
 */
export async function verifyPayment(paymentId: string): Promise<{
  isPaid: boolean;
  data: PaymentStatusData;
}> {
  const response = await getPaymentStatus({
    Key: paymentId,
    KeyType: 'PaymentId',
  });

  const data = response.Data!;
  const isPaid = data.InvoiceStatus === 'Paid';

  return { isPaid, data };
}

/**
 * Verify payment by InvoiceId (used in webhook processing).
 */
export async function verifyPaymentByInvoice(invoiceId: string): Promise<{
  isPaid: boolean;
  data: PaymentStatusData;
}> {
  const response = await getPaymentStatus({
    Key: invoiceId,
    KeyType: 'InvoiceId',
  });

  const data = response.Data!;
  const isPaid = data.InvoiceStatus === 'Paid';

  return { isPaid, data };
}
