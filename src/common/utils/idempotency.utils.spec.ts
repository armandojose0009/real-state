import { generateIdempotencyKey, validateIdempotencyKey, isValidIdempotencyKey } from './idempotency.utils';

describe('IdempotencyUtils', () => {
  describe('generateIdempotencyKey', () => {
    it('should generate unique idempotency key', () => {
      const key1 = generateIdempotencyKey();
      const key2 = generateIdempotencyKey();
      
      expect(key1).toBeDefined();
      expect(key2).toBeDefined();
      expect(key1).not.toBe(key2);
      expect(key1.length).toBeGreaterThan(0);
    });

    it('should generate key with prefix', () => {
      const key = generateIdempotencyKey('test');
      expect(key).toMatch(/^test-/);
    });
  });

  describe('validateIdempotencyKey', () => {
    it('should validate correct format', () => {
      const validKey = 'test-123e4567-e89b-12d3-a456-426614174000';
      expect(validateIdempotencyKey(validKey)).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(validateIdempotencyKey('invalid-key')).toBe(false);
      expect(validateIdempotencyKey('')).toBe(false);
      expect(validateIdempotencyKey('123')).toBe(false);
    });
  });

  describe('isValidIdempotencyKey', () => {
    it('should return true for valid keys', () => {
      const validKey = generateIdempotencyKey();
      expect(isValidIdempotencyKey(validKey)).toBe(true);
    });

    it('should return false for invalid keys', () => {
      expect(isValidIdempotencyKey('invalid')).toBe(false);
      expect(isValidIdempotencyKey('')).toBe(false);
    });
  });
});