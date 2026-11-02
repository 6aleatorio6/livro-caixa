import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import { contributionOf } from '@/shared/testing/contributionOf';
import { ownedPaymentOf } from '@/shared/testing/ownedPaymentOf';
import { unownedPaymentOf } from '@/shared/testing/unownedPaymentOf';
import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';

import { homeEntrySupportOf } from './homeEntrySupportOf';

const person = (uid: string, name: string): IAllowedEmailListItem => ({
  email: `${uid}@example.com`,
  name,
  uid,
  isAdmin: false,
  hasEntries: true,
});
const people = [person('ana', 'Ana'), person('bruno', 'Bruno'), person('carla', 'Carla')];

const payment = ownedPaymentOf({ amountCents: 180000, expectedAmountCents: 180000 });

const oneOff: IOwnedEntry = {
  id: 'a',
  kind: 'oneOffBill',
  month: '2026-10',
  name: 'Conserto',
  amountCents: 35000,
  tagId: 'casa',
  paidBy: 'bruno',
  receiptFileId: 'f1',
  date: '2026-10-12',
};

describe('homeEntrySupportOf', () => {
  it('Should write the due day and who paid a payment, without the tag', () => {
    expect(homeEntrySupportOf(payment, [payment], people)).toBe('dia 5 · Ana');
  });

  it('Should add the expected amount when the paid amount differs', () => {
    const electricity = { ...payment, amountCents: 18735, expectedAmountCents: 21000 };

    expect(homeEntrySupportOf(electricity, [electricity], people)).toBe('dia 5 · Ana · previsto R$ 210,00');
  });

  it('Should write the date, the one-off mark and who registered a one-off bill, without the tag', () => {
    expect(homeEntrySupportOf(oneOff, [oneOff], people)).toBe('12/10 · avulsa · Bruno');
  });

  it('Should say how much came from contributions and from whom, in place of the expected amount', () => {
    const electricity = { ...payment, amountCents: 18735, expectedAmountCents: 21000 };
    // Como a leitura do mês os entrega: a contribuição mais nova (a da Carla) primeiro.
    const entries = [
      contributionOf(electricity.id, 'carla', 2000),
      contributionOf(electricity.id, 'bruno', 2000),
      electricity,
    ];

    expect(homeEntrySupportOf(electricity, entries, people)).toBe('dia 5 · Ana · R$ 40,00 de Bruno e Carla');
  });

  it('Should add the contributions to a one-off bill', () => {
    expect(homeEntrySupportOf(oneOff, [oneOff, contributionOf(oneOff.id, 'carla', 3000)], people)).toBe(
      '12/10 · avulsa · Bruno · R$ 30,00 de Carla',
    );
  });

  it('Should name who contributed to a bill paid only by contributions', () => {
    const rent = unownedPaymentOf({ id: '2026-10_rent', dueDay: 5 });
    const entries = [contributionOf(rent.id, 'carla', 100000), contributionOf(rent.id, 'bruno', 100000), rent];

    expect(homeEntrySupportOf(rent, entries, people)).toBe('dia 5 · Bruno e Carla');
  });
});
