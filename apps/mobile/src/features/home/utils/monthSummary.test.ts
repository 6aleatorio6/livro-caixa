import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';

import { contributionOf } from '@/shared/testing/contributionOf';
import { ownedPaymentOf } from '@/shared/testing/ownedPaymentOf';
import { unownedPaymentOf } from '@/shared/testing/unownedPaymentOf';

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

const payment = (overrides: Partial<Extract<IOwnedEntry, { kind: 'recurringPayment' }>> = {}): IOwnedEntry => ({
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
  receiptFileId: 'f1',
  ...overrides,
});

const oneOff = (overrides: Partial<Extract<IOwnedEntry, { kind: 'oneOffBill' }>> = {}): IOwnedEntry => ({
  id: 'e1',
  kind: 'oneOffBill',
  date: '2026-10-12',
  month: '2026-10',
  name: 'Farmácia',
  amountCents: 4500,
  tagId: null,
  paidBy: 'bruno',
  receiptFileId: 'f1',
  ...overrides,
});

describe('monthSummary', () => {
  it('Should be all zero in an empty month', () => {
    expect(monthSummary({ month: '2026-10', bills: [], entries: [] })).toEqual({
      toPay: [],
      paid: [],
      entries: [],
      toPayCents: 0,
      paidCents: 0,
      totalCents: 0,
      billCount: 0,
    });
  });

  it('Should list a bill without payment as to pay, by the expected amount', () => {
    const summary = monthSummary({ month: '2026-10', bills: [bill()], entries: [] });

    expect(summary.toPay).toEqual([
      {
        bill: bill(),
        name: 'Aluguel',
        tagId: null,
        dueDate: '2026-10-05',
        payment: null,
        contributions: [],
        remainingCents: 100000,
      },
    ]);
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

    expect(summary.toPay).toEqual([
      {
        bill: bill({ dayOfMonth: 31 }),
        name: 'Aluguel',
        tagId: null,
        dueDate: '2026-04-30',
        payment: null,
        contributions: [],
        remainingCents: 100000,
      },
    ]);
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

  describe('With contributions', () => {
    // A Luz prevista em R$ 200,00, sem dono; a conta de hoje é a mesma.
    const electricityBill = bill({ id: 'electricity', name: 'Luz', expectedAmountCents: 20000, dayOfMonth: 20 });
    const electricity = unownedPaymentOf();

    it('Should keep a month with contributions below the expected amount to pay for what is left', () => {
      const entries = [electricity, contributionOf(electricity.id, 'ana', 10000)];

      const summary = monthSummary({ month: '2026-10', bills: [electricityBill], entries });

      expect(summary.toPay).toEqual([
        // O nome e a tag são as cópias do pagamento sem dono.
        {
          bill: electricityBill,
          name: 'Luz',
          tagId: 'servicos',
          dueDate: '2026-10-20',
          payment: electricity,
          contributions: [entries[1]],
          remainingCents: 10000,
        },
      ]);
      expect(summary.paid).toEqual([]);
      expect(summary).toMatchObject({ toPayCents: 10000, paidCents: 10000, totalCents: 20000, billCount: 1 });
    });

    it('Should count it paid when the contributions reach the expected amount', () => {
      const entries = [
        electricity,
        contributionOf(electricity.id, 'ana', 10000),
        contributionOf(electricity.id, 'bruno', 10000),
      ];

      const summary = monthSummary({ month: '2026-10', bills: [electricityBill], entries });

      expect(summary.toPay).toEqual([]);
      expect(summary.paid).toEqual([electricity]);
      expect(summary).toMatchObject({ toPayCents: 0, paidCents: 20000, totalCents: 20000, billCount: 1 });
    });

    it('Should count it paid by the sum when the contributions pass the expected amount', () => {
      const entries = [
        electricity,
        contributionOf(electricity.id, 'ana', 10000),
        contributionOf(electricity.id, 'bruno', 13000),
      ];

      const summary = monthSummary({ month: '2026-10', bills: [electricityBill], entries });

      expect(summary.paid).toEqual([electricity]);
      expect(summary).toMatchObject({ toPayCents: 0, paidCents: 23000, totalCents: 23000 });
    });

    it("Should keep the month's expected amount when the bill changes", () => {
      const rentBill = bill({ expectedAmountCents: 220000 });
      const rent = unownedPaymentOf({
        id: '2026-10_rent',
        recurringBillId: 'rent',
        name: 'Aluguel',
        dueDay: 5,
        expectedAmountCents: 200000,
      });

      const summary = monthSummary({
        month: '2026-10',
        bills: [rentBill],
        entries: [rent, contributionOf(rent.id, 'bruno', 50000)],
      });

      expect(summary.toPay.map(({ remainingCents }) => remainingCents)).toEqual([150000]);
      expect(summary).toMatchObject({ toPayCents: 150000, paidCents: 50000, totalCents: 200000 });
    });

    it('Should keep the contributions of a deleted bill in the month, without what was left', () => {
      const summary = monthSummary({
        month: '2026-10',
        bills: [],
        entries: [electricity, contributionOf(electricity.id, 'bruno', 5000)],
      });

      expect(summary).toMatchObject({ toPay: [], paid: [], toPayCents: 0, paidCents: 5000, totalCents: 5000 });
    });

    it('Should keep the month total unchanged by contributions to a paid entry', () => {
      const rent = ownedPaymentOf({ amountCents: 100000, expectedAmountCents: 100000 });

      const summary = monthSummary({
        month: '2026-10',
        bills: [bill()],
        entries: [rent, contributionOf(rent.id, 'bruno', 40000)],
      });

      expect(summary.paid).toEqual([rent]);
      expect(summary).toMatchObject({ toPayCents: 0, paidCents: 100000, totalCents: 100000, billCount: 1 });
    });
  });
});
