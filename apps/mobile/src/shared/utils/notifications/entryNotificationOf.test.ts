import { entryNotificationOf } from './entryNotificationOf';

describe('entryNotificationOf', () => {
  it('Should say who paid the bill of the month and open the payment', () => {
    const notification = entryNotificationOf(
      { kind: 'recurringPayment', id: '2026-11_water', month: '2026-11', name: 'Água', amountCents: 9800 },
      'Bruno',
    );

    expect(notification).toEqual({
      title: 'Bruno pagou a Água',
      body: 'Novembro · R$ 98,00',
      url: '/entries/2026-11_water',
    });
  });

  it('Should write the overdue month of the bill, not the month of the payment, and open the payment', () => {
    const notification = entryNotificationOf(
      { kind: 'overduePayment', id: 'overdue-id', month: '2026-10', name: 'Água', amountCents: 9400 },
      'Bruno',
    );

    expect(notification).toEqual({
      title: 'Bruno pagou a Água',
      body: 'Outubro · R$ 94,00',
      url: '/entries/overdue-id',
    });
  });

  it('Should show the name of a one-off bill where the other payments show the month', () => {
    const notification = entryNotificationOf(
      { kind: 'oneOffBill', id: 'one-off-id', name: 'Farmácia', amountCents: 5490 },
      'Bruno',
    );

    expect(notification).toEqual({
      title: 'Bruno registrou uma conta avulsa',
      body: 'Farmácia · R$ 54,90',
      url: '/entries/one-off-id',
    });
  });

  it('Should open the entry that receives a contribution, not the contribution', () => {
    const notification = entryNotificationOf(
      { kind: 'contribution', targetId: '2026-11_internet', month: '2026-11', name: 'Internet', amountCents: 4000 },
      'Bruno',
    );

    expect(notification).toEqual({
      title: 'Bruno contribuiu na Internet',
      body: 'Novembro · R$ 40,00',
      url: '/entries/2026-11_internet',
    });
  });

  it.each([
    ['2026-01', 'Janeiro'],
    ['2026-03', 'Março'],
    ['2026-12', 'Dezembro'],
  ])('Should start the month of %s with a capital: %s', (month, expected) => {
    const { body } = entryNotificationOf(
      { kind: 'recurringPayment', id: `${month}_water`, month, name: 'Água', amountCents: 100 },
      'Bruno',
    );

    expect(body).toBe(`${expected} · R$ 1,00`);
  });
});
