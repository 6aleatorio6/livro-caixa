import { contributionOf } from '@/shared/testing/contributionOf';
import { ONE_OFF_BILL } from '@/shared/testing/entryFixtures';
import { overduePaymentOf } from '@/shared/testing/overduePaymentOf';
import { ownedPaymentOf } from '@/shared/testing/ownedPaymentOf';
import { unownedPaymentOf } from '@/shared/testing/unownedPaymentOf';

import { isOwnedPayment } from './isOwnedPayment';

describe('isOwnedPayment', () => {
  it('Should be true for the payment of the month and the payment of an overdue bill', () => {
    expect(isOwnedPayment(ownedPaymentOf())).toBe(true);
    expect(isOwnedPayment(overduePaymentOf())).toBe(true);
  });

  it('Should be false for the payment with no owner, the one-off bill and the contribution', () => {
    expect(isOwnedPayment(unownedPaymentOf())).toBe(false);
    expect(isOwnedPayment(ONE_OFF_BILL)).toBe(false);
    expect(isOwnedPayment(contributionOf('2026-10_rent', 'bruno', 1000))).toBe(false);
  });
});
