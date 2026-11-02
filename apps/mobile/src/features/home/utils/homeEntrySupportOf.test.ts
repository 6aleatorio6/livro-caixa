import type { IEntry } from '@/shared/types/entry/Entry';

import { homeEntrySupportOf } from './homeEntrySupportOf';

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
  paidOn: '2026-10-05',
};

const oneOff: IEntry = {
  id: 'a',
  kind: 'oneOffBill',
  month: '2026-10',
  name: 'Conserto',
  amountCents: 35000,
  tagId: 'casa',
  paidBy: 'u2',
  receiptFileId: 'f1',
  date: '2026-10-12',
};

describe('homeEntrySupportOf', () => {
  it('Should write the due day and who paid a payment, without the tag', () => {
    expect(homeEntrySupportOf(payment, 'Ana')).toBe('dia 5 · Ana');
  });

  it('Should add the expected amount when the paid amount differs', () => {
    expect(homeEntrySupportOf({ ...payment, amountCents: 18735, expectedAmountCents: 21000 }, 'Ana')).toBe(
      'dia 5 · Ana · previsto R$ 210,00',
    );
  });

  it('Should write the date, the one-off mark and who registered a one-off bill, without the tag', () => {
    expect(homeEntrySupportOf(oneOff, 'Bruno')).toBe('12/10 · avulsa · Bruno');
  });
});
