import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';

import { isMonthToPay } from './isMonthToPay';

const bill: IRecurringBill = {
  id: 'internet',
  name: 'Internet',
  expectedAmountCents: 11990,
  dayOfMonth: 15,
  startsOn: '2026-03-10',
  tagId: null,
};

describe('isMonthToPay', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 9, 25) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    ['the current month', '2026-10'],
    ['the next month', '2026-11'],
    ['a past month', '2026-05'],
    ['the month the bill starts, when it already fell due', '2026-03'],
  ])('Should accept %s', (_case, month) => {
    expect(isMonthToPay(bill, month)).toBe(true);
  });

  it.each([
    ['the month after the next', '2026-12'],
    ['the month before the bill starts', '2026-02'],
    ['a month 13', '2026-13'],
    ['a month without the zero', '2026-9'],
    ['a text', 'outubro'],
    ['an empty text', ''],
    ['no month', undefined],
  ])('Should refuse %s', (_case, month) => {
    expect(isMonthToPay(bill, month)).toBe(false);
  });

  it('Should refuse the month the bill starts when the due day is before the start', () => {
    expect(isMonthToPay({ ...bill, dayOfMonth: 5 }, '2026-03')).toBe(false);
  });

  it('Should accept January of the next year in December, and not February', () => {
    jest.setSystemTime(new Date(2026, 11, 10));

    expect(isMonthToPay(bill, '2027-01')).toBe(true);
    expect(isMonthToPay(bill, '2027-02')).toBe(false);
  });
});
