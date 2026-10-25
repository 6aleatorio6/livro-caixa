import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';

/** A soma dos valores previstos das contas, em centavos: o "Previsto por mês". */
export function totalExpectedCents(bills: IRecurringBill[]) {
  return bills.reduce((total, bill) => total + bill.expectedAmountCents, 0);
}
