// ---------------------------------------------------------------------------
// WhatsApp Service — Factory + High-level Operations
// ---------------------------------------------------------------------------

import { getServerEnv } from '@/lib/env.server';
import type { WhatsAppProvider, WhatsAppResult } from './provider';
import { CloudAPIWhatsAppProvider } from './cloud-api';

let _provider: WhatsAppProvider | null = null;

function getProvider(): WhatsAppProvider {
  if (!_provider) {
    const env = getServerEnv();
    if (env.WHATSAPP_PROVIDER === 'cloud_api') {
      _provider = new CloudAPIWhatsAppProvider();
    } else {
      // No-op provider
      _provider = {
        isConfigured: () => false,
        send: async () => ({ success: false, error: 'WhatsApp provider not configured' }),
      };
    }
  }
  return _provider;
}

/**
 * Send order delivery notification via WhatsApp.
 */
export async function sendOrderDeliveryNotification(params: {
  customerMobile: string;
  orderNumber: string;
  productName: string;
}): Promise<WhatsAppResult> {
  const provider = getProvider();
  const env = getServerEnv();

  if (!provider.isConfigured()) {
    console.info('WhatsApp: provider not configured, skipping notification');
    return { success: false, error: 'provider_not_configured' };
  }

  return provider.send({
    to: params.customerMobile,
    templateName: env.WHATSAPP_TEMPLATE_NAME,
    templateLanguage: env.WHATSAPP_TEMPLATE_LANGUAGE,
    templateParams: {
      order_number: params.orderNumber,
      product_name: params.productName,
    },
  });
}

export { type WhatsAppProvider, type WhatsAppResult } from './provider';
