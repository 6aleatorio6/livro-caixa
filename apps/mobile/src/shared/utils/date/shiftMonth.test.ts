import { shiftMonth } from './shiftMonth';

describe('shiftMonth', () => {
  it.each([
    { month: '2026-10', offset: 1, expected: '2026-11' },
    { month: '2026-10', offset: -1, expected: '2026-09' },
    { month: '2026-12', offset: 1, expected: '2027-01' },
    { month: '2026-01', offset: -1, expected: '2025-12' },
    { month: '2026-10', offset: 0, expected: '2026-10' },
    { month: '2026-03', offset: -15, expected: '2024-12' },
  ])('Should move $month by $offset to $expected', ({ month, offset, expected }) => {
    expect(shiftMonth(month, offset)).toBe(expected);
  });
});
