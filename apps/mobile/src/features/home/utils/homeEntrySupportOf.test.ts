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
  it('Should write the due day, who paid and the tag of a payment', () => {
    expect(homeEntrySupportOf(payment, { memberName: 'Ana', tagName: 'Casa' })).toBe('dia 5 · Ana · Casa');
  });

  it('Should write the expected amount instead of the tag when the paid amount differs', () => {
    expect(
      homeEntrySupportOf(
        { ...payment, amountCents: 18735, expectedAmountCents: 21000 },
        { memberName: 'Ana', tagName: 'Casa' },
      ),
    ).toBe('dia 5 · Ana · previsto R$ 210,00');
  });

  it('Should write the date, the one-off mark, who registered and the tag of a one-off bill', () => {
    expect(homeEntrySupportOf(oneOff, { memberName: 'Bruno', tagName: 'Casa' })).toBe('12/10 · avulsa · Bruno · Casa');
  });

  it('Should leave the tag out when there is none', () => {
    expect(homeEntrySupportOf(oneOff, { memberName: 'Bruno' })).toBe('12/10 · avulsa · Bruno');
  });
});
