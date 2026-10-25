import { currentMonth } from './currentMonth';
import { monthOf } from './monthOf';

describe('monthOf', () => {
  afterEach(() => jest.useRealTimers());

  it.each([
    { isoDate: '2026-09-30', expected: '2026-09' },
    { isoDate: '2026-01-01', expected: '2026-01' },
    { isoDate: '2026-12-31', expected: '2026-12' },
  ])('Should take $expected from $isoDate', ({ isoDate, expected }) => {
    expect(monthOf(isoDate)).toBe(expected);
  });

  it('Should put September 30 registered on October 2 in September', () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 2, 9));

    expect(currentMonth()).toBe('2026-10');
    expect(monthOf('2026-09-30')).toBe('2026-09');
  });
});
