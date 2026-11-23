import { contributionOf } from '@/shared/testing/contributionOf';
import { ownedPaymentOf } from '@/shared/testing/ownedPaymentOf';
import { unownedPaymentOf } from '@/shared/testing/unownedPaymentOf';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';

import { billRemindersOf } from './billRemindersOf';

const internet: IRecurringBill = {
  id: 'internet',
  name: 'Internet',
  expectedAmountCents: 11990,
  dayOfMonth: 15,
  startsOn: '2026-01-01',
  tagId: 'casa',
};

const NOVEMBER_10 = new Date(2026, 10, 10, 8, 0);

const remindersOf = (args: Partial<Parameters<typeof billRemindersOf>[0]>) =>
  billRemindersOf({ now: NOVEMBER_10, months: ['2026-11', '2026-12'], bills: [internet], entries: [], ...args });

describe('billRemindersOf', () => {
  it('Should remind a bill due on the 15th at 9h of the 14th, with the id of its payment', () => {
    const reminders = remindersOf({ months: ['2026-11'] });

    expect(reminders).toEqual([
      {
        identifier: '2026-11_internet',
        title: 'Internet vence amanhã',
        body: 'R$ 119,90, ainda a pagar',
        date: new Date(2026, 10, 14, 9, 0, 0, 0),
      },
    ]);
  });

  it('Should remind a bill of the 31st on the 29th of a 30-day month, the eve of its real due date', () => {
    const reminders = remindersOf({ months: ['2026-11'], bills: [{ ...internet, dayOfMonth: 31 }] });

    expect(reminders.map(({ date }) => date)).toEqual([new Date(2026, 10, 29, 9, 0, 0, 0)]);
  });

  it('Should not remind a bill already paid in the month', () => {
    const payment = ownedPaymentOf({ id: '2026-11_internet', month: '2026-11', recurringBillId: 'internet' });

    const reminders = remindersOf({ months: ['2026-11'], entries: [payment] });

    expect(reminders).toEqual([]);
  });

  it('Should remind what is left of a bill with a partial contribution', () => {
    const payment = unownedPaymentOf({
      id: '2026-11_internet',
      month: '2026-11',
      recurringBillId: 'internet',
      name: 'Internet',
      expectedAmountCents: 11990,
    });
    const contribution = { ...contributionOf('2026-11_internet', 'bruno', 4000), month: '2026-11' };

    const reminders = remindersOf({ months: ['2026-11'], entries: [payment, contribution] });

    expect(reminders.map(({ body }) => body)).toEqual(['R$ 79,90, ainda a pagar']);
  });

  it('Should not remind a bill whose eve has already passed', () => {
    const reminders = remindersOf({ months: ['2026-11'], now: new Date(2026, 10, 14, 10, 0) });

    expect(reminders).toEqual([]);
  });

  it('Should remind a bill of the 1st of the next month on the last day of the current month', () => {
    const reminders = remindersOf({ bills: [{ ...internet, dayOfMonth: 1 }] });

    // O 1º de novembro já passou: sobra o do 1º de dezembro, lembrado em 30 de novembro.
    expect(reminders.map(({ identifier, date }) => [identifier, date])).toEqual([
      ['2026-12_internet', new Date(2026, 10, 30, 9, 0, 0, 0)],
    ]);
  });

  it('Should not remind a month in which the bill has not started yet', () => {
    const reminders = remindersOf({ bills: [{ ...internet, startsOn: '2026-11-20' }] });

    expect(reminders.map(({ identifier }) => identifier)).toEqual(['2026-12_internet']);
  });
});
