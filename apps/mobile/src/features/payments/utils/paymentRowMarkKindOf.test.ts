import { contributionOf } from '@/shared/testing/contributionOf';
import { ownedPaymentOf } from '@/shared/testing/ownedPaymentOf';
import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';
import { memberPartsOf } from '@/shared/utils/entry/memberPartsOf';

import { paymentRowMarkKindOf } from './paymentRowMarkKindOf';
import { paymentRowsOf } from './paymentRowsOf';

const payment = ownedPaymentOf({ paidBy: 'ana' });
const oneOff: IOwnedEntry = {
  id: 'a',
  kind: 'oneOffBill',
  month: '2026-10',
  name: 'Conserto',
  amountCents: 35000,
  tagId: null,
  paidBy: 'ana',
  receiptFileId: 'f1',
  date: '2026-10-12',
};

describe('paymentRowMarkKindOf', () => {
  it('Should mark the part of who paid after the bill, a payment or a one-off bill', () => {
    const [paymentRow, oneOffRow] = paymentRowsOf(memberPartsOf([payment, oneOff]), new Set(['ana']));

    expect(paymentRowMarkKindOf(paymentRow)).toBe('payment');
    expect(paymentRowMarkKindOf(oneOffRow)).toBe('oneOff');
  });

  // A conta com o mesmo nome em duas linhas: a marca é o que as separa à primeira vista.
  it('Should mark a contribution as a contribution, not as the payment it goes to', () => {
    const parts = memberPartsOf([contributionOf(payment.id, 'bruno', 4000), payment]);

    const rows = paymentRowsOf(parts, new Set(['ana', 'bruno']));

    expect(rows.map(paymentRowMarkKindOf)).toEqual(['payment', 'contribution']);
  });
});
