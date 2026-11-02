import { contributionOf } from '@/shared/testing/contributionOf';
import { ownedPaymentOf } from '@/shared/testing/ownedPaymentOf';

import { contributionsOf } from './contributionsOf';

describe('contributionsOf', () => {
  it('Should give the contributions of the entry from the oldest to the newest, leaving out the others', () => {
    const rent = ownedPaymentOf();
    const older = contributionOf(rent.id, 'bruno', 1000);
    const newer = contributionOf(rent.id, 'carla', 2000);

    // A leitura do mês traz a mais nova primeiro.
    expect(contributionsOf(rent.id, [newer, contributionOf('2026-10_other', 'ana', 500), older, rent])).toEqual([
      older,
      newer,
    ]);
  });
});
