import { contributionOf } from '@/shared/testing/contributionOf';
import { ownedPaymentOf } from '@/shared/testing/ownedPaymentOf';
import { unownedPaymentOf } from '@/shared/testing/unownedPaymentOf';
import type { IEntry } from '@/shared/types/entry/Entry';
import { memberPartsOf } from '@/shared/utils/entry/memberPartsOf';
import { sumCents } from '@/shared/utils/entry/sumCents';

import { paymentRowsOf } from './paymentRowsOf';

// A Luz de R$ 187,35 da Ana, com R$ 40,00 do Bruno; o Aluguel de R$ 2.000,00 do Bruno, sem contribuições; e a Água,
// sem dono, com R$ 50,00 da Carla. O serviço do mês entrega o mais novo primeiro: as contribuições, registradas depois
// da conta, vêm antes dela.
const light = ownedPaymentOf({ id: '2026-10_light', name: 'Luz', amountCents: 18735, expectedAmountCents: 21000 });
const brunoOnLight = contributionOf(light.id, 'bruno', 4000);
const rent = ownedPaymentOf({ paidBy: 'bruno' });
const water = unownedPaymentOf({ id: '2026-10_water', name: 'Água' });
const carlaOnWater = contributionOf(water.id, 'carla', 5000);
const month = [brunoOnLight, light, rent, carlaOnWater, water];

/** As linhas dos lançamentos para as pessoas marcadas (`null`, todas), como a página as monta. */
const rowsOf = (entries: IEntry[], selectedUids: ReadonlySet<string> | null) =>
  paymentRowsOf(memberPartsOf(entries), selectedUids);

/** As linhas como `conta de uid: valor`. */
const summaryOf = (rows: ReturnType<typeof paymentRowsOf>) =>
  rows.map(({ entry, uid, amountCents }) => `${entry.name} de ${uid}: ${amountCents}`);

describe('paymentRowsOf', () => {
  it('Should show the Luz in two rows, the payer part and the contribution, when both people are selected', () => {
    const rows = rowsOf(month, new Set(['ana', 'bruno']));

    expect(summaryOf(rows)).toEqual(['Luz de ana: 14735', 'Luz de bruno: 4000', 'Aluguel de bruno: 200000']);
    expect(rows.map(({ entry }) => entry)).toEqual([light, light, rent]);
    expect(rows.map(({ contribution }) => contribution)).toEqual([null, brunoOnLight, null]);
  });

  it("Should count only the payer's part, the amount minus the contributions, when only the payer is selected", () => {
    expect(summaryOf(rowsOf(month, new Set(['ana'])))).toEqual(['Luz de ana: 14735']);
  });

  it('Should show only the contribution of a bill the selected person did not pay', () => {
    const rows = rowsOf(month, new Set(['bruno']));

    expect(summaryOf(rows)).toEqual(['Luz de bruno: 4000', 'Aluguel de bruno: 200000']);
    expect(rows[0].entry).toBe(light);
    expect(rows[0].contribution).toBe(brunoOnLight);
  });

  it('Should show the bill paid by contributions only to who contributed, never as anyone payment', () => {
    expect(summaryOf(rowsOf(month, new Set(['carla'])))).toEqual(['Água de carla: 5000']);
    expect(rowsOf([water], new Set(['ana', 'bruno', 'carla']))).toEqual([]);
  });

  it('Should add up, with everybody selected, to what the family paid in the month', () => {
    const rows = rowsOf(month, new Set(['ana', 'bruno', 'carla']));

    // R$ 187,35 da Luz, R$ 2.000,00 do Aluguel e R$ 50,00 da Água.
    expect(sumCents(rows)).toBe(223735);
  });

  describe('Without a selection of people', () => {
    // A Dora saiu da família, mas a contribuição dela segue no mês: sem lista de pessoas que a filtre, a linha fica.
    it('Should show the part of everybody, even of who is no longer in the list of people', () => {
      const doraOnLight = contributionOf(light.id, 'dora', 1000);

      const rows = rowsOf([doraOnLight, brunoOnLight, light, rent, carlaOnWater, water], null);

      expect(summaryOf(rows)).toEqual([
        'Luz de ana: 13735',
        'Luz de bruno: 4000',
        'Luz de dora: 1000',
        'Aluguel de bruno: 200000',
        'Água de carla: 5000',
      ]);
      expect(sumCents(rows)).toBe(223735);
    });
  });

  it('Should show nothing for people who are not selected', () => {
    expect(rowsOf(month, new Set())).toEqual([]);
    expect(rowsOf(month, new Set(['dora']))).toEqual([]);
  });

  describe('A part of zero or below', () => {
    // A Luz de R$ 187,35 da Ana, coberta por R$ 100,00 do Bruno e R$ 87,35 da Carla: a parte da Ana é zero.
    const brunoCovering = contributionOf(light.id, 'bruno', 10000);
    const carlaCovering = contributionOf(light.id, 'carla', 8735);
    const covered = [carlaCovering, brunoCovering, light];
    const everybody = new Set(['ana', 'bruno', 'carla']);

    // A pessoa registrou o pagamento e o edita ou apaga por essa linha; ela não muda nenhuma soma.
    it("Should keep the payer's part at zero when the contributions cover the whole bill", () => {
      expect(summaryOf(rowsOf(covered, everybody))).toEqual([
        'Luz de ana: 0',
        'Luz de bruno: 10000',
        'Luz de carla: 8735',
      ]);
      expect(summaryOf(rowsOf(covered, new Set(['ana'])))).toEqual(['Luz de ana: 0']);
    });

    // As regras não impedem contribuições acima do pago; a parte negativa fica para a soma bater com o pago.
    it('Should show a payer part below zero, so the rows still add up to the amount paid', () => {
      const overpaid = [contributionOf(light.id, 'bruno', 20000), light];

      const rows = rowsOf(overpaid, new Set(['ana', 'bruno']));

      expect(summaryOf(rows)).toEqual(['Luz de ana: -1265', 'Luz de bruno: 20000']);
      expect(sumCents(rows)).toBe(18735);
    });
  });

  describe('Order', () => {
    // Entregues do mais novo para o mais antigo: a da Carla é a mais nova, a do Bruno a mais antiga.
    const carlaOnLight = contributionOf(light.id, 'carla', 2000);

    it('Should put the payer part first and then the contributions, from the oldest to the newest', () => {
      const rows = rowsOf([carlaOnLight, brunoOnLight, light], new Set(['carla', 'bruno', 'ana']));

      expect(summaryOf(rows)).toEqual(['Luz de ana: 12735', 'Luz de bruno: 4000', 'Luz de carla: 2000']);
    });

    it('Should keep the order the bills came in, whatever the order of the selection', () => {
      const rows = rowsOf([rent, light], new Set(['ana', 'bruno']));

      expect(summaryOf(rows)).toEqual(['Aluguel de bruno: 200000', 'Luz de ana: 18735']);
    });

    // A contribuição, a mais nova de todas, vem antes das contas na entrega: a linha dela vai para o lugar da conta.
    it('Should put a lone contribution in the place of its bill, not where the contribution itself came', () => {
      const rows = rowsOf([brunoOnLight, rent, light], new Set(['bruno']));

      expect(summaryOf(rows)).toEqual(['Aluguel de bruno: 200000', 'Luz de bruno: 4000']);
    });
  });

  describe('Keys', () => {
    it('Should identify a contribution by its id and the part of who paid by the bill and the person', () => {
      const rows = rowsOf(month, new Set(['ana', 'bruno']));

      expect(rows.map(({ key }) => key)).toEqual(['2026-10_light:ana', brunoOnLight.id, '2026-10_rent:bruno']);
    });

    it('Should give every row its own key, even for two contributions of the same person to the same bill', () => {
      const again = contributionOf(light.id, 'bruno', 1000);

      const rows = rowsOf([again, brunoOnLight, light, rent], new Set(['ana', 'bruno']));

      // A Luz da Ana, as duas do Bruno nela e o Aluguel do Bruno.
      const keys = rows.map(({ key }) => key);
      expect(keys).toHaveLength(4);
      expect(new Set(keys).size).toBe(4);
    });
  });
});
