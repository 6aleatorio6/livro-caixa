import { contributionOf } from '@/shared/testing/contributionOf';
import { ownedPaymentOf } from '@/shared/testing/ownedPaymentOf';
import { unownedPaymentOf } from '@/shared/testing/unownedPaymentOf';
import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import type { IEntry } from '@/shared/types/entry/Entry';
import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';

import { paymentEntrySupportOf } from './paymentEntrySupportOf';
import { paymentRowsOf } from './paymentRowsOf';

const person = (uid: string, name: string): IAllowedEmailListItem => ({
  email: `${uid}@example.com`,
  name,
  uid,
  isAdmin: false,
  hasEntries: true,
});
const people = [person('ana', 'Ana'), person('bruno', 'Bruno'), person('carla', 'Carla')];

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

/** O detalhe da primeira linha dos lançamentos, no chip de `chosenUid` (`null` em "Todos", com todas as pessoas). */
const supportOf = (entries: IEntry[], chosenUid: string | null) =>
  paymentEntrySupportOf(
    paymentRowsOf(entries, new Set(chosenUid === null ? ['ana', 'bruno', 'carla'] : [chosenUid]))[0],
    people,
    chosenUid,
  );

describe('paymentEntrySupportOf', () => {
  // A tag está no cabeçalho do grupo: a linha não a repete.
  it('Should write only the payment date of a payment, without the tag, under the chip of who paid', () => {
    expect(supportOf([payment], 'ana')).toBe('pago em 25/10');
  });

  it('Should add the expected amount when the paid amount differs', () => {
    expect(supportOf([offExpected], 'ana')).toBe('pago em 25/10 · previsto R$ 119,90');
  });

  it('Should write the date and the one-off mark of a one-off bill, without the tag', () => {
    expect(supportOf([oneOff], 'ana')).toBe('12/10 · avulsa');
  });

  // No chip "Todos", nenhum chip diz de quem é o lançamento: a linha diz.
  it('Should add who paid under Todos, before the expected amount', () => {
    expect(supportOf([offExpected], null)).toBe('pago em 25/10 · Ana · previsto R$ 119,90');
    expect(supportOf([oneOff], null)).toBe('12/10 · avulsa · Ana');
  });

  it('Should say who paid the bill under the chip of who only contributed', () => {
    expect(supportOf([payment, contributionOf(payment.id, 'bruno', 4000)], 'bruno')).toBe('paga por Ana em 25/10');
    expect(supportOf([oneOff, contributionOf(oneOff.id, 'bruno', 3000)], 'bruno')).toBe('12/10 · avulsa · Ana');
  });

  // Cada contribuição é uma linha; a primeira é a mais antiga, a do Bruno.
  it('Should name who contributed in the row of a bill paid only by contributions', () => {
    const rent = unownedPaymentOf({ id: '2026-10_rent', dueDay: 5 });

    expect(
      supportOf([contributionOf(rent.id, 'carla', 1000), contributionOf(rent.id, 'bruno', 1000), rent], null),
    ).toBe('dia 5 · contribuição de Bruno');
  });
});
