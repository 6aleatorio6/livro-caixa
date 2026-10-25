import { dayOf } from './dayOf';

describe('dayOf', () => {
  it('Should give the day of the month without the leading zero', () => {
    expect(dayOf('2026-10-05')).toBe(5);
  });

  it('Should give a two-digit day', () => {
    expect(dayOf('2026-10-31')).toBe(31);
  });
});
