import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import { formatCents } from '@/shared/utils/format/formatCents';
import { pluralize } from '@/shared/utils/format/pluralize';
import { totalExpectedCents } from '@/shared/utils/recurringBill/totalExpectedCents';

/** O apoio da linha "Contas recorrentes": "5 contas · R$ 2.677,90 por mês"; sem contas, "Nenhuma conta". */
export function recurringBillsSupport(bills: IRecurringBill[]) {
  if (bills.length === 0) {
    return 'Nenhuma conta';
  }

  return `${pluralize(bills.length, 'conta', 'contas')} · ${formatCents(totalExpectedCents(bills))} por mês`;
}
