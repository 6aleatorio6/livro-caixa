import type { IUnownedPaymentEntry } from '@/shared/types/entry/UnownedPaymentEntry';

// Os lançamentos dos testes de unidade das contribuições, em outubro de 2026, com os valores dos exemplos da página
// Contribuição.

/** O pagamento sem dono, por padrão a Luz de R$ 200,00 previstos. */
export function unownedPaymentOf(overrides: Partial<IUnownedPaymentEntry> = {}): IUnownedPaymentEntry {
  return {
    id: '2026-10_electricity',
    kind: 'recurringPayment',
    month: '2026-10',
    name: 'Luz',
    tagId: 'servicos',
    recurringBillId: 'electricity',
    dueDay: 20,
    expectedAmountCents: 20000,
    date: null,
    paidOn: '2026-10-08',
    paidBy: null,
    amountCents: null,
    receiptFileId: null,
    ...overrides,
  };
}
