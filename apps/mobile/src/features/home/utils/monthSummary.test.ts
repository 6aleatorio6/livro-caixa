import type { IEntry } from '@/shared/types/entry/Entry';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';

import { monthSummary } from './monthSummary';

const bill = (overrides: Partial<IRecurringBill> = {}): IRecurringBill => ({
  id: 'rent',
  name: 'Aluguel',
  expectedAmountCents: 100000,
  dayOfMonth: 5,
  startsOn: '2026-01-01',
  tagId: null,
  ...overrides,
});

const payment = (overrides: Partial<Extract<IEntry, { kind: 'recurringPayment' }>> = {}): IEntry => ({
  id: '2026-10_rent',
  kind: 'recurringPayment',
  recurringBillId: 'rent',
  dueDay: 5,
  expectedAmountCents: 100000,
  date: null,
  paidOn: '2026-10-05',
  month: '2026-10',
  name: 'Aluguel',
  amountCents: 100000,
  tagId: null,
  paidBy: 'ana',
  ...overrides,
});

const oneOff = (overrides: Partial<Extract<IEntry, { kind: 'oneOffBill' }>> = {}): IEntry => ({
  id: 'e1',
  kind: 'oneOffBill',
  date: '2026-10-12',
  month: '2026-10',
  name: 'Farmácia',
  amountCents: 4500,
  tagId: null,
  paidBy: 'bruno',
  ...overrides,
});

describe('monthSummary', () => {
  it('Should be all zero in an empty month', () => {
    expect(monthSummary({ month: '2026-10', bills: [], entries: [] })).toEqual({
      toPay: [],
      paid: [],
      toPayCents: 0,
      paidCents: 0,
      totalCents: 0,
      billCount: 0,
    });
  });

  it('Should list a bill without payment as to pay, by the expected amount', () => {
    const summary = monthSummary({ month: '2026-10', bills: [bill()], entries: [] });

    expect(summary.toPay).toEqual([{ bill: bill(), dueDate: '2026-10-05' }]);
    expect(summary).toMatchObject({ toPayCents: 100000, paidCents: 0, totalCents: 100000, billCount: 1 });
  });

  it('Should list a payment and a one-off bill as paid', () => {
    const entries = [payment(), oneOff()];
    const summary = monthSummary({ month: '2026-10', bills: [bill()], entries });

    expect(summary.paid).toEqual(entries);
    expect(summary.toPay).toEqual([]);
    expect(summary).toMatchObject({ toPayCents: 0, paidCents: 104500, totalCents: 104500, billCount: 2 });
  });

  it('Should sort the bills to pay by due date', () => {
    const bills = [bill({ id: 'c', dayOfMonth: 20 }), bill({ id: 'a', dayOfMonth: 3 }), bill({ id: 'b', dayOfMonth: 10 })];

    expect(monthSummary({ month: '2026-10', bills, entries: [] }).toPay.map(({ bill: { id } }) => id)).toEqual(['a', 'b', 'c']);
  });

  it('Should not show in October a September bill without payment', () => {
    const entries = [payment({ id: '2026-09_rent', month: '2026-09' })];
    const bills = [bill({ id: 'water', dayOfMonth: 8 })];

    const september = monthSummary({ month: '2026-09', bills, entries });
    const october = monthSummary({ month: '2026-10', bills, entries: [] });

    expect(september.toPay.map(({ bill: { id } }) => id)).toEqual(['water']);
    expect(october.toPay.map(({ bill: { id } }) => id)).toEqual(['water']);
    expect(october.paid).toEqual([]);
  });

  it('Should count in September a one-off bill paid on 30/09 and registered in October', () => {
    const entry = oneOff({ date: '2026-09-30', month: '2026-09' });

    expect(monthSummary({ month: '2026-09', bills: [], entries: [entry] }).paid).toEqual([entry]);
    expect(monthSummary({ month: '2026-10', bills: [], entries: [] }).paid).toEqual([]);
  });

  it('Should take a day 31 bill as due in a 30-day month', () => {
    const summary = monthSummary({ month: '2026-04', bills: [bill({ dayOfMonth: 31 })], entries: [] });

    expect(summary.toPay).toEqual([{ bill: bill({ dayOfMonth: 31 }), dueDate: '2026-04-30' }]);
  });

  it('Should leave out a bill whose due date is before its start', () => {
    const summary = monthSummary({ month: '2026-10', bills: [bill({ startsOn: '2026-10-10' })], entries: [] });

    expect(summary.toPay).toEqual([]);
    expect(summary.billCount).toBe(0);
  });

  it('Should show the new expected amount in months without payment and keep the paid amount in paid ones', () => {
    const changed = bill({ expectedAmountCents: 120000 });
    const entries = [payment({ id: '2026-09_rent', month: '2026-09', amountCents: 100000 })];

    expect(monthSummary({ month: '2026-09', bills: [changed], entries })).toMatchObject({ toPayCents: 0, paidCents: 100000 });
    expect(monthSummary({ month: '2026-10', bills: [changed], entries: [] })).toMatchObject({ toPayCents: 120000, paidCents: 0 });
  });

  it('Should keep the payments of a deleted bill as paid, without the bill to pay', () => {
    const summary = monthSummary({ month: '2026-10', bills: [], entries: [payment()] });

    expect(summary.paid).toHaveLength(1);
    expect(summary).toMatchObject({ toPay: [], paidCents: 100000, totalCents: 100000, billCount: 1 });
  });

  it('Should take the paid amount, never a negative to pay, when a bill is paid above the expected', () => {
    const summary = monthSummary({ month: '2026-10', bills: [bill()], entries: [payment({ amountCents: 130000 })] });

    expect(summary).toMatchObject({ toPayCents: 0, paidCents: 130000, totalCents: 130000, billCount: 1 });
  });

  it('Should keep the entries without tag in the total', () => {
    const summary = monthSummary({ month: '2026-10', bills: [bill({ id: 'x', tagId: null })], entries: [oneOff({ tagId: null })] });

    expect(summary.totalCents).toBe(104500);
  });
});
