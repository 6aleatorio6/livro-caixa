import { overduePaymentOf } from '@/shared/testing/overduePaymentOf';
import { ownedPaymentOf } from '@/shared/testing/ownedPaymentOf';
import type { IOwnedPaymentEntry } from '@/shared/types/entry/OwnedPaymentEntry';

import { paidBillMonthOf } from './paidBillMonthOf';

describe('paidBillMonthOf', () => {
  it('Should be the month of the payment for the payment of the month', () => {
    expect(paidBillMonthOf(ownedPaymentOf({ month: '2026-10' }) as IOwnedPaymentEntry)).toBe('2026-10');
  });

  it('Should be the month of the bill, not the month it was paid in, for the payment of an overdue bill', () => {
    expect(paidBillMonthOf(overduePaymentOf({ month: '2026-11', billMonth: '2026-10' }))).toBe('2026-10');
  });
});
