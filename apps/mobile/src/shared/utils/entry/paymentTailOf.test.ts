import type { IEntry } from '@/shared/types/entry/Entry';

import { paymentTailOf } from './paymentTailOf';

const payment = (overrides: Partial<Extract<IEntry, { kind: 'recurringPayment' }>> = {}): IEntry => ({
  id: '2026-10_luz',
  kind: 'recurringPayment',
  month: '2026-10',
  name: 'Luz',
  amountCents: 18735,
  tagId: 'casa',
  paidBy: 'u1',
  recurringBillId: 'luz',
  dueDay: 10,
  expectedAmountCents: 21000,
  date: null,
  paidOn: '2026-10-10',
  ...overrides,
});

describe('paymentTailOf', () => {
  it('Should give the expected amount when the payment differs from it', () => {
    expect(paymentTailOf(payment(), 'Casa')).toBe('previsto R$ 210,00');
  });

  it('Should give the tag when the payment is the expected amount', () => {
    expect(paymentTailOf(payment({ amountCents: 21000 }), 'Casa')).toBe('Casa');
  });

  it('Should give nothing for a payment without tag and with the expected amount', () => {
    expect(paymentTailOf(payment({ amountCents: 21000 }))).toBeUndefined();
  });

  it('Should give the tag for a one-off bill', () => {
    const oneOff: IEntry = {
      id: 'a',
      kind: 'oneOffBill',
      month: '2026-10',
      name: 'Conserto',
      amountCents: 100,
      tagId: 'casa',
      paidBy: 'u1',
      date: '2026-10-12',
    };

    expect(paymentTailOf(oneOff, 'Casa')).toBe('Casa');
  });
});
