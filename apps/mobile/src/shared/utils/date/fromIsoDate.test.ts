import { fromIsoDate } from './fromIsoDate';

describe('fromIsoDate', () => {
  it.each([
    { description: 'the first day of the year', isoDate: '2026-01-01', expected: new Date(2026, 0, 1) },
    { description: 'a leap day', isoDate: '2028-02-29', expected: new Date(2028, 1, 29) },
    { description: 'the last day of the year', isoDate: '2026-12-31', expected: new Date(2026, 11, 31) },
  ])('Should read $description as a local date at midnight', ({ isoDate, expected }) => {
    expect(fromIsoDate(isoDate)).toEqual(expected);
  });
});
