import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { getServerEnv } from '@/lib/env.server';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const env = getServerEnv();
  return Buffer.from(env.APP_ENCRYPTION_KEY, 'hex');
}

/**
 * Encrypt a plain text string using AES-256-GCM.
 * Returns base64-encoded string containing IV + ciphertext + auth tag.
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Format: iv (12) + authTag (16) + ciphertext
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString('base64');
}

/**
 * Decrypt a base64-encoded encrypted string.
 */
export function decrypt(encryptedBase64: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedBase64, 'base64');

  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Create a deterministic hash of a code for duplicate detection.
 * Uses SHA-256 with a domain separator.
 */
export function hashCode(code: string): string {
  return createHash('sha256')
    .update('dohaplus:code:')
    .update(code)
    .digest('hex');
}

/**
 * Hash an IP address for privacy-safe storage.
 */
export function hashIp(ip: string): string {
  return createHash('sha256')
    .update('dohaplus:ip:')
    .update(ip)
    .digest('hex');
}

/**
 * Hash a user agent string.
 */
export function hashUserAgent(ua: string): string {
  return createHash('sha256')
    .update('dohaplus:ua:')
    .update(ua)
    .digest('hex');
}

/**
 * Generate a cryptographically secure random token.
 */
export function generateSecureToken(bytes: number = 32): string {
  return randomBytes(bytes).toString('hex');
}

/**
 * Hash a token for safe database storage.
 */
export function hashToken(token: string): string {
  return createHash('sha256')
    .update('dohaplus:token:')
    .update(token)
    .digest('hex');
}
