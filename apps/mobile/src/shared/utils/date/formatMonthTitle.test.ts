import { formatMonthTitle } from './formatMonthTitle';

describe('formatMonthTitle', () => {
  it.each([
    ['2026-10', 'Outubro de 2026'],
    ['2025-03', 'Março de 2025'],
    ['2027-01', 'Janeiro de 2027'],
  ])('Should write %s as %s', (month, expected) => {
    expect(formatMonthTitle(month)).toBe(expected);
  });
});
