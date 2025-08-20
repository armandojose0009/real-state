import { v4 as uuidv4 } from 'uuid';

export function generateIdempotencyKey(prefix?: string): string {
  const uuid = uuidv4();
  return prefix ? `${prefix}-${uuid}` : uuid;
}

export function validateIdempotencyKey(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }

  // Check if it's a valid UUID format (with or without prefix)
  const uuidRegex = /^([a-zA-Z0-9-]+-)?\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b$/i;
  return uuidRegex.test(key);
}

export function isValidIdempotencyKey(key: string): boolean {
  return validateIdempotencyKey(key);
}