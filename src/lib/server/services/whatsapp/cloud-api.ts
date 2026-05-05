// ---------------------------------------------------------------------------
// WhatsApp Cloud API Implementation
// ---------------------------------------------------------------------------

import { getServerEnv } from '@/lib/env.server';
import type { WhatsAppMessage, WhatsAppResult, WhatsAppProvider } from './provider';

export class CloudAPIWhatsAppProvider implements WhatsAppProvider {
  isConfigured(): boolean {
    const env = getServerEnv();
    return (
      env.WHATSAPP_PROVIDER === 'cloud_api' &&
      !!env.WHATSAPP_CLOUD_API_TOKEN &&
      !!env.WHATSAPP_PHONE_NUMBER_ID
    );
  }

  async send(message: WhatsAppMessage): Promise<WhatsAppResult> {
    const env = getServerEnv();

    if (!this.isConfigured()) {
      return { success: false, error: 'WhatsApp Cloud API not configured' };
    }

    const url = `https://graph.facebook.com/v18.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.WHATSAPP_CLOUD_API_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: message.to,
          type: 'template',
          template: {
            name: message.templateName,
            language: { code: message.templateLanguage },
            components: [
              {
                type: 'body',
                parameters: Object.values(message.templateParams).map((value) => ({
                  type: 'text',
                  text: value,
                })),
              },
            ],
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('WhatsApp API error:', response.status, errorText);
        return { success: false, error: `API error: ${response.status}` };
      }

      const data = await response.json() as { messages?: Array<{ id: string }> };
      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
