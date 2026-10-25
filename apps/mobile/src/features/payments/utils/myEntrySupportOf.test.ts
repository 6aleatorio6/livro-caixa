import type { IEntry } from '@/shared/types/entry/Entry';

import { myEntrySupportOf } from './myEntrySupportOf';

const payment: IEntry = {
  id: '2026-10_aluguel',
  kind: 'recurringPayment',
  month: '2026-10',
  name: 'Aluguel',
  amountCents: 180000,
  tagId: 'casa',
  paidBy: 'u1',
  receiptFileId: 'f1',
  recurringBillId: 'aluguel',
  dueDay: 5,
  expectedAmountCents: 180000,
  date: null,
  paidOn: '2026-10-25',
};

const oneOff: IEntry = {
  id: 'a',
  kind: 'oneOffBill',
  month: '2026-10',
  name: 'Conserto',
  amountCents: 35000,
  tagId: 'casa',
  paidBy: 'u1',
  receiptFileId: 'f1',
  date: '2026-10-12',
};

describe('myEntrySupportOf', () => {
  it('Should write the payment date and the tag of a payment', () => {
    expect(myEntrySupportOf(payment, 'Casa')).toBe('pago em 25/10 · Casa');
  });

  it('Should write the expected amount instead of the tag when the paid amount differs', () => {
    expect(myEntrySupportOf({ ...payment, amountCents: 18735, expectedAmountCents: 11990 }, 'Casa')).toBe(
      'pago em 25/10 · previsto R$ 119,90',
    );
  });

  it('Should write the date, the one-off mark and the tag of a one-off bill', () => {
    expect(myEntrySupportOf(oneOff, 'Casa')).toBe('12/10 · avulsa · Casa');
  });

  it('Should leave the tag out when there is none', () => {
    expect(myEntrySupportOf(oneOff)).toBe('12/10 · avulsa');
  });
});
