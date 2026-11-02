import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';

// Os lançamentos dos testes de unidade das contribuições, em outubro de 2026, com os valores dos exemplos da página
// Contribuição.

/** O pagamento com dono, por padrão o Aluguel da Ana: R$ 2.000,00 pagos de R$ 2.000,00 previstos. */
export function ownedPaymentOf(
  overrides: Partial<Extract<IOwnedEntry, { kind: 'recurringPayment' }>> = {},
): IOwnedEntry {
  return {
    id: '2026-10_rent',
    kind: 'recurringPayment',
    month: '2026-10',
    name: 'Aluguel',
    tagId: 'casa',
    recurringBillId: 'rent',
    dueDay: 5,
    expectedAmountCents: 200000,
    date: null,
    paidOn: '2026-10-05',
    paidBy: 'ana',
    amountCents: 200000,
    receiptFileId: 'f-rent',
    ...overrides,
  };
}
