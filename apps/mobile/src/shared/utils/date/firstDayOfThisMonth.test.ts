import { firstDayOfThisMonth } from './firstDayOfThisMonth';

describe('firstDayOfThisMonth', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    { description: 'the middle of a month', now: new Date(2026, 5, 15, 12), expected: '2026-06-01' },
    { description: 'the last night of a month, which UTC would move to the next one', now: new Date(2026, 0, 31, 23, 30), expected: '2026-01-01' },
    { description: 'the first day of the year', now: new Date(2027, 0, 1, 0, 5), expected: '2027-01-01' },
  ])('Should give the first day of the month on $description', ({ now, expected }) => {
    jest.setSystemTime(now);

    expect(firstDayOfThisMonth()).toBe(expected);
  });
});
