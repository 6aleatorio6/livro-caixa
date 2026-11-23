import { ownedPaymentOf } from '@/shared/testing/ownedPaymentOf';
import { overduePaymentOf } from '@/shared/testing/overduePaymentOf';

import { homeEntryBadgeOf } from './homeEntryBadgeOf';

describe('homeEntryBadgeOf', () => {
  it('Should give the overdue payment a grey badge with the month of the bill', () => {
    expect(homeEntryBadgeOf(overduePaymentOf({ billMonth: '2026-10' }))).toEqual({
      label: 'De outubro',
      background: 'surfaceContainerHigh',
      color: 'onSurfaceVariant',
    });
  });

  it('Should give no badge to a payment of the month', () => {
    expect(homeEntryBadgeOf(ownedPaymentOf())).toBeUndefined();
  });
});
