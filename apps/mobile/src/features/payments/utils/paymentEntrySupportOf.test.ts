import { contributionOf } from '@/shared/testing/contributionOf';
import { ownedPaymentOf } from '@/shared/testing/ownedPaymentOf';
import { personOf } from '@/shared/testing/personOf';
import { unownedPaymentOf } from '@/shared/testing/unownedPaymentOf';
import type { IEntry } from '@/shared/types/entry/Entry';
import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';
import { memberPartsOf } from '@/shared/utils/entry/memberPartsOf';

import { chipSelectionOf } from './chipSelectionOf';
import { memberChoicesOf } from './memberChoicesOf';
import { paymentEntrySupportOf } from './paymentEntrySupportOf';
import { paymentRowsOf } from './paymentRowsOf';

const people = [personOf('ana', 'Ana'), personOf('bruno', 'Bruno'), personOf('carla', 'Carla')];
// Quem está logado é a Ana: o chip dela é o "Você".
const choices = memberChoicesOf(people, 'ana');
const EVERYONE = ['ana', 'bruno', 'carla'];

const payment = ownedPaymentOf({ amountCents: 180000, expectedAmountCents: 180000, paidOn: '2026-10-25' });
// A Luz que saiu diferente do previsto.
const offExpected = ownedPaymentOf({ amountCents: 18735, expectedAmountCents: 11990, paidOn: '2026-10-25' });
const oneOff: IOwnedEntry = {
  id: 'a',
  kind: 'oneOffBill',
  month: '2026-10',
  name: 'Conserto',
  amountCents: 35000,
  tagId: 'casa',
  paidBy: 'ana',
  receiptFileId: 'f1',
  date: '2026-10-12',
};

/** O detalhe de cada linha dos lançamentos, com os chips de `markedUids` marcados. */
const supportsOf = (entries: IEntry[], markedUids: string[]) => {
  const selection = chipSelectionOf(new Set(markedUids), choices, 'ana');
  const rows = paymentRowsOf(memberPartsOf(entries), selection.rowUids);
  return rows.map((row) => paymentEntrySupportOf(row, people, selection));
};

describe('paymentEntrySupportOf', () => {
  describe('The part of who paid', () => {
    // A tag está no cabeçalho do grupo: a linha não a repete.
    it('Should write only the payment date of a payment, without the tag, under a single chip', () => {
      expect(supportsOf([payment], ['ana'])).toEqual(['pago em 25/10']);
      expect(supportsOf([{ ...payment, paidBy: 'bruno' } as IOwnedEntry], ['bruno'])).toEqual(['pago em 25/10']);
    });

    it('Should add the expected amount when the paid amount differs', () => {
      expect(supportsOf([offExpected], ['ana'])).toEqual(['pago em 25/10 · previsto R$ 119,90']);
    });

    it('Should write the date and the one-off mark of a one-off bill, without the tag', () => {
      expect(supportsOf([oneOff], ['ana'])).toEqual(['12/10 · avulsa']);
    });

    // Com várias pessoas marcadas, nenhum chip diz de quem é a linha: a linha diz.
    it('Should add who paid when several people are marked, before the expected amount', () => {
      expect(supportsOf([offExpected], EVERYONE)).toEqual(['pago em 25/10 · Ana · previsto R$ 119,90']);
      expect(supportsOf([oneOff], EVERYONE)).toEqual(['12/10 · avulsa · Ana']);
      expect(supportsOf([payment], ['ana', 'bruno'])).toEqual(['pago em 25/10 · Ana']);
    });
  });

  describe('A payer part below the amount paid, because of contributions', () => {
    const light = [contributionOf(offExpected.id, 'bruno', 4000), offExpected];

    it('Should say "sua parte" under the chip of who is signed in, without the expected amount', () => {
      expect(supportsOf(light, ['ana'])).toEqual(['pago em 25/10 · sua parte']);
    });

    it('Should say "parte de" and the name when several people are marked', () => {
      expect(supportsOf(light, EVERYONE)).toEqual(['pago em 25/10 · parte de Ana', 'contribuição em 10/10 · Bruno']);
    });

    it('Should say "parte de" and the name under the chip of another member alone', () => {
      const brunoLight = { ...offExpected, paidBy: 'bruno' } as IOwnedEntry;

      expect(supportsOf([contributionOf(brunoLight.id, 'carla', 4000), brunoLight], ['bruno'])).toEqual([
        'pago em 25/10 · parte de Bruno',
      ]);
    });

    it('Should say the part of a one-off bill too', () => {
      expect(supportsOf([contributionOf(oneOff.id, 'bruno', 3000), oneOff], ['ana'])).toEqual([
        '12/10 · avulsa · sua parte',
      ]);
    });
  });

  describe('A contribution', () => {
    const light = [contributionOf(offExpected.id, 'bruno', 4000), offExpected];

    it('Should write the registration date and who got the money under a single chip', () => {
      expect(supportsOf(light, ['bruno'])).toEqual(['contribuição em 10/10 · para Ana']);
    });

    it('Should write who contributed instead when several people are marked', () => {
      expect(supportsOf(light, ['bruno', 'carla'])).toEqual(['contribuição em 10/10 · Bruno']);
    });

    // O pagamento sem dono não tem para quem a contribuição vai.
    it('Should write only the date under a single chip when the bill has no payer', () => {
      const rent = unownedPaymentOf({ id: '2026-10_rent', dueDay: 5 });

      expect(supportsOf([contributionOf(rent.id, 'carla', 1000), rent], ['carla'])).toEqual(['contribuição em 10/10']);
    });

    // Cada contribuição é uma linha; a primeira é a mais antiga, a do Bruno.
    it('Should name who contributed in each row of a bill paid only by contributions, when everyone is marked', () => {
      const rent = unownedPaymentOf({ id: '2026-10_rent', dueDay: 5 });

      expect(
        supportsOf([contributionOf(rent.id, 'carla', 1000), contributionOf(rent.id, 'bruno', 1000), rent], EVERYONE),
      ).toEqual(['contribuição em 10/10 · Bruno', 'contribuição em 10/10 · Carla']);
    });
  });
});
