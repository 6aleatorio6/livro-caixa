import { toIsoDate } from './toIsoDate';

describe('toIsoDate', () => {
  it.each([
    { description: 'the first day of the year', date: new Date(2026, 0, 1), expected: '2026-01-01' },
    { description: 'late at night, which UTC would move to the next day', date: new Date(2026, 0, 1, 23, 30), expected: '2026-01-01' },
    { description: 'just after midnight, which UTC would move to the previous day', date: new Date(2026, 5, 15, 0, 5), expected: '2026-06-15' },
    { description: 'a leap day', date: new Date(2028, 1, 29), expected: '2028-02-29' },
    { description: 'the last day of the year', date: new Date(2026, 11, 31, 23, 59), expected: '2026-12-31' },
  ])('Should write $description as $expected', ({ date, expected }) => {
    expect(toIsoDate(date)).toBe(expected);
  });
});
