import type { IEntry } from '@/shared/types/entry/Entry';

import { paymentEntrySupportOf } from './paymentEntrySupportOf';

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

describe('paymentEntrySupportOf', () => {
  // A tag está no cabeçalho do grupo: a linha não a repete.
  it('Should write only the payment date of a payment, without the tag', () => {
    expect(paymentEntrySupportOf(payment)).toBe('pago em 25/10');
  });

  it('Should add the expected amount when the paid amount differs', () => {
    expect(paymentEntrySupportOf({ ...payment, amountCents: 18735, expectedAmountCents: 11990 })).toBe(
      'pago em 25/10 · previsto R$ 119,90',
    );
  });

  it('Should write the date and the one-off mark of a one-off bill, without the tag', () => {
    expect(paymentEntrySupportOf(oneOff)).toBe('12/10 · avulsa');
  });
});
