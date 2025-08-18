import { getTodayString, formatDate } from '../index';

describe('Date utilities', () => {
  describe('getTodayString', () => {
    it('should return today\'s date in YYYY-MM-DD format', () => {
      const today = getTodayString();
      const now = new Date();
      const expectedYear = now.getFullYear();
      const expectedMonth = String(now.getMonth() + 1).padStart(2, '0');
      const expectedDay = String(now.getDate()).padStart(2, '0');
      const expected = `${expectedYear}-${expectedMonth}-${expectedDay}`;
      
      expect(today).toBe(expected);
    });
  });

  describe('formatDate', () => {
    it('should format YYYY-MM-DD strings correctly', () => {
      const result = formatDate('2023-12-25');
      expect(result).toContain('December 25, 2023');
    });

    it('should format ISO timestamp strings correctly', () => {
      const result = formatDate('2023-12-25T10:30:00.000Z');
      expect(result).toContain('December 25, 2023');
    });

    it('should format Date objects correctly', () => {
      const date = new Date(2023, 11, 25); // December 25, 2023 (month is 0-indexed)
      const result = formatDate(date);
      expect(result).toContain('December 25, 2023');
    });
  });

  describe('Date consistency', () => {
    it('should handle edge cases around midnight', () => {
      // Test with a date that might be affected by timezone
      const testDate = '2023-12-25';
      const formatted = formatDate(testDate);
      
      // Should always show December 25, regardless of timezone
      expect(formatted).toContain('December 25');
      expect(formatted).toContain('2023');
    });

    it('should format today\'s date consistently', () => {
      // Get today's date string
      const todayString = getTodayString();
      
      // Format it for display
      const formattedDate = formatDate(todayString);
      
      // Should contain today's date
      const today = new Date();
      const expectedMonth = today.toLocaleDateString('en-US', { month: 'long' });
      const expectedDay = today.getDate();
      const expectedYear = today.getFullYear();
      
      expect(formattedDate).toContain(expectedMonth);
      expect(formattedDate).toContain(expectedDay.toString());
      expect(formattedDate).toContain(expectedYear.toString());
    });
  });
});
