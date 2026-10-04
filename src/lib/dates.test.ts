import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, formatOwnedFor, formatPartialDate, isValidPartialDate } from './dates';

describe('dates', () => {
  it('adds days across month boundaries', () => {
    expect(addDays('2026-10-01', -1)).toBe('2026-09-30');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(daysBetween('2026-09-30', '2026-10-04')).toBe(4);
  });

  it('validates partial dates', () => {
    expect(isValidPartialDate('2023')).toBe(true);
    expect(isValidPartialDate('2023-05')).toBe(true);
    expect(isValidPartialDate('2023-05-12')).toBe(true);
    expect(isValidPartialDate('2023-13')).toBe(false);
    expect(isValidPartialDate('23-05')).toBe(false);
  });

  it('formats partial dates', () => {
    expect(formatPartialDate('2023')).toBe('2023');
    expect(formatPartialDate('2023-05')).toBe('May 2023');
    expect(formatPartialDate('2023-05-12')).toBe('12 May 2023');
  });

  it('computes owned-for durations', () => {
    const now = new Date(2026, 9, 4);
    expect(formatOwnedFor('2026-09-20', now)).toBe('less than a month');
    expect(formatOwnedFor('2026-04', now)).toBe('5 months');
    expect(formatOwnedFor('2024-10-04', now)).toBe('2 years');
    expect(formatOwnedFor('2025-04-01', now)).toBe('1 year, 6 months');
    expect(formatOwnedFor('2022', now)).toBe('~4 years');
  });
});
