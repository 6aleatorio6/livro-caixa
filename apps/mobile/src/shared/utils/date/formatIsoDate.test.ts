import { formatIsoDate } from './formatIsoDate';

describe('formatIsoDate', () => {
  it.each([
    { isoDate: '2026-01-01', expected: '01/01/2026' },
    { isoDate: '2026-11-10', expected: '10/11/2026' },
    { isoDate: '2028-02-29', expected: '29/02/2028' },
  ])('Should write $isoDate as $expected', ({ isoDate, expected }) => {
    expect(formatIsoDate(isoDate)).toBe(expected);
  });
});
