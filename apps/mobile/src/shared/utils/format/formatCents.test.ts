import { formatCents } from './formatCents';

describe('formatCents', () => {
  it.each([
    { cents: 0, expected: 'R$ 0,00' },
    { cents: 1, expected: 'R$ 0,01' },
    { cents: 10, expected: 'R$ 0,10' },
    { cents: 99, expected: 'R$ 0,99' },
    { cents: 100, expected: 'R$ 1,00' },
    { cents: 11990, expected: 'R$ 119,90' },
    { cents: 100000, expected: 'R$ 1.000,00' },
    { cents: 267790, expected: 'R$ 2.677,90' },
    { cents: 123456789, expected: 'R$ 1.234.567,89' },
  ])('Should write $cents cents as $expected', ({ cents, expected }) => {
    expect(formatCents(cents)).toBe(expected);
  });
});
