import type { IEntry } from '@/shared/types/entry/Entry';

import { paidRowsOf } from './paidRowsOf';

const payment = (name: string, dueDay: number): IEntry => ({
  id: `2026-10_${name}`,
  kind: 'recurringPayment',
  month: '2026-10',
  name,
  amountCents: 100,
  tagId: null,
  paidBy: 'u1',
  receiptFileId: 'f1',
  recurringBillId: name,
  dueDay,
  expectedAmountCents: 100,
  date: null,
  paidOn: '2026-10-25',
});

const oneOff = (name: string, date: string): IEntry => ({
  id: name,
  kind: 'oneOffBill',
  month: '2026-10',
  name,
  amountCents: 100,
  tagId: null,
  paidBy: 'u1',
  receiptFileId: 'f1',
  date,
});

describe('paidRowsOf', () => {
  it('Should order by the due day of the payment and the date of the one-off bill', () => {
    const rows = paidRowsOf([oneOff('Conserto', '2026-10-12'), payment('Luz', 20), payment('Aluguel', 5)]);

    expect(rows.map((row) => row.name)).toEqual(['Aluguel', 'Conserto', 'Luz']);
  });

  it('Should order by name on the same day', () => {
    const rows = paidRowsOf([payment('Luz', 10), oneOff('Água', '2026-10-10')]);

    expect(rows.map((row) => row.name)).toEqual(['Água', 'Luz']);
  });

  it('Should not change the list it receives', () => {
    const paid = [payment('Luz', 20), payment('Aluguel', 5)];

    paidRowsOf(paid);

    expect(paid.map((row) => row.name)).toEqual(['Luz', 'Aluguel']);
  });
});
