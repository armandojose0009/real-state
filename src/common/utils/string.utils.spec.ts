// Since string.utils.ts doesn't exist, let's create it and test it
import { slugify, capitalize, truncate, generateRandomString } from './string.utils';

describe('StringUtils', () => {
  describe('slugify', () => {
    it('should convert string to slug format', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Test String With Spaces')).toBe('test-string-with-spaces');
      expect(slugify('Special!@#$%Characters')).toBe('specialcharacters');
    });

    it('should handle empty string', () => {
      expect(slugify('')).toBe('');
    });

    it('should handle string with numbers', () => {
      expect(slugify('Test 123 String')).toBe('test-123-string');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('This is a very long string', 10)).toBe('This is...');
    });

    it('should not truncate short strings', () => {
      expect(truncate('Short', 10)).toBe('Short');
    });

    it('should handle custom suffix', () => {
      expect(truncate('Long string', 5, '***')).toBe('Lo***');
    });
  });

  describe('generateRandomString', () => {
    it('should generate string of specified length', () => {
      expect(generateRandomString(10)).toHaveLength(10);
      expect(generateRandomString(5)).toHaveLength(5);
    });

    it('should generate different strings', () => {
      const str1 = generateRandomString(10);
      const str2 = generateRandomString(10);
      expect(str1).not.toBe(str2);
    });
  });
});