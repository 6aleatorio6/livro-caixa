import { contributionOf } from '@/shared/testing/contributionOf';
import { ownedPaymentOf } from '@/shared/testing/ownedPaymentOf';
import { unownedPaymentOf } from '@/shared/testing/unownedPaymentOf';

import { paymentRowsOf } from './paymentRowsOf';

// A Luz de R$ 187,35 da Ana, com R$ 40,00 do Bruno; o Aluguel de R$ 2.000,00 do Bruno, sem contribuições; e a Água,
// sem dono, com R$ 50,00 da Carla.
const light = ownedPaymentOf({ id: '2026-10_light', name: 'Luz', amountCents: 18735, expectedAmountCents: 21000 });
const brunoOnLight = contributionOf(light.id, 'bruno', 4000);
const rent = ownedPaymentOf({ paidBy: 'bruno' });
const water = unownedPaymentOf({ id: '2026-10_water', name: 'Água' });
const carlaOnWater = contributionOf(water.id, 'carla', 5000);
const month = [brunoOnLight, light, rent, carlaOnWater, water];

/** As linhas como `conta: valor mostrado / valor contado`. */
const summaryOf = (rows: ReturnType<typeof paymentRowsOf>) =>
  rows.map(({ entry, amountCents, countedCents }) => `${entry.name}: ${amountCents}/${countedCents}`);

describe('paymentRowsOf', () => {
  it('Should show each bill once, with the amount paid, under Todos', () => {
    expect(summaryOf(paymentRowsOf(month, null))).toEqual([
      'Luz: 18735/18735',
      'Aluguel: 200000/200000',
      'Água: 5000/5000',
    ]);
  });

  it("Should count only the payer's part, the amount minus the contributions, under the payer's chip", () => {
    expect(summaryOf(paymentRowsOf(month, 'ana'))).toEqual(['Luz: 18735/14735']);
  });

  it("Should show a contribution as the member's part of the payer's entry", () => {
    const rows = paymentRowsOf(month, 'bruno');

    expect(summaryOf(rows)).toEqual(['Luz: 18735/4000', 'Aluguel: 200000/200000']);
    expect(rows[0].parts.map(({ uid, amountCents }) => `${uid}: ${amountCents}`)).toEqual([
      'ana: 14735',
      'bruno: 4000',
    ]);
  });

  it("Should show the bill paid by contributions only to who contributed, never as anyone's payment", () => {
    expect(summaryOf(paymentRowsOf(month, 'carla'))).toEqual(['Água: 5000/5000']);
    expect(paymentRowsOf([water], null)).toEqual([]);
  });
});
