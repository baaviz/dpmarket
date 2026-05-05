// ---------------------------------------------------------------------------
// WhatsApp Provider Interface & Implementations
// ---------------------------------------------------------------------------

export interface WhatsAppMessage {
  to: string; // E.164 format
  templateName: string;
  templateLanguage: string;
  templateParams: Record<string, string>;
}

export interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WhatsAppProvider {
  send(message: WhatsAppMessage): Promise<WhatsAppResult>;
  isConfigured(): boolean;
}
