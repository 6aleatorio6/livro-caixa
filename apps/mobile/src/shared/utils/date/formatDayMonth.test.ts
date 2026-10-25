import { formatDayMonth } from './formatDayMonth';

describe('formatDayMonth', () => {
  it('Should write the day and the month of an ISO date', () => {
    expect(formatDayMonth('2026-10-12')).toBe('12/10');
  });
});
