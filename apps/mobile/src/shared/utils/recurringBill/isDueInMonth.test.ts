import { dueDateInMonth } from './dueDateInMonth';
import { isDueInMonth } from './isDueInMonth';

describe('isDueInMonth', () => {
  it.each([
    { description: 'a month before the start', dayOfMonth: 5, startsOn: '2026-11-10', month: '2026-10', isDue: false },
    { description: 'the start month, with the due date before the start', dayOfMonth: 5, startsOn: '2026-11-10', month: '2026-11', isDue: false },
    { description: 'the start month, with the due date after the start', dayOfMonth: 25, startsOn: '2026-11-10', month: '2026-11', isDue: true },
    { description: 'the start month, with the due date on the start', dayOfMonth: 10, startsOn: '2026-11-10', month: '2026-11', isDue: true },
    { description: 'the month after the start', dayOfMonth: 5, startsOn: '2026-11-10', month: '2026-12', isDue: true },
    { description: 'a month a year after the start', dayOfMonth: 5, startsOn: '2026-11-10', month: '2027-11', isDue: true },
    { description: 'a year before the start', dayOfMonth: 31, startsOn: '2026-01-01', month: '2025-12', isDue: false },
    { description: 'the start month, with day 31 clamped to the last day', dayOfMonth: 31, startsOn: '2026-04-30', month: '2026-04', isDue: true },
    { description: 'the start month, with day 31 clamped to the start itself', dayOfMonth: 31, startsOn: '2026-02-28', month: '2026-02', isDue: true },
  ])('Should say $isDue for $description', ({ dayOfMonth, startsOn, month, isDue }) => {
    expect(isDueInMonth({ dayOfMonth, startsOn }, month)).toBe(isDue);
  });

  describe('A bill not paid in September', () => {
    const bill = { dayOfMonth: 10, startsOn: '2026-01-01' };

    it.each([
      { month: '2026-09', expectedDueDate: '2026-09-10' },
      { month: '2026-10', expectedDueDate: '2026-10-10' },
    ])('Should look only at the due date of $month', ({ month, expectedDueDate }) => {
      expect(isDueInMonth(bill, month)).toBe(true);
      expect(dueDateInMonth(bill.dayOfMonth, month)).toBe(expectedDueDate);
    });
  });
});
