import { contributionOf } from '@/shared/testing/contributionOf';
import { ownedPaymentOf } from '@/shared/testing/ownedPaymentOf';
import { unownedPaymentOf } from '@/shared/testing/unownedPaymentOf';

import { memberPartsOf } from './memberPartsOf';

/** As partes como `uid: centavos`, somadas por membro, para comparar sem a ordem. */
const totalsOf = (parts: ReturnType<typeof memberPartsOf>) =>
  parts.reduce<Record<string, number>>(
    (totals, { uid, amountCents }) => ({ ...totals, [uid]: (totals[uid] ?? 0) + amountCents }),
    {},
  );

describe('memberPartsOf', () => {
  it('Should give the payer the amount minus the contributions', () => {
    const internet = ownedPaymentOf({ id: '2026-10_internet', amountCents: 12000 });

    const parts = memberPartsOf([
      internet,
      contributionOf(internet.id, 'bruno', 4000),
      contributionOf(internet.id, 'carla', 2000),
    ]);

    expect(totalsOf(parts)).toEqual({ ana: 6000, bruno: 4000, carla: 2000 });
  });

  it('Should give a member who contributed and then paid both parts', () => {
    const rent = ownedPaymentOf();

    const parts = memberPartsOf([rent, contributionOf(rent.id, 'ana', 50000), contributionOf(rent.id, 'bruno', 50000)]);

    expect(totalsOf(parts)).toEqual({ ana: 150000, bruno: 50000 });
  });

  it('Should not count the unowned payment for any member', () => {
    const electricity = unownedPaymentOf();

    const parts = memberPartsOf([
      electricity,
      contributionOf(electricity.id, 'ana', 10000),
      contributionOf(electricity.id, 'bruno', 13000),
    ]);

    expect(totalsOf(parts)).toEqual({ ana: 10000, bruno: 13000 });
  });

  it('Should keep each part in the entry it belongs to', () => {
    const rent = ownedPaymentOf();
    const internet = ownedPaymentOf({ id: '2026-10_internet', amountCents: 12000, paidBy: 'bruno' });
    const contribution = contributionOf(rent.id, 'bruno', 50000);

    const parts = memberPartsOf([rent, internet, contribution]);

    expect(parts).toEqual([
      { entry: rent, uid: 'ana', amountCents: 150000, contribution: null },
      { entry: rent, uid: 'bruno', amountCents: 50000, contribution },
      { entry: internet, uid: 'bruno', amountCents: 12000, contribution: null },
    ]);
  });

  it('Should leave out a contribution whose entry is not in the list', () => {
    expect(memberPartsOf([contributionOf('2026-10_gone', 'bruno', 4000)])).toEqual([]);
  });
});
