import { dueDateInMonth } from './dueDateInMonth';

describe('dueDateInMonth', () => {
  it.each([
    { description: 'a day that fits the month', dayOfMonth: 15, month: '2026-04', expected: '2026-04-15' },
    { description: 'a single-digit day, padded', dayOfMonth: 5, month: '2026-11', expected: '2026-11-05' },
    { description: 'day 31 in a 31-day month', dayOfMonth: 31, month: '2026-12', expected: '2026-12-31' },
    { description: 'day 31 in April, a 30-day month', dayOfMonth: 31, month: '2026-04', expected: '2026-04-30' },
    { description: 'day 31 in February 2026', dayOfMonth: 31, month: '2026-02', expected: '2026-02-28' },
    { description: 'day 29 in February 2026', dayOfMonth: 29, month: '2026-02', expected: '2026-02-28' },
    { description: 'day 31 in February 2028, a leap year', dayOfMonth: 31, month: '2028-02', expected: '2028-02-29' },
    { description: 'day 29 in February 2028, a leap year', dayOfMonth: 29, month: '2028-02', expected: '2028-02-29' },
  ])('Should give the due date for $description', ({ dayOfMonth, month, expected }) => {
    expect(dueDateInMonth(dayOfMonth, month)).toBe(expected);
  });
});
