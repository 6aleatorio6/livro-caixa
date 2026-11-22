import { overdueMonthOf } from '@/shared/testing/overdueMonthOf';
import { contributionOf } from '@/shared/testing/contributionOf';
import { ownedPaymentOf } from '@/shared/testing/ownedPaymentOf';
import { unownedPaymentOf } from '@/shared/testing/unownedPaymentOf';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';

import { overdueBillsOf } from './overdueBillsOf';

const water: IRecurringBill = {
  id: 'water',
  name: 'Água',
  expectedAmountCents: 9000,
  dayOfMonth: 20,
  startsOn: '2026-01-01',
  tagId: 'casa',
};
const internet: IRecurringBill = {
  ...water,
  id: 'internet',
  name: 'Internet',
  expectedAmountCents: 11990,
  dayOfMonth: 10,
};

const overdueOf = (args: Partial<Parameters<typeof overdueBillsOf>[0]>) =>
  overdueBillsOf({ bills: [water, internet], entries: [], overdueMonths: [], currentMonth: '2026-11', ...args });

describe('overdueBillsOf', () => {
  it('Should list the bills of an earlier month without payment, by due date', () => {
    const overdue = overdueOf({});

    expect(overdue.map(({ name, month, dueDate, remainingCents }) => [name, month, dueDate, remainingCents])).toEqual([
      ['Internet', '2026-10', '2026-10-10', 11990],
      ['Água', '2026-10', '2026-10-20', 9000],
    ]);
    expect(overdue.map(({ overdue: state }) => state)).toEqual(['fromEarlierMonth', 'fromEarlierMonth']);
  });

  it('Should leave out what the month summary takes out of to pay: a payment, a skipped month and a month paid later', () => {
    const rent: IRecurringBill = { ...water, id: 'rent', name: 'Aluguel', dayOfMonth: 5 };
    const gas: IRecurringBill = { ...water, id: 'gas', name: 'Gás', dayOfMonth: 25 };

    const overdue = overdueOf({
      bills: [water, internet, rent, gas],
      entries: [ownedPaymentOf({ id: '2026-10_water', recurringBillId: 'water', name: 'Água' })],
      overdueMonths: [
        overdueMonthOf(),
        overdueMonthOf({
          id: '2026-10_gas',
          status: 'paidLater',
          recurringBillId: 'gas',
          name: 'Gás',
          entryId: 'overdue-gas',
        }),
      ],
    });

    expect(overdue.map(({ name }) => name)).toEqual(['Aluguel']);
  });

  it('Should keep an overdue bill with contributions for what is left, with the payment without owner', () => {
    const payment = unownedPaymentOf({
      id: '2026-10_water',
      recurringBillId: 'water',
      name: 'Água',
      expectedAmountCents: 9000,
    });
    const contribution = contributionOf(payment.id, 'ana', 4000);

    const overdue = overdueOf({ bills: [water], entries: [payment, contribution] });

    expect(overdue).toMatchObject([{ name: 'Água', month: '2026-10', payment, remainingCents: 5000 }]);
    expect(overdue[0].contributions).toEqual([contribution]);
  });

  it('Should list the months from the oldest to the newest, each bill by its due date', () => {
    const overdue = overdueOf({ currentMonth: '2026-12' });

    expect(overdue.map(({ name, month }) => [name, month])).toEqual([
      ['Internet', '2026-10'],
      ['Água', '2026-10'],
      ['Internet', '2026-11'],
      ['Água', '2026-11'],
    ]);
  });

  it('Should take a skipped month out of that month only', () => {
    const overdue = overdueOf({ currentMonth: '2026-12', bills: [internet], overdueMonths: [overdueMonthOf()] });

    expect(overdue.map(({ month }) => month)).toEqual(['2026-11']);
  });

  it('Should leave out the months before the bill started', () => {
    const overdue = overdueOf({ currentMonth: '2026-12', bills: [{ ...water, startsOn: '2026-11-05' }] });

    expect(overdue.map(({ month }) => month)).toEqual(['2026-11']);
  });

  it('Should be empty in the first month of the app, which has no month before it', () => {
    expect(overdueOf({ currentMonth: '2026-10' })).toEqual([]);
  });
});
