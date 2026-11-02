import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import { dueDateInMonth } from '@/shared/utils/recurringBill/dueDateInMonth';

/**
 * Os campos que o pagamento do mês copia da conta, com dono ou sem: o nome, a tag (sem tag, sem o campo), o dia do
 * vencimento naquele mês e o previsto. As cópias deixam o mês igual quando a conta muda ou é excluída.
 */
export function paymentCopiesOf(bill: IRecurringBill, month: string) {
  return {
    kind: 'recurringPayment',
    month,
    recurringBillId: bill.id,
    name: bill.name,
    ...(bill.tagId && { tagId: bill.tagId }),
    dueDay: Number(dueDateInMonth(bill.dayOfMonth, month).slice(8)),
    expectedAmountCents: bill.expectedAmountCents,
  } as const;
}
