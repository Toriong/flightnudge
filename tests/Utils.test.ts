/**
 * Unit tests for utility functions
 */

import {
  validateReminderMinutes,
  formatMinutesToHuman,
  safeJsonParse,
  remindersAreEqual
} from '../src/Utils';
import { MAX_REMINDER_MINUTES } from '../src/Constants';

describe('Utils', () => {
  describe('validateReminderMinutes', () => {
    it('should accept valid reminder arrays', () => {
      expect(validateReminderMinutes([10, 60, 120])).toBe(true);
      expect(validateReminderMinutes([1440])).toBe(true);
      expect(validateReminderMinutes([90, 180, 1440])).toBe(true);
    });

    it('should reject empty arrays', () => {
      expect(validateReminderMinutes([])).toBe(false);
    });

    it('should reject non-arrays', () => {
      expect(validateReminderMinutes(null as any)).toBe(false);
      expect(validateReminderMinutes(undefined as any)).toBe(false);
      expect(validateReminderMinutes('123' as any)).toBe(false);
    });

    it('should reject negative numbers', () => {
      expect(validateReminderMinutes([-10, 60])).toBe(false);
    });

    it('should reject zero', () => {
      expect(validateReminderMinutes([0, 60])).toBe(false);
    });

    it('should reject numbers exceeding max', () => {
      expect(validateReminderMinutes([MAX_REMINDER_MINUTES + 1])).toBe(false);
    });

    it('should reject non-integers', () => {
      expect(validateReminderMinutes([10.5, 60])).toBe(false);
    });

    it('should reject arrays with non-numbers', () => {
      expect(validateReminderMinutes([10, '60' as any, 120])).toBe(false);
    });

    it('should accept max reminder minutes', () => {
      expect(validateReminderMinutes([MAX_REMINDER_MINUTES])).toBe(true);
    });
  });

  describe('formatMinutesToHuman', () => {
    it('should format minutes correctly', () => {
      expect(formatMinutesToHuman(1)).toBe('1 minute');
      expect(formatMinutesToHuman(30)).toBe('30 minutes');
      expect(formatMinutesToHuman(59)).toBe('59 minutes');
    });

    it('should format hours correctly', () => {
      expect(formatMinutesToHuman(60)).toBe('1 hour');
      expect(formatMinutesToHuman(120)).toBe('2 hours');
      expect(formatMinutesToHuman(180)).toBe('3 hours');
    });

    it('should format hours and minutes', () => {
      expect(formatMinutesToHuman(90)).toBe('1h 30m');
      expect(formatMinutesToHuman(135)).toBe('2h 15m');
    });

    it('should format days correctly', () => {
      expect(formatMinutesToHuman(1440)).toBe('1 day');
      expect(formatMinutesToHuman(2880)).toBe('2 days');
    });

    it('should format days and hours', () => {
      expect(formatMinutesToHuman(1500)).toBe('1d 1h');
      expect(formatMinutesToHuman(3000)).toBe('2d 2h');
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      expect(safeJsonParse('{"foo":"bar"}', {})).toEqual({ foo: 'bar' });
      expect(safeJsonParse('[1,2,3]', [])).toEqual([1, 2, 3]);
    });

    it('should return fallback for invalid JSON', () => {
      expect(safeJsonParse('{invalid}', { default: true })).toEqual({ default: true });
      expect(safeJsonParse('', [])).toEqual([]);
    });

    it('should return fallback for null', () => {
      expect(safeJsonParse(null, { default: true })).toEqual({ default: true });
    });

    it('should handle complex objects', () => {
      const obj = { a: 1, b: [2, 3], c: { d: 4 } };
      expect(safeJsonParse(JSON.stringify(obj), {})).toEqual(obj);
    });
  });

  describe('remindersAreEqual', () => {
    it('should return true for identical reminders', () => {
      const r1 = [
        { method: 'popup' as const, minutes: 10 },
        { method: 'popup' as const, minutes: 60 }
      ];
      const r2 = [
        { method: 'popup' as const, minutes: 10 },
        { method: 'popup' as const, minutes: 60 }
      ];
      expect(remindersAreEqual(r1, r2)).toBe(true);
    });

    it('should return true for reminders in different order', () => {
      const r1 = [
        { method: 'popup' as const, minutes: 60 },
        { method: 'popup' as const, minutes: 10 }
      ];
      const r2 = [
        { method: 'popup' as const, minutes: 10 },
        { method: 'popup' as const, minutes: 60 }
      ];
      expect(remindersAreEqual(r1, r2)).toBe(true);
    });

    it('should return false for different lengths', () => {
      const r1 = [{ method: 'popup' as const, minutes: 10 }];
      const r2 = [
        { method: 'popup' as const, minutes: 10 },
        { method: 'popup' as const, minutes: 60 }
      ];
      expect(remindersAreEqual(r1, r2)).toBe(false);
    });

    it('should return false for different minutes', () => {
      const r1 = [{ method: 'popup' as const, minutes: 10 }];
      const r2 = [{ method: 'popup' as const, minutes: 20 }];
      expect(remindersAreEqual(r1, r2)).toBe(false);
    });

    it('should return false for different methods', () => {
      const r1 = [{ method: 'popup' as const, minutes: 10 }];
      const r2 = [{ method: 'email' as const, minutes: 10 }];
      expect(remindersAreEqual(r1, r2)).toBe(false);
    });

    it('should return true for empty arrays', () => {
      expect(remindersAreEqual([], [])).toBe(true);
    });
  });
});
