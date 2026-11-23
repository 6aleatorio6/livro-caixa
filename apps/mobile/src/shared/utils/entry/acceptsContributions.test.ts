import { ONE_OFF_BILL } from '@/shared/testing/entryFixtures';
import { overduePaymentOf } from '@/shared/testing/overduePaymentOf';
import { ownedPaymentOf } from '@/shared/testing/ownedPaymentOf';

import { acceptsContributions } from './acceptsContributions';

describe('acceptsContributions', () => {
  it('Should accept contributions on the payment of the month and on the one-off bill', () => {
    expect(acceptsContributions(ownedPaymentOf())).toBe(true);
    expect(acceptsContributions(ONE_OFF_BILL)).toBe(true);
  });

  it('Should refuse contributions on the payment of an overdue bill', () => {
    expect(acceptsContributions(overduePaymentOf())).toBe(false);
  });
});
