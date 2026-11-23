import type { IOverduePaymentEntry } from '@/shared/types/entry/OverduePaymentEntry';

// Os lançamentos dos testes de unidade do pagamento atrasado, em novembro de 2026.

/** O pagamento atrasado, por padrão a Água de outubro que a Ana pagou em 5 de novembro: R$ 90,00 pagos de R$ 90,00 previstos. */
export function overduePaymentOf(overrides: Partial<IOverduePaymentEntry> = {}): IOverduePaymentEntry {
  return {
    id: 'overdue-water',
    kind: 'overduePayment',
    month: '2026-11',
    billMonth: '2026-10',
    name: 'Água',
    tagId: 'casa',
    recurringBillId: 'water',
    dueDay: 20,
    expectedAmountCents: 9000,
    date: null,
    paidOn: '2026-11-05',
    paidBy: 'ana',
    amountCents: 9000,
    receiptFileId: 'f-water',
    ...overrides,
  };
}
