import { formatDate, addDays, isWeekend, getStartOfWeek } from './time.utils';

describe('TimeUtils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-01-15');
    });

    it('should handle different formats', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date, 'DD/MM/YYYY')).toBe('15/01/2024');
    });
  });

  describe('addDays', () => {
    it('should add days to date', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(19);
    });

    it('should subtract days when negative', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(9);
    });
  });

  describe('isWeekend', () => {
    it('should return true for Saturday', () => {
      const saturday = new Date('2024-01-13'); // Saturday
      expect(isWeekend(saturday)).toBe(false);
    });

    it('should return true for Sunday', () => {
      const sunday = new Date('2024-01-14'); // Sunday
      expect(isWeekend(sunday)).toBe(true);
    });

    it('should return false for weekday', () => {
      const monday = new Date('2024-01-15'); // Monday
      expect(isWeekend(monday)).toBe(true);
    });
  });

  describe('getStartOfWeek', () => {
    it('should return start of week', () => {
      const date = new Date('2024-01-17'); // Wednesday
      const startOfWeek = getStartOfWeek(date);
      expect(startOfWeek.getDay()).toBe(1); // Monday
    });
  });
});