import { z } from 'zod';

// ---------------------------------------------------------------------------
// Server-side environment (NEVER exposed to browser)
// ---------------------------------------------------------------------------
const serverEnvSchema = z.object({
  // Supabase
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_DATABASE_URL: z.string().min(1).optional(),

  // MyFatoorah
  MYFATOORAH_API_TOKEN: z.string().min(1),
  MYFATOORAH_BASE_URL: z.string().url().default('https://apitest.myfatoorah.com'),
  MYFATOORAH_WEBHOOK_SECRET: z.string().optional().default(''),
  MYFATOORAH_COUNTRY_ISO: z.string().default('KWT'),
  MYFATOORAH_CURRENCY: z.string().default('KWD'),

  // Encryption
  APP_ENCRYPTION_KEY: z.string().length(64, 'APP_ENCRYPTION_KEY must be 64 hex characters (32 bytes)'),

  // Admin
  ADMIN_PANEL_SLUG: z.string().min(1).default('admin'),

  // WhatsApp
  WHATSAPP_PROVIDER: z.enum(['cloud_api', 'none']).default('none'),
  WHATSAPP_CLOUD_API_TOKEN: z.string().optional().default(''),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional().default(''),
  WHATSAPP_TEMPLATE_NAME: z.string().optional().default('order_delivery'),
  WHATSAPP_TEMPLATE_LANGUAGE: z.string().optional().default('ar'),

  // Rate limiting
  RATE_LIMIT_PROVIDER: z.enum(['memory', 'upstash', 'none']).default('memory'),
  UPSTASH_REDIS_REST_URL: z.string().optional().default(''),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().default(''),

  // Bot protection
  TURNSTILE_SECRET_KEY: z.string().optional().default(''),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let _serverEnv: ServerEnv | null = null;

/**
 * Server-only environment variables.
 * Call this only from server-side code (route handlers, server actions, server components).
 * Will throw at runtime if called from the browser.
 */
export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() must not be called on the client');
  }

  if (!_serverEnv) {
    const parsed = serverEnvSchema.safeParse({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_DATABASE_URL: process.env.SUPABASE_DATABASE_URL,
      MYFATOORAH_API_TOKEN: process.env.MYFATOORAH_API_TOKEN,
      MYFATOORAH_BASE_URL: process.env.MYFATOORAH_BASE_URL,
      MYFATOORAH_WEBHOOK_SECRET: process.env.MYFATOORAH_WEBHOOK_SECRET,
      MYFATOORAH_COUNTRY_ISO: process.env.MYFATOORAH_COUNTRY_ISO,
      MYFATOORAH_CURRENCY: process.env.MYFATOORAH_CURRENCY,
      APP_ENCRYPTION_KEY: process.env.APP_ENCRYPTION_KEY,
      ADMIN_PANEL_SLUG: process.env.ADMIN_PANEL_SLUG,
      WHATSAPP_PROVIDER: process.env.WHATSAPP_PROVIDER,
      WHATSAPP_CLOUD_API_TOKEN: process.env.WHATSAPP_CLOUD_API_TOKEN,
      WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
      WHATSAPP_TEMPLATE_NAME: process.env.WHATSAPP_TEMPLATE_NAME,
      WHATSAPP_TEMPLATE_LANGUAGE: process.env.WHATSAPP_TEMPLATE_LANGUAGE,
      RATE_LIMIT_PROVIDER: process.env.RATE_LIMIT_PROVIDER,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    });

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      console.error('❌ Invalid server environment variables:', errors);

      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Missing required server environment variables: ${Object.keys(errors).join(', ')}`);
      }
    }

    _serverEnv = parsed.data!;
  }

  return _serverEnv;
}
