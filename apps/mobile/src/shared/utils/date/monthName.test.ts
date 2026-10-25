import { monthName } from './monthName';

describe('monthName', () => {
  it.each([
    ['2026-01', 'janeiro'],
    ['2026-02', 'fevereiro'],
    ['2026-03', 'março'],
    ['2026-04', 'abril'],
    ['2026-05', 'maio'],
    ['2026-06', 'junho'],
    ['2026-07', 'julho'],
    ['2026-08', 'agosto'],
    ['2026-09', 'setembro'],
    ['2026-10', 'outubro'],
    ['2026-11', 'novembro'],
    ['2026-12', 'dezembro'],
  ])('Should name %s as %s', (month, expected) => {
    expect(monthName(month)).toBe(expected);
  });
});
